# Phase 2 annotation preparation and review

## Scope and provenance

The [annotation manifest](../data/phase2/annotation_manifest.csv) selects 24 of
the 265 locally verified Phase 1 frames: four early, middle, and late moments
from each of videos 17, 19, 21, 22, 24, and 25. The selection covers dense
branching reef, pale colonies, shaded reef, open water, sand, fish, haze, and
motion blur. Each row carries the video ID, second from video start, original
video and frame paths and SHA-256 hashes, split, proposal mask and overlay paths,
scene note, ambiguity note, and `needs_review` status. The source footage and
Phase 1 outputs were not changed.

These are **sparse provisional seed masks**, manually placed after inspecting
the frames. They use neither SAM output nor HSV thresholds. An ellipse marks a
small example region and does not trace a coral colony. Every pixel outside a
seed is `ignore`, including clearly visible areas that still need tracing. No
mask is ground truth and none is approved for training or evaluation.

| Split | Whole video IDs | Frames requiring review (seconds from video start) |
| --- | --- | --- |
| Train | 17, 19, 24 | 17: 1, 5, 10, 14; 19: 1, 14, 29, 42; 24: 1, 21, 43, 63 |
| Development | 21 | 1, 9, 18, 26 |
| Test | 22, 25 | 22: 1, 18, 36, 52; 25: 1, 19, 38, 56 |

The two video 21 frames at 1 and 26 seconds are entirely `ignore` because
motion blur or surface distortion prevents a defensible visual proposal. They
remain in the review queue so a reviewer can either trace recoverable regions
or reject them. Test videos 22 and 25 must stay unseen during model fitting,
threshold tuning, and other development decisions. No Kaggle images are in the
Kavaratti test set; any later use of external images must be confined to the
training side and recorded separately.

## Pixel labels

Masks are 8-bit grayscale PNGs at the source frame's **3840 × 2160** size:

| Value | Name | Rule |
| ---: | --- | --- |
| 0 | Background | Clearly non-coral water, sand, rock, fish, or other objects. Do not call white sand bleached coral. |
| 1 | Healthy coral | Visible living coral tissue with credible normal pigmentation for that colony and lighting. Trace tissue, excluding gaps and adjacent water. |
| 2 | Bleached coral | Visible living coral tissue with credible loss of pigmentation. White appearance alone is insufficient; compare colony structure, remaining tissue, light, and nearby colonies. |
| 255 | Uncertain / ignore | Blur, haze, glare, shadow, bare skeleton, uncertain species or tissue state, ambiguous boundaries, and any not-yet-reviewed area. Exclude from loss and evaluation. |

When two classes touch, trace at the visible tissue boundary. Keep a narrow
`ignore` border where that boundary is unresolved. If a colony is naturally
pale or dead rather than visibly bleached living tissue, change the proposed
`2` to `1`, `0`, or `255` based on expert judgment and document why. A coral
expert should adjudicate all bleached candidates. For a later video bleaching
fraction, test masks need sufficiently complete coverage of discernible coral;
the current sparse seeds are not suitable for that calculation.

## Review workflow

1. Open the original full-size frame and matching overlay named in the
   [manifest](../data/phase2/annotation_manifest.csv). The local overlays in
   `generated/phase2/overlays/` show blue background, green healthy candidate,
   and red bleached candidate. Untinted pixels are `ignore`.
2. Open the matching full-size grayscale mask in `generated/phase2/masks/` in
   an image editor. Correct seed placement, trace coral tissue and background,
   and leave unresolved pixels at 255. Inspect the original pixels at full
   resolution, especially pale coral and bright sand. Record any disputed
   classification in the review log.
3. Save the corrected 8-bit grayscale PNG under
   `generated/phase2/reviewed_masks/<sample_id>.png`. Keep the proposal mask
   unchanged. For unusable frames, mark `rejected` and explain why.
4. Update that sample's row in
   [review_log.csv](../data/phase2/review_log.csv): `approved` or `rejected`,
   reviewer name, UTC review time, reviewed mask path for approvals, and decision
   notes. Run `python3 scripts/validate_phase2.py`. Approval requires a
   corrected mask; the validator checks its size and values. A second reviewer
   should resolve disputed bleaching calls on test frames before the test set
   is used.

The reproducible proposal instructions are in
[`proposal_regions.json`](../data/phase2/proposal_regions.json). From the
project root, `python3 scripts/prepare_phase2.py` creates proposals once;
after editing the proposal regions, `--rebuild-proposals` regenerates only the
provisional masks, overlays, and annotation manifest. It leaves the review log
and any `reviewed_masks` untouched. Generated images live under the Git-ignored
`generated/` directory; metadata, proposals, and review state are tracked.

## Ambiguities to resolve

- Videos 17 and 22 have white branch tips and bright branches that may reflect
  species, sunlight, exposure, dead skeleton, or bleaching.
- Video 25 at 56 seconds has a prominent white boulder colony. Living tissue
  and bleaching status require coral expertise; the red seed is a question.
- Video 19 at 42 seconds and video 24 at 43 seconds are distant and hazy.
  Their dark or pale regions may not support reliable tissue classification.
- Video 21 at 1 and 26 seconds and video 22 at 1 second have blur, surface
  distortion, or deep shadow. Reviewers may need to reject some areas.
- Fish, water, and white sand occur beside coral in videos 19, 24, and 25.
  Seed ellipses can cross boundaries and must be refined, not adopted as labels.

There is no approved mask yet. Phase 3 training and any comparative accuracy
report must wait for reviewed labels and a frozen test set.
