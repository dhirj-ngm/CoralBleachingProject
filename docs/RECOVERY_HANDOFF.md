# Coral bleaching project recovery handoff

This index records the original assets and a linear path for reconstructing the
Kavaratti Island analysis. It is an inventory, not a claim that the historical
accuracy or bleaching figures have been independently reproduced.

## 1. Local sources

| Source | Location | Role |
| --- | --- | --- |
| Colab notebook | [`CoralBleachingProjectCollab.ipynb`](../CoralBleachingProjectCollab.ipynb) | Original SAM-assisted labels, YOLOv8s-seg training, frame extraction, YOLO inference, HSV baseline, saved-output references. This is a user-supplied untracked file. |
| Kavaratti videos | `kavaratti videos_17-25/` | Six user-supplied 4K HEVC videos: `17`, `19`, `21`, `22`, `24`, `25`. About 1.6 GB total. The directory is Git-ignored. |
| Video locations | [`Kavartti video locations.xlsx`](../Kavartti%20video%20locations.xlsx) | Latitude/longitude pairs associated with video IDs or groups. Verify the `72.6999` longitude in the video 5 row before mapping. |
| Project reports | [`Mapping of Coral Reef Bleaching.docx`](../Mapping%20of%20Coral%20Reef%20Bleaching.docx), [`REPORT.docx`](../REPORT.docx), [`MiniProjectReport.pdf`](../coral-bleaching-ui/MiniProjectReport.pdf) | Intended methodology and historical claims; reports disagree on the recording date. |
| Presentation chart | `/home/dheeraj/Downloads/CoralProjectChart.pdf` | Presented workflow, example pie charts, and heatmap. The chart states 12 May 2025 for collection. Its figures need source-data verification. |
| Existing app | [`coral-bleaching-ui/`](../coral-bleaching-ui/) | Next.js UI and FastAPI HSV/GMM prototype. The `yolo` API choice currently uses HSV; the results page fabricates a comparison. |

## 2. Shared Google Drive sources

The connected Drive account is `dheerajnigam69@gmail.com`. These links were
opened successfully through the Drive connector on 4 November 2026.

| Source | Link | Contents observed |
| --- | --- | --- |
| Original project | [CoralBleaching_Project](https://drive.google.com/drive/folders/1Oc3pzB58sCGz-eOAOl3ZoWzwolhe7uEh) | `datasets`, `checkpoints`, `results`, `temp_frames`, plus empty `videos`, `notebooks`, and `annotated_videos` folders. |
| Raw class images | [datasets/raw](https://drive.google.com/drive/folders/1UYlE2U7ezsvPXubY8rVoA3aQ2_4y2kcN) | `bleached` and `healthy` folders. The notebook output records processing 184 bleached and 119 healthy source images. |
| Generated training images | [datasets/images](https://drive.google.com/drive/folders/1CJIaw3NfLVzwz8iGRpsmP-RJBHavrls7) | SAM-masked images. Folder listing is capped at 100 files per call. |
| Generated training labels | [datasets/labels](https://drive.google.com/drive/folders/1tt59S-X0weNctXJC7s8GqkTwZJLwuOeP) | YOLO polygon text labels. Folder listing is capped at 100 files per call. |
| Trained model | [weights](https://drive.google.com/drive/folders/1V25YkmairYlQdkQmyudaD0ME00JUWNmN) | `best.pt` and `last.pt`, about 23.9 MB each. |
| Training record | [yolov8_coral_seg](https://drive.google.com/drive/folders/1FHM-lD1Nh3rw9n80Lzr6ql-_IFutvYIo) | `args.yaml`, `results.csv`, plots, and validation previews. |
| YOLO results | [results](https://drive.google.com/drive/folders/1BqyMwREFRG8iKlVRmlJKbeonx19AOgzh) | Frame and video bleaching CSVs, plus pie charts. |
| HSV results | [hsv_baseline](https://drive.google.com/drive/folders/1grX2wRF_LLFquBD6csKyGu7AsZj6PP-L) | Frame and video CSVs and pie charts. |
| Extracted video frames | [temp_frames](https://drive.google.com/drive/folders/1T8GTnguEUT4D6eN7YX6LPo_fWv31ieTq) | Historical frame images; listing is capped at 100 files per call. |
| Additional extracted images | [Extracted Images (500)](https://drive.google.com/drive/folders/1grZQXJnttX_U7o_C_bfXKH070YR6Gl0N) → [all images](https://drive.google.com/drive/folders/1Yfb-VftmBj34l1w6tx9KaM69sYbB_UJ4) | Additional PNG/JPEG frames. The exact count and video provenance are not yet verified. |

The local six videos are the verified source footage available now. The notebook
references 19 video IDs across two historical Drive folders; their source
videos are not all present locally. Reproduce six-video findings first and
identify missing footage separately before reporting all-video results.

## 3. Original processing sequence

1. Read source video and extract approximately one frame per second.
2. Prepare healthy and bleached training images. The notebook uses SAM to
   generate one large mask per image and converts its contour to a YOLO polygon.
3. Fine-tune `yolov8s-seg.pt` for `bleached_coral` and `healthy_coral`.
4. Run trained YOLO segmentation on extracted frames and calculate the bleached
   fraction of detected coral pixels.
5. Independently classify pixels with HSV thresholds and calculate a bleaching
   fraction. Export frame/video CSVs and pie charts.
6. Join video summaries to checked locations for GIS-ready spatial output.
7. Display real outputs in the web interface.

## 4. Validation issues to resolve

- The notebook sets `train: images` and `val: images` in the same dataset YAML.
  Its final reported mask mAP50 of about 0.876 comes from this overlapping
  validation set; it is not an independent accuracy estimate.
- Raw healthy and bleached image folders contain repeated basenames. The notebook
  writes both classes to one output image/label folder using those basenames,
  allowing one class to overwrite the other. Its 303 processing messages yielded
  191 validation images. Inspect provenance before reusing these labels.
- The historical YOLO and HSV video CSVs disagree substantially. Some YOLO
  videos have 0% or 100% bleaching, and HSV values reach nearly 100%. The
  presentation's 28–62% range is therefore not established by these files.
- The repository API processes every fifth source frame. At roughly 60 fps that
  is about 12 frames per second, unlike the notebook's one frame per second.
- A Kaggle image-classification dataset can supplement training, but image-level
  healthy/bleached labels do not provide coral masks or a fair Kavaratti test
  set. Judge YOLO and HSV on the same independently reviewed Kavaratti frames.
- The spreadsheet gives video-level locations or endpoints, not per-frame GPS.
  Map only the spatial precision actually supported by the data.

## 5. Build sequence and review gates

1. **Inventory and data foundation:** verify file counts, hashes, naming,
   provenance, and video-to-location matches. Add reproducible 1 fps extraction
   and a manifest. Keep footage and generated frames out of Git.
2. **Ground truth:** select diverse Kavaratti frames across videos and lighting
   conditions; prepare coral/healthy/bleached annotations for human review.
   Split by video before training or threshold selection.
3. **YOLO recovery:** load the original weights for historical inference,
   inspect the SAM-generated labels, and retrain only after correcting data
   leakage and label collisions.
4. **HSV baseline:** implement documented thresholds and coral/background
   handling with configurable parameters and reproducible outputs.
5. **Comparison:** run both methods on identical held-out frames; calculate
   mask IoU/F1 and error in bleaching percentage against reviewed labels.
   Export per-frame and per-video CSVs and charts.
6. **GIS:** verify coordinates, join video summaries, export GeoJSON/CSV,
   and label any interpolation as an estimate.
7. **App and release:** replace simulated results with actual method outputs,
   document setup and limitations, run end-to-end checks, and review the Git
   diff before publishing.

At each gate, report completed work, evidence, remaining uncertainty, and the
next proposed stage. Historical results should be clearly labeled as historical
until independently reproduced.
