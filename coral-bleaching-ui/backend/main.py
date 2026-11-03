"""Local upload API for the recovered YOLO and independent HSV estimators."""

import shutil
import subprocess
import sys
import tempfile
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from compare_methods import WEIGHTS, hsv_score, yolo_infer  # noqa: E402


app = FastAPI(title="Coral bleaching method comparison", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def model():
    import torch
    from ultralytics import YOLO

    if not WEIGHTS.is_file():
        raise FileNotFoundError("Recovered best.pt is missing; stage external assets first")
    torch.set_num_threads(2)
    loaded = YOLO(str(WEIGHTS))
    if loaded.names != {0: "bleached_coral", 1: "healthy_coral"}:
        raise ValueError(f"Unexpected checkpoint classes: {loaded.names}")
    return loaded


@app.get("/health")
def health():
    return {"status": "ready" if WEIGHTS.is_file() else "weights_missing", "weights": str(WEIGHTS.relative_to(ROOT))}


@app.post("/analyze")
def analyze(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".mp4", ".mov", ".avi"}:
        raise HTTPException(400, "Upload an MP4, MOV, or AVI video")
    work_root = ROOT / "generated" / "uploads"
    work_root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=work_root) as temporary:
        temp = Path(temporary)
        source = temp / ("upload" + suffix)
        with source.open("wb") as target:
            shutil.copyfileobj(file.file, target)
        frames_dir = temp / "frames"
        frames_dir.mkdir()
        command = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-i", str(source),
            "-vf", "fps=fps=1:start_time=0:round=near", "-fps_mode", "passthrough",
            "-frame_pts", "1", "-q:v", "3", str(frames_dir / "%06d.jpg"),
        ]
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode:
            raise HTTPException(422, f"Video decode failed: {result.stderr[-300:]}")
        frames = sorted(frames_dir.glob("*.jpg"))
        if not frames:
            raise HTTPException(422, "No frames decoded")
        estimator = model()
        rows = []
        for frame in frames:
            hsv, _, _ = hsv_score(frame)
            _, _, yolo, _ = yolo_infer(estimator, frame)
            rows.append({
                "video_id": "upload", "second": int(frame.stem),
                "yolo_estimate_pct": round(yolo * 100, 4) if yolo is not None else None,
                "hsv_color_estimate_pct": round(hsv * 100, 4) if hsv is not None else None,
                "disagreement_points": round(abs(yolo - hsv) * 100, 4)
                if yolo is not None and hsv is not None else None,
            })
    paired = [row for row in rows if row["disagreement_points"] is not None]
    def mean(key):
        return round(sum(row[key] for row in paired) / len(paired), 4) if paired else None
    return {"results": {
        "filename": Path(file.filename or "video").name, "frames": rows,
        "summary": {"video_id": "upload", "frames": len(rows), "paired_frames": len(paired),
                    "yolo_estimate_pct": mean("yolo_estimate_pct"),
                    "hsv_color_estimate_pct": mean("hsv_color_estimate_pct"),
                    "mean_absolute_disagreement_points": mean("disagreement_points")},
        "note": "Method-dependent estimates from 1 fps samples. No reference labels or accuracy measurement for this upload.",
    }}
