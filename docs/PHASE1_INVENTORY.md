# Phase 1 source inventory and provenance

## Local source footage

Six user-supplied videos are present in `kavaratti videos_17-25/`: IDs 17, 19,
21, 22, 24, and 25. Their exact byte sizes, SHA-256 hashes, codec, dimensions,
frame rates, durations, and embedded container creation timestamps are recorded
in [`source_inventory.json`](../data/phase1/source_inventory.json). The timestamp
metadata says 11 May 2025 UTC for all six, while the presentation reports
12 May 2025. The recording date therefore still needs confirmation. File hashes
identify the local copies; no independently signed camera originals are available.

The local [`Kavartti video locations.xlsx`](../Kavartti%20video%20locations.xlsx)
(SHA-256 `2ecdda62740fa449d3b6cdfc47d7902748d1b2e23645ca19104c5b4d71429cb1`)
has one shared start/end coordinate range for IDs 17–19 and individual ranges for
21, 22, 24, and 25. These are video or group endpoints, not per-frame positions.
The apparent `72.6999` longitude error is in the row for video 5, which is not
among the six local videos.

The user-supplied [`CoralBleachingProjectCollab.ipynb`](../CoralBleachingProjectCollab.ipynb)
(SHA-256 `1aa07b329c73436e95e62796cd8f40186c2a2f00d3d7a3913d4bf292aba47fae`)
contains the original OpenCV extraction loop. It samples every integer number
of source frames based on nominal FPS. The new workflow uses FFmpeg's timestamp
grid, so output counts may differ slightly; the two sets must not be silently
merged.

## Shared Drive artifacts checked

- [Raw class images](https://drive.google.com/drive/folders/1UYlE2U7ezsvPXubY8rVoA3aQ2_4y2kcN): `healthy` and `bleached` folders exist. The notebook reports processing 119 healthy and 184 bleached images, but Drive listing is capped at 100 per folder, so exact current counts and duplicate basenames remain unverified.
- [Generated training images](https://drive.google.com/drive/folders/1CJIaw3NfLVzwz8iGRpsmP-RJBHavrls7) and [polygon labels](https://drive.google.com/drive/folders/1tt59S-X0weNctXJC7s8GqkTwZJLwuOeP) exist. Both listings are capped at 100. The notebook writes both classes under shared basenames, which can overwrite output pairs. Their provenance and class balance need inspection before reuse.
- [Weights](https://drive.google.com/drive/folders/1V25YkmairYlQdkQmyudaD0ME00JUWNmN) contains `best.pt` and `last.pt` (23,864,500 bytes each). [Training record](https://drive.google.com/drive/folders/1FHM-lD1Nh3rw9n80Lzr6ql-_IFutvYIo) contains `args.yaml`, `results.csv`, training plots, and validation previews. The notebook dataset configuration points both train and validation to `images`, so its metrics are not independent validation.
- [YOLO results](https://drive.google.com/drive/folders/1BqyMwREFRG8iKlVRmlJKbeonx19AOgzh) and [HSV results](https://drive.google.com/drive/folders/1grX2wRF_LLFquBD6csKyGu7AsZj6PP-L) contain frame/video CSVs and charts. Their video summaries cover 19 IDs: 1–10 and 17–25. The methods disagree substantially (for example, video 17 is 0% YOLO and about 89% HSV). All historical bleaching and accuracy numbers remain unverified.
- The original project's [videos folder](https://drive.google.com/drive/folders/1bwLLcuZTUSbJeErGqUTQbGUveOTqUaXz) is empty. [Historical frames](https://drive.google.com/drive/folders/1T8GTnguEUT4D6eN7YX6LPo_fWv31ieTq) and [additional extracted images](https://drive.google.com/drive/folders/1Yfb-VftmBj34l1w6tx9KaM69sYbB_UJ4) exist, but listings are capped at 100 and do not establish their source video hashes or frame timestamps.

The historical result IDs without local footage are **1–10, 18, 20, and 23**.
The location workbook also mentions 11–16, which are absent from those result
summaries and have no verified local footage. These IDs cannot be included in a
reproducible local video analysis without recovering their sources.

## Extraction and manifest

With FFmpeg/FFprobe on the path, run:

```bash
python3 scripts/extract_kavaratti_frames.py
```

This requires exactly the six named local MP4 files and refuses to replace an
existing nonempty output directory. It writes JPEGs to ignored
`generated/phase1/frames/<video_id>/<timestamp_seconds>.jpg`, a tracked
[`frame_manifest.csv`](../data/phase1/frame_manifest.csv), and the tracked source
inventory. The manifest records the video ID, source path and hash, timestamp
seconds from video start, frame path, and frame hash. Samples are on a one-second
grid beginning at 0, selected by FFmpeg's `fps` filter with nearest rounding;
they are not camera wall-clock times or exact source-frame presentation times.
JPEG encoding and frame hashes may change with FFmpeg builds. Move the generated
directory aside before intentionally extracting again. Do not combine outputs
from different source hashes or extraction versions.

| Video ID | Extracted frames | Timestamp grid (seconds) |
| --- | ---: | --- |
| 17 | 16 | 0–15 |
| 19 | 44 | 0–43 |
| 21 | 28 | 0–27 |
| 22 | 54 | 0–53 |
| 24 | 65 | 0–64 |
| 25 | 58 | 0–57 |

Total: 265 frames, 218,523,079 generated JPEG bytes. All manifest frame hashes,
source hashes, and contiguous timestamp sequences were checked after extraction.

## Phase 2 decisions

Confirm the actual recording date and whether more original videos or camera
metadata can be supplied. Decide whether to label only these six videos for an
initial held-out test set. Any use of historical class images or weights will
require a duplicate/provenance audit and a video-separated evaluation split.
