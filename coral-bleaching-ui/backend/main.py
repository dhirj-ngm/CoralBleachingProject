# backend/main.py
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import shutil
import os
import uuid

# Import from the same directory
from miniproject import analyze_video

app = FastAPI(
    title="Coral Bleaching Detection API",
    description="AI-powered coral reef analysis using HSV + GMM",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
UPLOAD_DIR = "uploads"
FRAMES_DIR = os.path.join(UPLOAD_DIR, "frames")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(FRAMES_DIR, exist_ok=True)

# Serve frames directory
app.mount("/frames", StaticFiles(directory=FRAMES_DIR), name="frames")

@app.get("/")
async def root():
    return {
        "message": "Coral Bleaching Detection API",
        "status": "running",
        "version": "1.0.0",
        "method": "HSV + Gaussian Mixture Model"
    }

@app.post("/analyze")
async def analyze(file: UploadFile, method: str = Form("hsv")):
    """
    Analyze uploaded video for coral bleaching
    
    Args:
        file: Video file (MP4, AVI, MOV)
        method: Analysis method ('hsv' or 'yolo') - both use HSV+GMM currently
    
    Returns:
        JSON with frame-by-frame analysis and summary
    """
    try:
        # Validate file type
        allowed_types = ["video/mp4", "video/avi", "video/quicktime", "video/x-msvideo"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Allowed: MP4, AVI, MOV"
            )
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")

        # Save uploaded file
        print(f"Saving uploaded file: {file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"File saved to: {file_path}")
        print(f"Analyzing with method: {method}")

        # Analyze video (always uses HSV+GMM)
        results = analyze_video(file_path, method)
        
        # Clean up uploaded file (optional)
        # os.remove(file_path)

        return JSONResponse(content={
            "status": "success",
            "results": results
        })
    
    except Exception as e:
        print(f"Error in /analyze endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Coral Bleaching Detection API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)