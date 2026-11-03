#!/usr/bin/env python3
"""Join video-level estimates to workbook endpoints without inventing GPS tracks."""

import csv
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / "Kavartti video locations.xlsx"
SUMMARY = ROOT / "generated/comparison/kavaratti_video_estimates.csv"
OUT = ROOT / "generated/comparison"


def workbook_rows():
    with zipfile.ZipFile(WORKBOOK) as archive:
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            strings = ["".join(node.itertext()) for node in shared]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
    rows = []
    for row in sheet.findall(".//{*}row"):
        cells = {}
        for cell in row.findall("{*}c"):
            value = cell.find("{*}v")
            if value is None:
                continue
            content = value.text
            if cell.attrib.get("t") == "s":
                content = strings[int(content)]
            cells[re.match(r"[A-Z]+", cell.attrib["r"]).group()] = content
        if cells.get("A") and all(cells.get(column) for column in "BCDE"):
            rows.append(cells)
    return rows


def main():
    locations = {}
    for row in workbook_rows():
        label = row["A"].strip()
        if " to " in label:
            low, high = map(int, label.split(" to "))
            ids = range(low, high + 1)
        elif label.isdigit():
            ids = [int(label)]
        else:
            continue
        for video_id in ids:
            locations[str(video_id)] = row
    estimates = list(csv.DictReader(SUMMARY.open(newline="")))
    assert len(estimates) == 6
    rows = []
    features = []
    for estimate in estimates:
        video_id = estimate["video_id"]
        location = locations[video_id]
        start = [float(location["C"]), float(location["B"])]
        end = [float(location["E"]), float(location["D"])]
        assert all(72.5 < point[0] < 72.8 and 10.4 < point[1] < 10.7 for point in (start, end))
        props = {
            "video_id": video_id, "location_group": location["A"],
            "coordinate_precision": "workbook start/end for video or video group; not frame GPS",
            "frames": int(estimate["frames"]),
            "paired_frames": int(estimate["yolo_valid_frames"]),
            "paired_yolo_estimate_pct": float(estimate["paired_mean_yolo_pct"]),
            "paired_hsv_color_estimate_pct": float(estimate["paired_mean_hsv_pct"]),
            "mean_absolute_disagreement_points": float(estimate["mean_absolute_disagreement_points"]),
            "reference_status": "unverified estimates",
        }
        features.append({"type": "Feature", "geometry": {"type": "MultiPoint", "coordinates": [start, end]},
                         "properties": props})
        rows.append({"video_id": video_id, "location_group": location["A"],
                     "start_latitude": start[1], "start_longitude": start[0],
                     "end_latitude": end[1], "end_longitude": end[0], **props})
    assert {r["video_id"] for r in rows} == {"17", "19", "21", "22", "24", "25"}
    with (OUT / "kavaratti_locations.csv").open("w", newline="") as target:
        writer = csv.DictWriter(target, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    (OUT / "kavaratti_locations.geojson").write_text(json.dumps({
        "type": "FeatureCollection", "features": features,
    }, indent=2) + "\n")
    print(f"Exported {len(features)} video-level endpoint features")


if __name__ == "__main__":
    main()
