# Local comparison dashboard

The dashboard displays the measured external image benchmark and six-video
Kavaratti estimates. It never derives an accuracy claim from the disagreement
between YOLO and HSV. Its static data snapshot comes from
`python3 scripts/publish_summary.py` at the repository root.

## Start locally

From the repository root, after staging the Kaggle archives and recovered
`best.pt` as described in [the comparison report](../docs/EXTERNAL_BENCHMARK_AND_KAVARATTI.md):

```bash
python3 -m venv generated/external/venv
generated/external/venv/bin/pip install -r coral-bleaching-ui/backend/requirements.txt
generated/external/venv/bin/python scripts/compare_methods.py
python3 scripts/export_locations.py
python3 scripts/publish_summary.py
python3 scripts/validate_comparison.py
```

Start the upload API in one terminal:

```bash
generated/external/venv/bin/uvicorn main:app --app-dir coral-bleaching-ui/backend --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```bash
cd coral-bleaching-ui
npm ci
npm run dev
```

Open <http://localhost:3000>. The published six-video results work without the
upload API. Uploading a new video requires it; uploads and extracted temporary
frames are deleted after analysis. The API returns method estimates, not an
accuracy score. Raw footage, datasets, weights, and generated images remain in
Git-ignored directories.

Run `npm run build` for the frontend production check. The API health endpoint
is <http://127.0.0.1:8000/health>. The location download contains video-level
workbook endpoints only, with no inferred route or frame GPS.
