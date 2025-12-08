# backend/miniproject.py
import cv2
import numpy as np
import os
import joblib
from pathlib import Path

# Directories
UPLOAD_DIR = "uploads"
FRAMES_DIR = os.path.join(UPLOAD_DIR, "frames")
os.makedirs(FRAMES_DIR, exist_ok=True)

# Load pre-trained GMM models
MODEL_DIR = Path(__file__).parent  # backend folder
BLEACHED_GMM_PATH = MODEL_DIR / "bleached_gmm.pkl"
HEALTHY_GMM_PATH = MODEL_DIR / "healthy_gmm.pkl"

# Global models
bleached_gmm = None
healthy_gmm = None

def load_gmm_models():
    """Load pre-trained Gaussian Mixture Models"""
    global bleached_gmm, healthy_gmm
    
    try:
        if BLEACHED_GMM_PATH.exists() and HEALTHY_GMM_PATH.exists():
            bleached_gmm = joblib.load(BLEACHED_GMM_PATH)
            healthy_gmm = joblib.load(HEALTHY_GMM_PATH)
            print("✅ GMM models loaded successfully")
            return True
        else:
            print("⚠️ Warning: GMM model files not found. Using fallback HSV method.")
            print(f"   Expected: {BLEACHED_GMM_PATH}")
            print(f"   Expected: {HEALTHY_GMM_PATH}")
            return False
    except Exception as e:
        print(f"❌ Error loading GMM models: {e}")
        return False

def analyze_frame_gmm(hsv_frame):
    """
    Analyze frame using Gaussian Mixture Models
    Returns: bleaching_percentage, mask_bleached
    """
    if bleached_gmm is None or healthy_gmm is None:
        return analyze_frame_fallback(hsv_frame)
    
    try:
        # Reshape for GMM prediction
        hsv_reshaped = hsv_frame.reshape(-1, 3)
        
        # Calculate probability scores
        bleach_score = np.exp(bleached_gmm.score_samples(hsv_reshaped))
        healthy_score = np.exp(healthy_gmm.score_samples(hsv_reshaped))
        
        # Classify pixels
        is_bleached = bleach_score > healthy_score
        mask_bleached = is_bleached.reshape(hsv_frame.shape[:2])
        
        # Remove background (low saturation or very high brightness)
        low_sat_mask = hsv_frame[:, :, 1] < 40
        high_val_mask = hsv_frame[:, :, 2] > 245
        background_mask = np.logical_or(low_sat_mask, high_val_mask)
        
        # Remove background from bleached mask
        mask_bleached = np.logical_and(mask_bleached, ~background_mask)
        
        # Calculate percentage
        total_pixels = hsv_frame.shape[0] * hsv_frame.shape[1]
        bleached_pixels = np.count_nonzero(mask_bleached)
        bleaching_percentage = (bleached_pixels / total_pixels) * 100
        
        return bleaching_percentage, mask_bleached.astype(np.uint8) * 255
    
    except Exception as e:
        print(f"Error in GMM analysis: {e}")
        return analyze_frame_fallback(hsv_frame)

def analyze_frame_fallback(hsv_frame):
    """
    Fallback HSV analysis using color thresholds
    """
    # Define color ranges
    lower_bleached = np.array([0, 0, 180])
    upper_bleached = np.array([179, 60, 255])
    
    # Create mask
    mask_bleached = cv2.inRange(hsv_frame, lower_bleached, upper_bleached)
    
    # Calculate percentage
    total_pixels = hsv_frame.shape[0] * hsv_frame.shape[1]
    bleached_pixels = np.count_nonzero(mask_bleached)
    bleaching_percentage = (bleached_pixels / total_pixels) * 100
    
    return bleaching_percentage, mask_bleached

def get_bounding_boxes(mask, min_area=500):
    """Extract bounding boxes from a binary mask"""
    boxes = []
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = w * h
        
        if area > min_area:
            boxes.append({"x": int(x), "y": int(y), "w": int(w), "h": int(h)})
    
    return boxes

def analyze_video(file_path: str, method: str = "hsv"):
    """
    Analyze coral bleaching in video using HSV + GMM approach
    
    Args:
        file_path: Path to video file
        method: 'hsv' or 'yolo' (both use HSV for now)
    
    Returns:
        Dictionary with frame results and summary
    """
    # Load GMM models on first run
    load_gmm_models()
    
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {file_path}")
    
    frame_results = []
    frame_count = 0
    bleached_total = 0
    healthy_total = 0
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Analyzing video with {total_frames} frames...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Process every 5th frame
        if frame_count % 5 != 0:
            continue
        
        # Resize for faster processing
        frame = cv2.resize(frame, (640, 480))
        
        # Convert to HSV
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Analyze using GMM or fallback
        bleaching_percent, mask_bleached = analyze_frame_gmm(hsv)
        
        # Get bounding boxes
        mask_healthy = cv2.bitwise_not(mask_bleached)
        boxes_bleached = get_bounding_boxes(mask_bleached)
        boxes_healthy = get_bounding_boxes(mask_healthy)
        
        # Save frame with overlays
        frame_name = f"frame_{frame_count:04d}.jpg"
        save_path = os.path.join(FRAMES_DIR, frame_name)
        
        # Draw bounding boxes
        display_frame = frame.copy()
        for box in boxes_bleached[:10]:  # Limit to 10 boxes
            cv2.rectangle(display_frame, 
                         (box['x'], box['y']), 
                         (box['x'] + box['w'], box['y'] + box['h']),
                         (0, 0, 255), 2)
        
        for box in boxes_healthy[:10]:
            cv2.rectangle(display_frame, 
                         (box['x'], box['y']), 
                         (box['x'] + box['w'], box['y'] + box['h']),
                         (0, 255, 0), 2)
        
        # Add text
        cv2.putText(display_frame, f"Bleaching: {bleaching_percent:.1f}%",
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        cv2.imwrite(save_path, display_frame)
        
        # Store results
        frame_results.append({
            "frame": frame_name,
            "bleaching_percent": round(bleaching_percent, 2),
            "image_url": f"/frames/{frame_name}",
            "boxes": {
                "bleached": boxes_bleached[:10],
                "healthy": boxes_healthy[:10]
            }
        })
        
        bleached_total += bleaching_percent
        healthy_total += (100 - bleaching_percent)
        
        if len(frame_results) % 10 == 0:
            print(f"Processed {len(frame_results)} frames...")
    
    cap.release()
    
    # Calculate averages
    num_analyzed = len(frame_results)
    avg_bleached = bleached_total / num_analyzed if num_analyzed > 0 else 0
    avg_healthy = healthy_total / num_analyzed if num_analyzed > 0 else 0
    
    print(f"✅ Analysis complete: {num_analyzed} frames processed")
    print(f"   Average bleaching: {avg_bleached:.2f}%")
    
    return {
        "frames": frame_results,
        "summary": {
            "bleached": round(avg_bleached, 2),
            "healthy": round(avg_healthy, 2),
        }
    }