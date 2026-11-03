#!/usr/bin/env python3
"""Create sparse, explicitly unreviewed annotation proposals from manual ROIs."""

import argparse
import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
PHASE1 = ROOT / "data/phase1/frame_manifest.csv"
CONFIG = ROOT / "data/phase2/proposal_regions.json"
MANIFEST = ROOT / "data/phase2/annotation_manifest.csv"
REVIEW_LOG = ROOT / "data/phase2/review_log.csv"
OUTPUT = ROOT / "generated/phase2"
VALUES = {"background": 0, "healthy": 1, "bleached": 2}
COLORS = {0: (35, 105, 240), 1: (30, 205, 65), 2: (245, 55, 45)}


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rebuild-proposals", action="store_true",
                        help="overwrite generated proposals after editing proposal_regions.json")
    args = parser.parse_args()
    config = json.loads(CONFIG.read_text())
    source_rows = {(r["video_id"], int(r["timestamp_seconds"])): r
                   for r in csv.DictReader(PHASE1.open(newline=""))}
    split = config["split_by_video"]
    if set(split.values()) != {"train", "development", "test"}:
        raise ValueError("Expected train, development, and test video splits")
    if not args.rebuild_proposals and any((OUTPUT / dirname).exists() for dirname in ("masks", "overlays")):
        raise FileExistsError("Phase 2 proposal output already exists; move it aside before regenerating")
    (OUTPUT / "masks").mkdir(parents=True, exist_ok=args.rebuild_proposals)
    (OUTPUT / "overlays").mkdir(exist_ok=args.rebuild_proposals)
    seen = set()
    manifest_rows = []
    for sample in config["samples"]:
        video_id = sample["video_id"]
        second = sample["timestamp_seconds"]
        key = (video_id, second)
        if key in seen or key not in source_rows or video_id not in split:
            raise ValueError(f"Duplicate or missing Phase 1 source: {key}")
        seen.add(key)
        source = source_rows[key]
        frame_path = ROOT / source["frame_path"]
        if sha256(frame_path) != source["frame_sha256"]:
            raise ValueError(f"Source frame changed: {frame_path}")
        with Image.open(frame_path) as frame:
            width, height = frame.size
            frame = frame.convert("RGB")
        mask = Image.new("L", (width, height), 255)
        draw = ImageDraw.Draw(mask)
        cw, ch = config["coordinate_size"]
        for region in sample["regions"]:
            label, x0, y0, x1, y1 = region
            if label not in VALUES or not (0 <= x0 < x1 <= cw and 0 <= y0 < y1 <= ch):
                raise ValueError(f"Invalid region for {key}: {region}")
            draw.ellipse((round(x0 * width / cw), round(y0 * height / ch),
                          round(x1 * width / cw), round(y1 * height / ch)), fill=VALUES[label])
        sample_id = f"{video_id}_{second:06d}"
        mask_path = OUTPUT / "masks" / f"{sample_id}.png"
        overlay_path = OUTPUT / "overlays" / f"{sample_id}.jpg"
        mask.save(mask_path, optimize=True)
        thumb = frame.resize((960, 540))
        thumb_mask = mask.resize(thumb.size, Image.Resampling.NEAREST)
        tint = Image.new("RGB", thumb.size)
        tint_pixels = tint.load()
        mask_pixels = thumb_mask.load()
        for y in range(thumb.height):
            for x in range(thumb.width):
                tint_pixels[x, y] = COLORS.get(mask_pixels[x, y], (0, 0, 0))
        blended = Image.blend(thumb, tint, 0.45)
        thumb.paste(blended, mask=thumb_mask.point(lambda value: 255 if value != 255 else 0))
        ImageDraw.Draw(thumb).text((8, 8), f"{sample_id}  {split[video_id]}  PROVISIONAL / NEEDS REVIEW",
                                   fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0))
        thumb.save(overlay_path, quality=90)
        counts = Counter(mask.get_flattened_data())
        manifest_rows.append({
            "sample_id": sample_id, "split": split[video_id], "video_id": video_id,
            "timestamp_seconds": second, "source_video": source["source_video"],
            "source_sha256": source["source_sha256"], "frame_path": source["frame_path"],
            "frame_sha256": source["frame_sha256"],
            "mask_path": mask_path.relative_to(ROOT).as_posix(), "mask_sha256": sha256(mask_path),
            "overlay_path": overlay_path.relative_to(ROOT).as_posix(),
            "width": width, "height": height,
            "background_pixels": counts[0], "healthy_pixels": counts[1],
            "bleached_pixels": counts[2], "ignore_pixels": counts[255],
            "status": "needs_review", "scene": sample["scene"], "ambiguity": sample["ambiguity"],
        })
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    with MANIFEST.open("w", newline="") as target:
        writer = csv.DictWriter(target, fieldnames=list(manifest_rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(manifest_rows)
    if not REVIEW_LOG.exists():
        with REVIEW_LOG.open("w", newline="") as target:
            writer = csv.DictWriter(target, fieldnames=[
                "sample_id", "review_status", "reviewer", "reviewed_at_utc",
                "reviewed_mask_path", "decision_notes",
            ], lineterminator="\n")
            writer.writeheader()
            writer.writerows({"sample_id": row["sample_id"], "review_status": "needs_review"}
                             for row in manifest_rows)
    print(f"Prepared {len(manifest_rows)} provisional masks and overlays: {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
