#!/usr/bin/env python3
"""Check external benchmark separation, predictions, and Kavaratti estimates."""

import csv
import hashlib
import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "generated/comparison"


def read(name):
    return list(csv.DictReader((OUT / name).open(newline="")))


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    audit = read("external_source_audit.csv")
    test = read("external_test_predictions.csv")
    tune = read("hsv_tuning_images.csv")
    original = list(csv.DictReader(
        (ROOT / "data/phase1/frame_manifest.csv").open(newline="")))
    frames = read("kavaratti_frame_estimates.csv")
    videos = read("kavaratti_video_estimates.csv")
    metrics = json.loads((OUT / "external_metrics.json").read_text())
    provenance = json.loads((OUT / "run_provenance.json").read_text())
    eligible = {r["source_id"]: r for r in audit if r["benchmark_eligible"] == "1"}
    assert len(audit) == 900 and len(eligible) == 883
    assert len(test) == len(eligible) == len({r["source_id"] for r in test})
    assert len(tune) == 342
    for row in test:
        source = eligible[row["source_id"]]
        assert source["exclude_conflicting_label"] == source["exclude_overlap"] == "0"
        assert int(source["nearest_sonain_dhash_distance"]) > 8
        assert row["image_path"] == source["image_path"]
        assert row["image_sha256"] == source["image_sha256"]
        assert digest(ROOT / row["image_path"]) == row["image_sha256"]
        assert row["truth_bleached"] == source["image_label_bleached"]
        assert row["yolo_bleached_presence"] in {"0", "1"}
        assert row["hsv_bleached_prediction"] in {"0", "1"}
    assert Counter(r["truth_bleached"] for r in test) == {"1": 462, "0": 421}
    for method, field in (("original_yolo", "yolo_bleached_presence"),
                          ("hsv", "hsv_bleached_prediction")):
        tp = sum(r["truth_bleached"] == "1" and r[field] == "1" for r in test)
        tn = sum(r["truth_bleached"] == "0" and r[field] == "0" for r in test)
        fp = sum(r["truth_bleached"] == "0" and r[field] == "1" for r in test)
        fn = sum(r["truth_bleached"] == "1" and r[field] == "0" for r in test)
        assert (tp, tn, fp, fn) == tuple(metrics[method][key] for key in ("tp", "tn", "fp", "fn"))
        assert tp + tn + fp + fn == len(test)
    keys = {(r["video_id"], r["timestamp_seconds"]): r for r in original}
    assert len(keys) == len(original) == len(frames) == 265
    assert len({(r["video_id"], r["timestamp_seconds"]) for r in frames}) == 265
    for row in frames:
        source = keys[row["video_id"], row["timestamp_seconds"]]
        assert row["frame_path"] == source["frame_path"]
        assert row["frame_sha256"] == source["frame_sha256"]
        assert row["yolo_bleached_estimate_pct"] == "" or 0 <= float(row["yolo_bleached_estimate_pct"]) <= 100
        assert row["hsv_pale_color_estimate_pct"] == "" or 0 <= float(row["hsv_pale_color_estimate_pct"]) <= 100
        if row["absolute_disagreement_points"] != "":
            assert abs(float(row["absolute_disagreement_points"]) - abs(
                float(row["yolo_bleached_estimate_pct"]) -
                float(row["hsv_pale_color_estimate_pct"]))) < 0.001
    assert {r["video_id"] for r in videos} == {"17", "19", "21", "22", "24", "25"}
    for row in videos:
        assert int(row["frames"]) == sum(r["video_id"] == row["video_id"] for r in frames)
    assert provenance["external_metrics"] == metrics
    locations = json.loads((OUT / "kavaratti_locations.geojson").read_text())
    assert locations["type"] == "FeatureCollection"
    assert len(locations["features"]) == 6
    for feature in locations["features"]:
        assert feature["geometry"]["type"] == "MultiPoint"
        assert len(feature["geometry"]["coordinates"]) == 2
        assert feature["properties"]["coordinate_precision"].startswith("workbook start/end")
    published = json.loads((ROOT / "coral-bleaching-ui/public/comparison-results.json").read_text())
    assert published["external_test"]["metrics"] == metrics
    assert len(published["kavaratti"]["frames"]) == len(frames)
    assert len(published["kavaratti"]["video_summaries"]) == len(videos)
    assert json.loads((ROOT / "coral-bleaching-ui/public/kavaratti-locations.geojson").read_text()) == locations
    print(f"Validated {len(test)} held-out images, {len(frames)} Kavaratti frames, six GIS features, and published app data")


if __name__ == "__main__":
    main()
