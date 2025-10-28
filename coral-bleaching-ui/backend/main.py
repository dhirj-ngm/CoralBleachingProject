from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil, os, uuid
from miniproject import analyze_video
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Serve frames directory at /frames
app.mount("/frames", StaticFiles(directory="uploads/frames"), name="frames")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analyze")
async def analyze(file: UploadFile, method: str = Form("hsv")):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = analyze_video(file_path, method)
    return {"status": "success", "results": results}
