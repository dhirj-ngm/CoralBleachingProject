#!/usr/bin/env python3
"""Verify and unpack exact Kaggle MCP archives and recovered Drive weights."""

import argparse
import hashlib
import shutil
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "generated/external"
ASSETS = {
    "sonainjamil-v3.zip": "538fa6d8686b25d9ae41757a89fa06cb56e0cb1457a8766bb067b32143260e5e",
    "shrushti21-v1.zip": "eeadd13f4d96d51a1b2731e325d07ee5281d0eb7398a86d7d456216261e0e3b0",
    "vencerlanz09-v1.zip": "5e15452254a946a95553bb6891244d7ebbfa1f7041a4ebfe4e3d12f06654456f",
    "original-best.pt": "816b18fcd697e5e85409a283ac9344475c3ca2cc25896e8a3f92819d6410a29d",
}


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ASSETS:
        parser.add_argument("--" + name.split(".")[0], type=Path, required=True,
                            help=f"local downloaded {name}")
    args = parser.parse_args()
    DEST.mkdir(parents=True, exist_ok=True)
    for name, expected in ASSETS.items():
        source = getattr(args, name.split(".")[0].replace("-", "_"))
        if digest(source) != expected:
            raise ValueError(f"SHA-256 mismatch: {source}")
        destination = DEST / name
        if destination.exists():
            if digest(destination) != expected:
                raise ValueError(f"Existing asset differs: {destination}")
        else:
            shutil.copyfile(source, destination)
        if name.endswith(".zip"):
            output = DEST / name[:-4]
            output.mkdir(exist_ok=True)
            with zipfile.ZipFile(destination) as archive:
                for member in archive.infolist():
                    if not (output / member.filename).resolve().is_relative_to(output.resolve()):
                        raise ValueError(f"Unsafe archive member: {member.filename}")
                archive.extractall(output)
        print(f"Verified {name}: {expected}")


if __name__ == "__main__":
    main()
