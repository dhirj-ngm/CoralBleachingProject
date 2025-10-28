import cv2
import numpy as np
import os

UPLOAD_DIR = "uploads"
FRAMES_DIR = os.path.join(UPLOAD_DIR, "frames")
os.makedirs(FRAMES_DIR, exist_ok=True)

def analyze_video(file_path: str, method: str):
    cap = cv2.VideoCapture(file_path)
    frame_results = []
    frame_count = 0
    bleached_total, healthy_total = 0, 0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1

        # process every 5th frame
        if frame_count % 5 != 0:
            continue

        boxes_bleached = []
        boxes_healthy = []
        bleaching_percent = 0

        if method == "hsv":
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

            # Example thresholds (tweak as needed)
            lower_healthy = np.array([10, 50, 50])   # brownish range
            upper_healthy = np.array([30, 255, 255])

            lower_bleached = np.array([0, 0, 180])   # whitish range
            upper_bleached = np.array([179, 60, 255])

            mask_healthy = cv2.inRange(hsv, lower_healthy, upper_healthy)
            mask_bleached = cv2.inRange(hsv, lower_bleached, upper_bleached)

            # Count % bleaching
            healthy_pixels = np.count_nonzero(mask_healthy)
            bleached_pixels = np.count_nonzero(mask_bleached)
            total_pixels = frame.shape[0] * frame.shape[1]

            bleaching_percent = (bleached_pixels / total_pixels * 100) if total_pixels else 0

            # === Find contours for boxes ===
            contours_h, _ = cv2.findContours(mask_healthy, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            contours_b, _ = cv2.findContours(mask_bleached, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            for c in contours_h:
                x, y, w, h = cv2.boundingRect(c)
                if w * h > 500:  # filter out noise
                    boxes_healthy.append({"x": x, "y": y, "w": w, "h": h})

            for c in contours_b:
                x, y, w, h = cv2.boundingRect(c)
                if w * h > 500:
                    boxes_bleached.append({"x": x, "y": y, "w": w, "h": h})

        else:
            # Placeholder YOLO: random boxes for demo
            bleaching_percent = float(np.random.randint(20, 80))
            boxes_bleached = [{"x": 50, "y": 50, "w": 100, "h": 80}]
            boxes_healthy = [{"x": 200, "y": 120, "w": 120, "h": 90}]

        # Save frame
        frame_name = f"frame_{frame_count:04d}.jpg"
        save_path = os.path.join(FRAMES_DIR, frame_name)
        cv2.imwrite(save_path, frame)

        # Append results
        frame_results.append({
            "frame": frame_name,
            "bleaching_percent": round(bleaching_percent, 2),
            "image_url": f"/frames/{frame_name}",
            "boxes": {
                "bleached": boxes_bleached,
                "healthy": boxes_healthy
            }
        })

        bleached_total += bleaching_percent
        healthy_total += (100 - bleaching_percent)

    cap.release()

    avg_bleached = bleached_total / len(frame_results) if frame_results else 0
    avg_healthy = healthy_total / len(frame_results) if frame_results else 0

    return {
        "frames": frame_results,
        "summary": {
            "bleached": round(avg_bleached, 2),
            "healthy": round(avg_healthy, 2),
        }
    }
