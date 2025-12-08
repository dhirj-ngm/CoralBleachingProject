# train_gmm_models.py
import cv2
import numpy as np
import os
from sklearn.mixture import GaussianMixture
import joblib

# ========================================
# CONFIGURE PATHS
# ========================================
BLEACHED_FOLDER = r"C:\CoralBleaching\coral-bleaching-ui\backend\bleached"
HEALTHY_FOLDER = r"C:\CoralBleaching\coral-bleaching-ui\backend\unbleached"
OUTPUT_DIR = r"C:\CoralBleaching\coral-bleaching-ui\backend"

def load_hsv_samples(folder, max_samples=50000):
    """
    Load and sample HSV pixels from images
    
    Args:
        folder: Path to folder containing training images
        max_samples: Maximum number of pixels to sample
    
    Returns:
        numpy array of HSV pixel values (N x 3)
    """
    hsv_pixels = []
    
    # Check if folder exists
    if not os.path.exists(folder):
        raise FileNotFoundError(f"❌ Folder not found: {folder}")
    
    # Get list of image files
    image_files = [f for f in os.listdir(folder) 
                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
    
    if len(image_files) == 0:
        raise ValueError(f"❌ No images found in {folder}")
    
    print(f"📂 Loading samples from: {folder}")
    print(f"   Found {len(image_files)} images")
    
    # Process each image
    for idx, filename in enumerate(image_files, 1):
        img_path = os.path.join(folder, filename)
        
        # Read image
        img = cv2.imread(img_path)
        
        if img is None:
            print(f"   ⚠️  Warning: Could not read {filename}, skipping...")
            continue
        
        # Convert BGR to HSV
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Reshape to list of pixels (H x W x 3) → (H*W x 3)
        hsv_flat = hsv.reshape(-1, 3)
        
        # Add to collection
        hsv_pixels.append(hsv_flat)
        
        # Progress indicator
        if idx % 5 == 0 or idx == len(image_files):
            print(f"   Processed {idx}/{len(image_files)} images...")
    
    # Stack all pixels into one big array
    print(f"   Combining pixel data...")
    all_pixels = np.vstack(hsv_pixels)
    total_pixels = len(all_pixels)
    print(f"   ✅ Total pixels collected: {total_pixels:,}")
    
    # Downsample if too many pixels
    if total_pixels > max_samples:
        print(f"   ⚙️  Downsampling to {max_samples:,} pixels...")
        idx = np.random.choice(total_pixels, max_samples, replace=False)
        all_pixels = all_pixels[idx]
        print(f"   ✅ Final sample size: {len(all_pixels):,} pixels")
    
    return all_pixels


def train_gmm_models():
    """Train Gaussian Mixture Models for bleached and healthy corals"""
    
    print("\n" + "="*60)
    print("🧠 CORAL BLEACHING GMM MODEL TRAINING")
    print("="*60 + "\n")
    
    # ========================================
    # Step 1: Load Training Data
    # ========================================
    print("📊 STEP 1: Loading Training Data\n")
    
    try:
        bleached_hsv = load_hsv_samples(BLEACHED_FOLDER, max_samples=50000)
        print()
        healthy_hsv = load_hsv_samples(HEALTHY_FOLDER, max_samples=50000)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\n💡 TIP: Make sure you have:")
        print(f"   1. Images in: {BLEACHED_FOLDER}")
        print(f"   2. Images in: {HEALTHY_FOLDER}")
        return
    
    # ========================================
    # Step 2: Train GMM Models
    # ========================================
    print("\n" + "-"*60)
    print("🎯 STEP 2: Training Gaussian Mixture Models\n")
    
    # Create GMM models
    bleached_gmm = GaussianMixture(
        n_components=2,
        covariance_type='full',
        random_state=42,
        verbose=1,
        max_iter=100
    )
    
    healthy_gmm = GaussianMixture(
        n_components=2,
        covariance_type='full',
        random_state=42,
        verbose=1,
        max_iter=100
    )
    
    # Train bleached model
    print("\n🔴 Training BLEACHED coral model...")
    bleached_gmm.fit(bleached_hsv)
    print("   ✅ Bleached model training complete!")
    
    # Train healthy model
    print("\n🟢 Training HEALTHY coral model...")
    healthy_gmm.fit(healthy_hsv)
    print("   ✅ Healthy model training complete!")
    
    # ========================================
    # Step 3: Save Models
    # ========================================
    print("\n" + "-"*60)
    print("💾 STEP 3: Saving Models\n")
    
    # Create output directory if needed
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Save models
    bleached_path = os.path.join(OUTPUT_DIR, "bleached_gmm.pkl")
    healthy_path = os.path.join(OUTPUT_DIR, "healthy_gmm.pkl")
    
    joblib.dump(bleached_gmm, bleached_path)
    joblib.dump(healthy_gmm, healthy_path)
    
    print(f"   ✅ Saved: {bleached_path}")
    print(f"   ✅ Saved: {healthy_path}")
    
    # ========================================
    # Step 4: Verification
    # ========================================
    print("\n" + "-"*60)
    print("✔️  STEP 4: Verification\n")
    
    # Check file sizes
    bleached_size = os.path.getsize(bleached_path) / 1024
    healthy_size = os.path.getsize(healthy_path) / 1024
    
    print(f"   Model file sizes:")
    print(f"   - bleached_gmm.pkl: {bleached_size:.1f} KB")
    print(f"   - healthy_gmm.pkl: {healthy_size:.1f} KB")
    
    print(f"\n   Model parameters:")
    print(f"   - Components: {bleached_gmm.n_components}")
    print(f"   - Covariance type: {bleached_gmm.covariance_type}")
    print(f"   - Converged: {bleached_gmm.converged_}")
    
    # ========================================
    # Success!
    # ========================================
    print("\n" + "="*60)
    print("🎉 SUCCESS! GMM Models Ready")
    print("="*60)
    print("\n📌 Next Steps:")
    print("   1. Start your FastAPI backend: uvicorn main:app --reload")
    print("   2. Start your Next.js frontend: npm run dev")
    print("   3. Upload a video and test!")
    print()


if __name__ == "__main__":
    train_gmm_models()