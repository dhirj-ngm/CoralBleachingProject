#!/usr/bin/env python3
"""Inventory the six supplied Kavaratti videos and extract a 1 Hz frame grid."""

import csv
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VIDEO_DIR = ROOT / "kavaratti videos_17-25"
OUTPUT_DIR = ROOT / "generated" / "phase1" / "frames"
MANIFEST = ROOT / "data" / "phase1" / "frame_manifest.csv"
INVENTORY = ROOT / "data" / "phase1" / "source_inventory.json"
IDS = ("17", "19", "21", "22", "24", "25")


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def run(command):
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(f"{' '.join(command[:2])} failed: {result.stderr[-2000:]}")
    return result.stdout


def probe(path):
    result = json.loads(run([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "format=duration:format_tags=creation_time:stream=codec_name,width,height,avg_frame_rate,nb_frames,start_time",
        "-of", "json", str(path),
    ]))
    stream = result["streams"][0]
    return {
        "codec": stream["codec_name"], "width": stream["width"],
        "height": stream["height"], "avg_frame_rate": stream["avg_frame_rate"],
        "source_frame_count": int(stream["nb_frames"]),
        "start_time_seconds": float(stream["start_time"]),
        "duration_seconds": float(result["format"]["duration"]),
        "container_creation_time_utc": result["format"].get("tags", {}).get("creation_time"),
    }


def main():
    actual = sorted(path.name for path in VIDEO_DIR.iterdir() if path.is_file())
    expected = [f"{video_id}.MP4" for video_id in IDS]
    if actual != sorted(expected):
        raise RuntimeError(f"Expected exactly {expected}; found {actual}")
    if OUTPUT_DIR.exists() and any(OUTPUT_DIR.iterdir()):
        raise RuntimeError(f"Output is not empty: {OUTPUT_DIR}. Move it aside before rerunning.")

    sources = []
    rows = []
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for video_id in IDS:
        source = VIDEO_DIR / f"{video_id}.MP4"
        metadata = probe(source)
        record = {
            "video_id": video_id, "path": source.relative_to(ROOT).as_posix(),
            "size_bytes": source.stat().st_size, "sha256": sha256(source), **metadata,
        }
        sources.append(record)
        with tempfile.TemporaryDirectory(prefix=f"extract_{video_id}_", dir=OUTPUT_DIR.parent) as temp:
            temporary = Path(temp)
            run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-i", str(source),
                "-vf", "fps=fps=1:start_time=0:round=near", "-fps_mode", "passthrough",
                "-frame_pts", "1", "-q:v", "3", str(temporary / "%06d.jpg"),
            ])
            frames = sorted(temporary.glob("*.jpg"))
            if not frames:
                raise RuntimeError(f"No frames extracted from {source}")
            seconds = [int(frame.stem) for frame in frames]
            if seconds != list(range(len(frames))):
                raise RuntimeError(f"Non-contiguous timestamp grid for {source}: {seconds}")
            for frame, second in zip(frames, seconds):
                rows.append({
                    "video_id": video_id, "source_video": record["path"],
                    "source_sha256": record["sha256"], "timestamp_seconds": second,
                    "frame_path": (OUTPUT_DIR / video_id / frame.name).relative_to(ROOT).as_posix(),
                    "frame_sha256": sha256(frame),
                })
            temporary.rename(OUTPUT_DIR / video_id)
        print(f"{video_id}: {len(frames)} frames", flush=True)

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    with MANIFEST.open("w", newline="") as target:
        writer = csv.DictWriter(target, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    INVENTORY.write_text(json.dumps({
        "description": "User-supplied local Kavaratti videos; hashes identify these exact files.",
        "extraction": "FFmpeg fps=fps=1:start_time=0:round=near, JPEG quality 3; timestamps are 1 Hz output grid seconds from video start.",
        "ffmpeg_version": run(["ffmpeg", "-version"]).splitlines()[0],
        "videos": sources,
    }, indent=2) + "\n")
    print(f"Wrote {len(rows)} rows to {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, KeyError, RuntimeError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        sys.exit(1)
