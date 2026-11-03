#!/usr/bin/env python3
"""Validate provisional Phase 2 labels, provenance, and whole-video split."""

import csv
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PHASE1 = ROOT / "data/phase1/frame_manifest.csv"
CONFIG = ROOT / "data/phase2/proposal_regions.json"
MANIFEST = ROOT / "data/phase2/annotation_manifest.csv"
REVIEW_LOG = ROOT / "data/phase2/review_log.csv"


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main():
    config = json.loads(CONFIG.read_text())
    phase1 = {(r["video_id"], r["timestamp_seconds"]): r
              for r in csv.DictReader(PHASE1.open(newline=""))}
    rows = list(csv.DictReader(MANIFEST.open(newline="")))
    expected = {(s["video_id"], str(s["timestamp_seconds"])) for s in config["samples"]}
    observed = {(r["video_id"], r["timestamp_seconds"]) for r in rows}
    assert len(rows) == len(expected) == len(observed) and observed == expected
    video_splits = defaultdict(set)
    counts = Counter()
    verified_videos = set()
    for row in rows:
        key = (row["video_id"], row["timestamp_seconds"])
        source = phase1[key]
        assert row["split"] == config["split_by_video"][row["video_id"]]
        assert row["status"] == "needs_review"
        assert row["source_video"] == source["source_video"]
        assert row["source_sha256"] == source["source_sha256"]
        assert row["frame_path"] == source["frame_path"]
        assert row["frame_sha256"] == source["frame_sha256"]
        frame_path = ROOT / row["frame_path"]
        source_video = ROOT / row["source_video"]
        mask_path = ROOT / row["mask_path"]
        overlay_path = ROOT / row["overlay_path"]
        if row["video_id"] not in verified_videos:
            assert sha256(source_video) == row["source_sha256"]
            verified_videos.add(row["video_id"])
        assert sha256(frame_path) == row["frame_sha256"]
        assert sha256(mask_path) == row["mask_sha256"]
        with Image.open(overlay_path) as overlay:
            assert overlay.size == (960, 540)
        with Image.open(frame_path) as frame, Image.open(mask_path) as mask:
            assert frame.size == mask.size == (int(row["width"]), int(row["height"]))
            assert mask.mode == "L"
            pixels = Counter(mask.get_flattened_data())
            assert set(pixels) <= {0, 1, 2, 255}
            for label, value in (("background", 0), ("healthy", 1),
                                 ("bleached", 2), ("ignore", 255)):
                assert pixels[value] == int(row[f"{label}_pixels"])
        video_splits[row["video_id"]].add(row["split"])
        counts[row["split"]] += 1
    assert all(len(value) == 1 for value in video_splits.values())
    assert set(video_splits) == {"17", "19", "21", "22", "24", "25"}
    assert set(counts) == {"train", "development", "test"}
    reviews = list(csv.DictReader(REVIEW_LOG.open(newline="")))
    assert len(reviews) == len(rows)
    assert {r["sample_id"] for r in reviews} == {r["sample_id"] for r in rows}
    by_id = {r["sample_id"]: r for r in rows}
    for review in reviews:
        assert review["review_status"] in {"needs_review", "approved", "rejected"}
        if review["review_status"] == "approved":
            assert review["reviewer"] and review["reviewed_at_utc"] and review["reviewed_mask_path"]
            reviewed_path = ROOT / review["reviewed_mask_path"]
            assert reviewed_path.is_file()
            with Image.open(reviewed_path) as mask:
                expected = by_id[review["sample_id"]]
                assert mask.mode == "L" and mask.size == (int(expected["width"]), int(expected["height"]))
                assert set(mask.get_flattened_data()) <= {0, 1, 2, 255}
    print(f"Validated {len(rows)} linked masks and overlays; split counts: {dict(counts)}")
    print(f"Whole-video split: {dict(video_splits)}")


if __name__ == "__main__":
    main()
