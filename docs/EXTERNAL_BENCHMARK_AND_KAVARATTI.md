# External image benchmark and six-video Kavaratti estimates

This run uses the recovered original `best.pt` and an independently coded HSV
baseline. It preserves all Phase 1 and Phase 2 assets. The 24 provisional
Kavaratti annotation masks remain optional review material; they were not used
as reference labels, training data, or threshold-tuning data.

## Kaggle source audit

| Dataset | Actual contents and labels | Provenance and licence | Decision |
| --- | --- | --- | --- |
| [sonainjamil/bleached-corals-detection](https://www.kaggle.com/datasets/sonainjamil/bleached-corals-detection), version 3 | 342 PNG images: 184 `Train/Bleached`, 158 `Train/Unbleached`; folder-level image labels, no masks | Paper-associated dataset, CC BY 4.0. Drive raw `bleached/9.png` and `healthy/3.png` exactly match this archive byte for byte. | HSV tuning only. Excluded from test because the recovered YOLO was trained on overlapping Drive images. |
| [shrushti21/coral-bleaching-yolo4](https://www.kaggle.com/datasets/shrushti21/coral-bleaching-yolo4), version 1 | 1,328 JPGs and 1,328 YOLO text label files; 8,035 five-value **box** rows, classes `bleached` (0) and `healthy` (1). Supplied train/valid/test image counts: 980/206/142. | Kaggle metadata says licence **unknown**; embedded Roboflow README points to [Coral Bleaching v3](https://universe.roboflow.com/fcosefficientnet-0p10w/coral-bleaching-dxxrf/dataset/3) and states CC BY 4.0. README says Gaussian blur and salt-and-pepper augmentation. | Not used for scoring. Across 294 filename-derived source groups, 168 occur in multiple supplied splits; three visually match Sonain images. Boxes are not segmentation masks. |
| [vencerlanz09/healthy-and-bleached-corals-image-classification](https://www.kaggle.com/datasets/vencerlanz09/healthy-and-bleached-corals-image-classification), version 1 | 923 Flickr JPG/PNG images, 485 in `bleached_corals`, 438 in `healthy_corals`; direct image-level folder labels, no masks | Dataset metadata states an Open Database License for the database and copyright retained by the original image authors. Images stay in ignored local storage and are not republished here. | Held-out external image-level test after duplicate and overlap filtering. |

The Vencerlanz archive has nine identical filenames in both class folders, so
those contradictory groups were excluded. A 64-bit difference hash grouped
images at Hamming distance at most 4, yielding 900 source groups from 923
files. Nine conflicting-label groups were excluded. Eight additional source
groups were excluded because their representative images were within dHash
distance 8 of a Sonain image. The resulting **883 test images** have 462
bleached and 421 healthy supplied labels. The exact decisions and image hashes
are in ignored `generated/comparison/external_source_audit.csv` and the
Roboflow split audit is in `roboflow_source_audit.csv`. Perceptual matching
reduces known overlap, but cannot prove that every remaining photograph is
independent of every original training image or photographer sequence.

The source archives, checkpoint, and decoded images are under ignored
`generated/external/`. Their SHA-256 hashes are checked by
[`stage_external_assets.py`](../scripts/stage_external_assets.py) and recorded
in `generated/comparison/run_provenance.json`. To reproduce acquisition, fetch
the named dataset versions through the connected Kaggle MCP and `best.pt` from
the [Drive weights folder](https://drive.google.com/drive/folders/1V25YkmairYlQdkQmyudaD0ME00JUWNmN),
then pass those downloaded files to the staging script. Signed download URLs
expire and are not committed.

## Method and separation

- The external **test** is the 883 filtered Vencerlanz images. The 342 Sonain
  images are used only to select the HSV image decision cutoff by maximizing
  balanced accuracy on a 0.00–1.00 grid. The cutoff selected was **0.74**.
  No test label was used to tune either method.
- Recovered YOLO: original `best.pt`, two classes (`bleached_coral`,
  `healthy_coral`), CPU inference at image size 640 and confidence 0.25. An
  image is predicted bleached if it has any class-0 detection; no detection
  gives a negative image prediction. This is distinct from its per-video
  fraction of detected coral mask pixels.
- Independent HSV: OpenCV HSV on each image resized to maximum dimension 640.
  Pale pixels satisfy `S <= 60, V >= 180`; brown pixels satisfy
  `H = 10..30, S >= 80, V = 50..200` (OpenCV ranges). The pale color fraction
  is `pale / (pale + brown)` and is classified with the tuning cutoff.
  No eligible-color pixels gives a negative image prediction and a missing
  fraction. This is a color rule, not a coral segmentation mask.
- The external dataset supplies only image labels. Accuracy, precision,
  recall, and F1 therefore measure **agreement with those image labels**.
  No mask IoU, mask F1, or bleaching-percentage accuracy is calculated.
- Kavaratti uses all 265 verified one-second frames from six videos. YOLO's
  per-frame estimate is class-0 detected-mask pixels divided by all detected
  coral-class mask pixels. HSV's per-frame estimate is the pale color fraction.
  A frame with no valid denominator is null, not 0%. The per-video figures are
  arithmetic means of valid frame estimates. Their absolute difference is
  called **disagreement**, not accuracy.

The supplied external image labels themselves have limitations. A fixed-seed
visual spot check showed broad reef scenes and one healthy-folder photograph
centered on a non-coral animal. Thus even the external image-level metrics are
conditional on imperfect labels and do not establish ecological accuracy.

## Run and validation

Use a Python environment with CPU PyTorch 2.15.0, CPU torchvision 0.29.2,
Ultralytics 8.3.240, OpenCV, NumPy, and Pillow. From the repository root:

```bash
python3 scripts/stage_external_assets.py --sonainjamil-v3 /path/to/sonain.zip --shrushti21-v1 /path/to/shrushti.zip --vencerlanz09-v1 /path/to/vencerlanz.zip --original-best /path/to/best.pt
generated/external/venv/bin/python scripts/compare_methods.py
python3 scripts/export_locations.py
python3 scripts/publish_summary.py
python3 scripts/validate_comparison.py
```

The comparison script writes ignored CSV/JSON records in
`generated/comparison/`: external source and Roboflow audits, HSV tuning
images, external test predictions and metrics, Kavaratti frame and video
estimates, and run provenance. It is read-only with respect to Phase 1/2
outputs, source videos, notebook, and downloaded archives.

## Results and interpretation

External image-level test, 883 photos (462 supplied bleached, 421 supplied
healthy):

| Method | Accuracy | Precision (bleached) | Recall (bleached) | F1 | TP / TN / FP / FN |
| --- | ---: | ---: | ---: | ---: | --- |
| Recovered YOLO | 64.21% | 61.37% | 85.28% | 71.38% | 394 / 173 / 248 / 68 |
| HSV, cutoff 0.74 | 56.51% | 63.00% | 40.91% | 49.61% | 189 / 310 / 111 / 273 |

YOLO exceeds this HSV decision rule by 7.70 percentage points in accuracy and
21.77 points in F1 on these supplied labels. The result supports only this
specific external **image classification** comparison. The model produced no
detections on 16 test photos; the HSV rule found no eligible pale or brown
pixels on 57. These cases received negative image predictions by the declared
rules. No test image was used to set the HSV cutoff. The external photographs
are from other places and times; these scores cannot verify Kavaratti bleaching
percentages, coral localization, GIS precision, or the state of any colony.

Six-video Kavaratti estimates use paired frames where both methods returned a
fraction. The paired means are shown for comparison, while mean absolute
disagreement averages the per-frame absolute differences:

| Video | Frames | Paired valid frames | YOLO detected-mask estimate | HSV pale-color estimate | Mean absolute disagreement |
| --- | ---: | ---: | ---: | ---: | ---: |
| 17 | 16 | 10 | 4.97% | 84.57% | 79.60 points |
| 19 | 44 | 40 | 23.84% | 63.32% | 46.41 points |
| 21 | 28 | 28 | 48.17% | 73.84% | 36.68 points |
| 22 | 54 | 51 | 56.92% | 85.20% | 43.76 points |
| 24 | 65 | 61 | 60.72% | 85.17% | 28.27 points |
| 25 | 58 | 50 | 41.08% | 58.14% | 37.02 points |

YOLO has no valid denominator on 25 of 265 frames. Among its 240 valid frames,
92 estimates are exactly 0% and 72 are exactly 100%; those extremes need
manual inspection before any ecological interpretation. HSV returned a color
fraction on all 265 frames but includes bright sand, water, and lighting effects
because it has no verified coral/background mask. The two denominators differ,
so even the paired mean difference is a method disagreement, **not accuracy**.

Results and source-linked rows are in generated `external_metrics.json`,
`external_test_predictions.csv`, `kavaratti_frame_estimates.csv`, and
`kavaratti_video_estimates.csv`. Kavaratti values remain estimates until
independently reviewed Kavaratti labels exist.

## App and GIS output

[`export_locations.py`](../scripts/export_locations.py) joins the six video
summaries to the local workbook. It writes ignored CSV and GeoJSON outputs in
`generated/comparison/`. Each GeoJSON feature is a **MultiPoint** containing
the workbook start and end coordinates. Videos 17 and 19 deliberately share
the 17–19 location group. A point pair is not a swim path or per-frame GPS, and
no intermediate positions are fabricated. The unrelated video-5 longitude
anomaly remains unresolved and is not in this six-video export.

[`publish_summary.py`](../scripts/publish_summary.py) copies a small, real
results snapshot and the endpoint GeoJSON into the Next.js `public/` directory.
The local dashboard reads these files. Its optional upload route runs the same
FFmpeg 1 fps, original YOLO, and HSV methods on a new video through FastAPI and
returns estimates with nulls for missing denominators. It neither trains the
model nor compares uploads to ground truth. See the [app README](../coral-bleaching-ui/README.md)
for local startup commands.
