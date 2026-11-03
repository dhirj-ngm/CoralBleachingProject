#!/usr/bin/env python3
"""Audit external labels, benchmark image-level predictions, and estimate six videos."""

import csv
import hashlib
import json
import platform
import sys
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "generated/external"
OUT = ROOT / "generated/comparison"
SONAIN = DATA / "sonainjamil-v3/Train"
ROBO = DATA / "shrushti21-v1/Coral Bleaching.v3i.yolov8"
VENCER = DATA / "vencerlanz09-v1"
WEIGHTS = DATA / "original-best.pt"
PHASE1 = ROOT / "data/phase1/frame_manifest.csv"
HSV_SIZE = 640
YOLO_IMGSZ = 640
YOLO_CONF = 0.25


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def write_csv(path, rows):
    if not rows:
        raise ValueError(f"No rows for {path}")
    with path.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)


def dhash(path):
    with Image.open(path) as im:
        gray = np.asarray(im.convert("L").resize((9, 8)))
    return sum(int(bit) << i for i, bit in enumerate((gray[:, 1:] > gray[:, :-1]).flat))


def external_inventory():
    # The supplied Roboflow train/valid/test directories contain augmented
    # variants of the same source across splits. Ignore that split entirely.
    groups = defaultdict(list)
    for supplied_split in ("train", "valid", "test"):
        for image in sorted((ROBO / supplied_split / "images").glob("*.jpg")):
            source_id = image.name.split(".rf.")[0]
            label_path = ROBO / supplied_split / "labels" / (image.stem + ".txt")
            assert label_path.exists(), label_path
            labels = set()
            for line in label_path.read_text().splitlines():
                tokens = line.split()
                assert len(tokens) == 5 and tokens[0] in {"0", "1"}, label_path
                assert all(0 <= float(value) <= 1 for value in tokens[1:]), label_path
                labels.add(int(tokens[0]))
            groups[source_id].append((supplied_split, image, labels))
    sonain = list(SONAIN.rglob("*.png"))
    sonain_hashes = [(path, dhash(path)) for path in sonain]
    records = []
    for source_id, variants in sorted(groups.items()):
        classes = variants[0][2]
        assert classes and all(v[2] == classes for v in variants), source_id
        variant = min(variants, key=lambda v: (v[0], v[1].name))
        split, image, _ = variant
        fingerprint = dhash(image)
        distance, near = min(((fingerprint ^ h).bit_count(), str(path.relative_to(DATA)))
                             for path, h in sonain_hashes)
        records.append({
            "source_id": source_id, "image_path": image.relative_to(ROOT).as_posix(),
            "image_sha256": digest(image), "provided_split": split,
            "provided_classes": "+".join(map(str, sorted(classes))),
            "variant_count": len(variants),
            "provided_splits": "+".join(sorted({v[0] for v in variants})),
            "nearest_sonain_dhash_distance": distance, "nearest_sonain_path": near,
            "exclude_overlap": int(distance <= 8),
            "benchmark_eligible": int(len(classes) == 1 and distance > 8),
            "image_label_bleached": int(classes == {0}) if len(classes) == 1 else "",
        })
    assert len(records) == 294 and len(sonain) == 342
    write_csv(OUT / "roboflow_source_audit.csv", records)
    # Direct image-level labels from a separate Flickr classification archive.
    # Collapse near-identical test images and reject contradictory class labels.
    paths = sorted(p for p in VENCER.rglob("*") if p.suffix.lower() in {".jpg", ".png"})
    assert len(paths) == 923
    hashes = [dhash(path) for path in paths]
    parent = list(range(len(paths)))

    def root(index):
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    for i in range(len(paths)):
        for j in range(i + 1, len(paths)):
            if (hashes[i] ^ hashes[j]).bit_count() <= 4:
                parent[root(j)] = root(i)
    groups = defaultdict(list)
    for index, path in enumerate(paths):
        groups[root(index)].append((path, hashes[index]))
    candidates = []
    for members in groups.values():
        labels = {path.parent.name for path, _ in members}
        path, fingerprint = min(members, key=lambda entry: str(entry[0]))
        distance, near = min(((fingerprint ^ h).bit_count(), str(p.relative_to(DATA)))
                             for p, h in sonain_hashes)
        candidates.append({
            "source_id": path.name, "image_path": path.relative_to(ROOT).as_posix(),
            "image_sha256": digest(path),
            "label_folders": "+".join(sorted(labels)), "near_duplicate_group_size": len(members),
            "nearest_sonain_dhash_distance": distance, "nearest_sonain_path": near,
            "exclude_conflicting_label": int(len(labels) != 1),
            "exclude_overlap": int(distance <= 8),
            "benchmark_eligible": int(len(labels) == 1 and distance > 8),
            "image_label_bleached": int(labels == {"bleached_corals"}) if len(labels) == 1 else "",
        })
    candidates.sort(key=lambda r: r["image_path"])
    write_csv(OUT / "external_source_audit.csv", candidates)
    return [r for r in candidates if r["benchmark_eligible"]]


def hsv_score(path):
    import cv2
    image = cv2.imread(str(path))
    if image is None:
        raise ValueError(f"Unreadable image: {path}")
    height, width = image.shape[:2]
    if max(height, width) > HSV_SIZE:
        scale = HSV_SIZE / max(height, width)
        image = cv2.resize(image, (round(width * scale), round(height * scale)),
                           interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    pale = (s <= 60) & (v >= 180)
    brown = (h >= 10) & (h <= 30) & (s >= 80) & (v >= 50) & (v <= 200)
    pale_count = int(np.count_nonzero(pale))
    brown_count = int(np.count_nonzero(brown))
    total = pale_count + brown_count
    return (pale_count / total if total else None), pale_count, brown_count


def confusion(rows, truth="truth", prediction="prediction"):
    tp = sum(r[truth] == 1 and r[prediction] == 1 for r in rows)
    tn = sum(r[truth] == 0 and r[prediction] == 0 for r in rows)
    fp = sum(r[truth] == 0 and r[prediction] == 1 for r in rows)
    fn = sum(r[truth] == 1 and r[prediction] == 0 for r in rows)
    div = lambda a, b: a / b if b else None
    precision = div(tp, tp + fp)
    recall = div(tp, tp + fn)
    return {"n": len(rows), "tp": tp, "tn": tn, "fp": fp, "fn": fn,
            "accuracy": div(tp + tn, len(rows)), "precision": precision,
            "recall": recall, "f1": div(2 * tp, 2 * tp + fp + fn),
            "balanced_accuracy": (div(tp, tp + fn) + div(tn, tn + fp)) / 2}


def tune_hsv():
    rows = []
    for dirname, truth in (("Bleached", 1), ("Unbleached", 0)):
        for path in sorted((SONAIN / dirname).glob("*.png")):
            score, _, _ = hsv_score(path)
            rows.append({"image": path.relative_to(ROOT).as_posix(), "truth": truth,
                         "score": score, "sha256": digest(path)})
    assert len(rows) == 342
    thresholds = [i / 100 for i in range(101)]
    ranked = []
    for threshold in thresholds:
        evaluated = [{"truth": r["truth"], "prediction": int(r["score"] is not None and
                                                     r["score"] >= threshold)} for r in rows]
        ranked.append((confusion(evaluated)["balanced_accuracy"], -abs(threshold - 0.5), threshold))
    threshold = max(ranked)[2]
    write_csv(OUT / "hsv_tuning_images.csv", rows)
    return threshold, len(rows)


def yolo_infer(model, path):
    result = model.predict(str(path), imgsz=YOLO_IMGSZ, conf=YOLO_CONF,
                           device="cpu", verbose=False)[0]
    classes = result.boxes.cls.cpu().numpy().astype(int) if len(result.boxes) else []
    if any(c not in (0, 1) for c in classes):
        raise ValueError(f"Unexpected class in {path}: {classes}")
    counts = {0: 0, 1: 0}
    if result.masks is not None:
        for c, mask in zip(classes, result.masks.data.cpu().numpy()):
            counts[int(c)] += int(np.count_nonzero(mask))
    total = counts[0] + counts[1]
    return int(0 in classes), len(classes), (counts[0] / total if total else None), counts


def benchmark(model, eligible, threshold):
    rows = []
    for n, item in enumerate(eligible, 1):
        path = ROOT / item["image_path"]
        truth = int(item["image_label_bleached"])
        hsv, pale, brown = hsv_score(path)
        yolo_label, detections, _, _ = yolo_infer(model, path)
        rows.append({"source_id": item["source_id"], "image_path": item["image_path"],
                     "image_sha256": item["image_sha256"], "truth_bleached": truth,
                     "yolo_bleached_presence": yolo_label, "yolo_detections": detections,
                     "hsv_bleached_prediction": int(hsv is not None and hsv >= threshold),
                     "hsv_color_fraction": hsv if hsv is not None else "",
                     "hsv_pale_pixels": pale, "hsv_brown_pixels": brown})
        if n % 20 == 0:
            print(f"external: {n}/{len(eligible)}", flush=True)
    write_csv(OUT / "external_test_predictions.csv", rows)
    metrics = {}
    for method, key in (("original_yolo", "yolo_bleached_presence"),
                        ("hsv", "hsv_bleached_prediction")):
        metrics[method] = confusion([{"truth": r["truth_bleached"], "prediction": r[key]}
                                     for r in rows])
    (OUT / "external_metrics.json").write_text(json.dumps(metrics, indent=2) + "\n")
    return metrics


def kavaratti(model):
    source_rows = list(csv.DictReader(PHASE1.open(newline="")))
    assert len(source_rows) == 265
    rows = []
    for n, source in enumerate(source_rows, 1):
        path = ROOT / source["frame_path"]
        assert digest(path) == source["frame_sha256"]
        hsv, pale, brown = hsv_score(path)
        _, detections, yolo, pixel_counts = yolo_infer(model, path)
        rows.append({"video_id": source["video_id"],
                     "timestamp_seconds": source["timestamp_seconds"],
                     "frame_path": source["frame_path"], "frame_sha256": source["frame_sha256"],
                     "yolo_bleached_estimate_pct": round(yolo * 100, 4) if yolo is not None else "",
                     "yolo_bleached_mask_pixels": pixel_counts[0],
                     "yolo_healthy_mask_pixels": pixel_counts[1], "yolo_detections": detections,
                     "hsv_pale_color_estimate_pct": round(hsv * 100, 4) if hsv is not None else "",
                     "hsv_pale_pixels": pale, "hsv_brown_pixels": brown,
                     "absolute_disagreement_points": round(abs(yolo - hsv) * 100, 4)
                     if yolo is not None and hsv is not None else ""})
        if n % 25 == 0:
            print(f"Kavaratti: {n}/{len(source_rows)}", flush=True)
    write_csv(OUT / "kavaratti_frame_estimates.csv", rows)
    summaries = summarize_kavaratti(rows)
    write_csv(OUT / "kavaratti_video_estimates.csv", summaries)
    return summaries


def summarize_kavaratti(rows):
    summaries = []
    for video_id in ("17", "19", "21", "22", "24", "25"):
        group = [r for r in rows if r["video_id"] == video_id]
        mean = lambda key: round(sum(float(r[key]) for r in group if r[key] != "") /
                                 sum(r[key] != "" for r in group), 4) if any(r[key] != "" for r in group) else ""
        valid = [r for r in group if r["absolute_disagreement_points"] != ""]
        summaries.append({"video_id": video_id, "frames": len(group),
                          "yolo_valid_frames": sum(r["yolo_bleached_estimate_pct"] != "" for r in group),
                          "hsv_valid_frames": sum(r["hsv_pale_color_estimate_pct"] != "" for r in group),
                          "mean_yolo_bleached_estimate_pct": mean("yolo_bleached_estimate_pct"),
                          "mean_hsv_pale_color_estimate_pct": mean("hsv_pale_color_estimate_pct"),
                          "paired_mean_yolo_pct": round(sum(float(r["yolo_bleached_estimate_pct"]) for r in valid) / len(valid), 4) if valid else "",
                          "paired_mean_hsv_pct": round(sum(float(r["hsv_pale_color_estimate_pct"]) for r in valid) / len(valid), 4) if valid else "",
                          "mean_absolute_disagreement_points": mean("absolute_disagreement_points"),
                          "frames_disagreement_over_20_points": sum(float(r["absolute_disagreement_points"]) > 20 for r in valid)})
    return summaries


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    eligible = external_inventory()
    print(f"External single-class source groups after overlap filtering: {len(eligible)}", flush=True)
    if "--audit-only" in sys.argv:
        return
    threshold, tuning_count = tune_hsv()
    print(f"HSV threshold selected on {tuning_count} tuning images: {threshold}", flush=True)
    from ultralytics import YOLO
    import torch
    import cv2
    torch.set_num_threads(2)
    assert digest(WEIGHTS) == "816b18fcd697e5e85409a283ac9344475c3ca2cc25896e8a3f92819d6410a29d"
    model = YOLO(str(WEIGHTS))
    if model.names != {0: "bleached_coral", 1: "healthy_coral"}:
        raise ValueError(f"Unexpected recovered model classes: {model.names}")
    metrics = benchmark(model, eligible, threshold)
    summaries = kavaratti(model)
    provenance = {
        "external_test_dataset": "vencerlanz09/healthy-and-bleached-corals-image-classification version 1; Flickr images; Open Database License, image contents copyright original authors",
        "external_tuning_dataset": "sonainjamil/bleached-corals-detection version 3; CC BY 4.0; overlaps original Drive training images",
        "test_rule": "direct folder class; group dHash distance <=4 within test, exclude conflicting groups; exclude dHash distance <=8 to any Sonain image",
        "test_label": "direct image-level bleached_corals or healthy_corals folder label; contradictory duplicate groups excluded",
        "box_labels_are_not_masks": True,
        "hsv_method": "OpenCV HSV: pale S<=60 and V>=180; brown H=10..30, S>=80, V=50..200; fraction pale/(pale+brown); max dimension 640",
        "hsv_threshold": threshold, "hsv_tuning_images": tuning_count,
        "yolo_method": "original best.pt, CPU, imgsz=640, conf=0.25; image positive if any class-0 detection; video fraction from detected mask pixels; no detection gives null",
        "weights_sha256": digest(WEIGHTS),
        "archive_sha256": {name: digest(DATA / name) for name in ("sonainjamil-v3.zip", "shrushti21-v1.zip", "vencerlanz09-v1.zip")},
        "versions": {"python": platform.python_version(), "opencv": cv2.__version__,
                     "numpy": np.__version__, "torch": torch.__version__,
                     "ultralytics": __import__("ultralytics").__version__},
        "external_metrics": metrics, "kavaratti_video_estimates": summaries,
    }
    (OUT / "run_provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print("Comparison complete", flush=True)


if __name__ == "__main__":
    main()
