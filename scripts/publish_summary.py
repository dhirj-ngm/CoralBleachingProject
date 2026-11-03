#!/usr/bin/env python3
"""Publish small, verified comparison data for the local Next.js dashboard."""

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "generated/comparison"
PUBLIC = ROOT / "coral-bleaching-ui/public"


def read(name):
    return list(csv.DictReader((OUT / name).open(newline="")))


def as_number(value):
    if value == "":
        return None
    return float(value)


def main():
    metrics = json.loads((OUT / "external_metrics.json").read_text())
    provenance = json.loads((OUT / "run_provenance.json").read_text())
    videos = read("kavaratti_video_estimates.csv")
    frames = read("kavaratti_frame_estimates.csv")
    assert len(videos) == 6 and len(frames) == 265
    payload = {
        "status": "estimates_with_external_image_benchmark",
        "external_test": {"dataset": "vencerlanz09/healthy-and-bleached-corals-image-classification",
                          "images": 883, "bleached_labels": 462, "healthy_labels": 421,
                          "unit": "image-level agreement with supplied folder labels",
                          "metrics": metrics},
        "kavaratti": {
            "unit": "method-dependent estimate; no reviewed Kavaratti ground truth",
            "video_summaries": [{
                "video_id": row["video_id"], "frames": int(row["frames"]),
                "paired_frames": int(row["yolo_valid_frames"]),
                "yolo_estimate_pct": as_number(row["paired_mean_yolo_pct"]),
                "hsv_color_estimate_pct": as_number(row["paired_mean_hsv_pct"]),
                "mean_absolute_disagreement_points": as_number(row["mean_absolute_disagreement_points"]),
            } for row in videos],
            "frames": [{
                "video_id": row["video_id"], "second": int(row["timestamp_seconds"]),
                "yolo_estimate_pct": as_number(row["yolo_bleached_estimate_pct"]),
                "hsv_color_estimate_pct": as_number(row["hsv_pale_color_estimate_pct"]),
                "disagreement_points": as_number(row["absolute_disagreement_points"]),
            } for row in frames],
        },
        "method": {"yolo": provenance["yolo_method"], "hsv": provenance["hsv_method"],
                   "hsv_external_cutoff": provenance["hsv_threshold"]},
        "limits": [
            "External scores are for image classification on supplied Flickr labels, not Kavaratti accuracy.",
            "YOLO and HSV video percentages use different denominators and are estimates.",
            "No reviewed Kavaratti test masks or frame GPS are available.",
        ],
    }
    PUBLIC.mkdir(parents=True, exist_ok=True)
    (PUBLIC / "comparison-results.json").write_text(json.dumps(payload, indent=2) + "\n")
    (PUBLIC / "kavaratti-locations.geojson").write_text(
        (OUT / "kavaratti_locations.geojson").read_text())
    print("Published real comparison JSON and endpoint GeoJSON")


if __name__ == "__main__":
    main()
