#!/usr/bin/env python3
"""
Crop Instagram screenshots: extracts the photo (left side) from IG sidebar.

Flow: raw/ → processed/ (unchanged copy) + cropped/ (photo only)

Usage:
  python crop-ig.py <screenshot_path> --slug <name> [--location ...] [--date ...] [--caption ...]
  python crop-ig.py raw/Screenshot*.png --slug moth-lewes
  python crop-ig.py --batch   # process all raw/ screenshots using metadata.json mapping

Output:
  public/images/gallery/processed/<slug>.png  — original screenshot (renamed)
  public/images/gallery/cropped/<slug>.png    — cropped photo
  public/images/gallery/metadata.json         — updated entry with dimensions
"""

import sys
import os
import json
import argparse
import shutil
from pathlib import Path
from PIL import Image

SITE_ROOT = Path(__file__).resolve().parent.parent
GALLERY = SITE_ROOT / "public" / "images" / "gallery"
RAW = GALLERY / "raw"
PROCESSED = GALLERY / "processed"
CROPPED = GALLERY / "cropped"
META_FILE = GALLERY / "metadata.json"


def find_ig_split(img: Image.Image) -> int:
    """Find the x-coordinate where the IG sidebar begins.

    The sidebar is a dark (#000000 or near-black) column on the right.
    We scan from the right to find where the photo content starts.
    """
    width, height = img.size
    pixels = img.load()

    # Sample multiple rows in the middle to find the boundary
    sample_rows = [int(height * f) for f in [0.3, 0.4, 0.5, 0.6, 0.7]]

    for x in range(int(width * 0.4), int(width * 0.75)):
        dark_count = 0
        for y in sample_rows:
            r, g, b = pixels[x, y][:3]
            # IG sidebar background is very dark (near black) or the distinct gray
            if r < 30 and g < 30 and b < 30:
                dark_count += 1
        # If most sample rows show dark pixels, we found the boundary
        if dark_count >= 3:
            # Walk back to find the exact edge
            for bx in range(x, max(x - 20, 0), -1):
                still_dark = sum(
                    1 for y in sample_rows
                    if pixels[bx, y][0] < 30 and pixels[bx, y][1] < 30 and pixels[bx, y][2] < 30
                )
                if still_dark < 2:
                    return bx + 1
            return x

    # Fallback: assume ~56% is photo
    return int(width * 0.56)


def load_metadata() -> list:
    if META_FILE.exists():
        with open(META_FILE, "r") as f:
            return json.load(f)
    return []


def save_metadata(entries: list):
    with open(META_FILE, "w") as f:
        json.dump(entries, f, indent=2)
    f.close  # ensure flush


def crop_screenshot(screenshot_path: str, slug: str, extra_meta: dict | None = None):
    img = Image.open(screenshot_path).convert("RGB")

    # Copy unchanged original to processed/
    PROCESSED.mkdir(parents=True, exist_ok=True)
    processed_path = PROCESSED / f"{slug}.png"
    shutil.copy2(screenshot_path, processed_path)

    # Find where to crop
    split_x = find_ig_split(img)

    # Crop just the photo
    photo = img.crop((0, 0, split_x, img.height))

    # Save cropped photo
    CROPPED.mkdir(parents=True, exist_ok=True)
    photo.save(CROPPED / f"{slug}.png", "PNG")

    # Update metadata
    entries = load_metadata()

    # Find existing entry or create new one
    existing = next((e for e in entries if e.get("slug") == slug), None)
    if existing:
        existing["processed"] = f"processed/{slug}.png"
        existing["cropped"] = f"cropped/{slug}.png"
        existing["width"] = photo.width
        existing["height"] = photo.height
        # Track raw source filename
        raw_name = Path(screenshot_path).name
        if raw_name.startswith("Screenshot"):
            existing["raw"] = f"raw/{raw_name}"
        if extra_meta:
            existing.update(extra_meta)
        meta = existing
    else:
        meta = {
            "slug": slug,
            "source": "instagram",
            "account": "thomas.w.sanderson",
            "processed": f"processed/{slug}.png",
            "cropped": f"cropped/{slug}.png",
            "width": photo.width,
            "height": photo.height,
        }
        raw_name = Path(screenshot_path).name
        if raw_name.startswith("Screenshot"):
            meta["raw"] = f"raw/{raw_name}"
        if extra_meta:
            meta.update(extra_meta)
        entries.append(meta)

    save_metadata(entries)

    print(f"Processed: {processed_path}")
    print(f"Cropped:   {CROPPED / f'{slug}.png'} ({photo.width}x{photo.height})")
    return meta


def batch_process():
    """Process all raw/ screenshots using the slug mapping in metadata.json."""
    entries = load_metadata()

    # Build raw filename → slug mapping from metadata
    raw_to_slug = {}
    for entry in entries:
        raw_field = entry.get("raw")
        if raw_field:
            raw_filename = Path(raw_field).name
            raw_to_slug[raw_filename] = entry["slug"]

    if not raw_to_slug:
        print("No raw mappings found in metadata.json")
        return

    processed_count = 0
    for raw_file in sorted(RAW.glob("*.png")):
        slug = raw_to_slug.get(raw_file.name)
        if not slug:
            print(f"  SKIP (no slug mapping): {raw_file.name}")
            continue

        crop_screenshot(str(raw_file), slug)
        processed_count += 1

    print(f"\nBatch complete: {processed_count} images processed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Crop IG screenshots")
    parser.add_argument("screenshot", nargs="?", help="Path to screenshot file")
    parser.add_argument("--slug", help="Name for this image")
    parser.add_argument("--location", help="Location tag from IG post")
    parser.add_argument("--date", help="Date from IG post")
    parser.add_argument("--caption", help="Caption text")
    parser.add_argument("--batch", action="store_true", help="Process all raw/ screenshots using metadata.json mapping")
    args = parser.parse_args()

    if args.batch:
        batch_process()
    elif args.screenshot and args.slug:
        extra = {}
        if args.location:
            extra["location"] = args.location
        if args.date:
            extra["date"] = args.date
        if args.caption:
            extra["caption"] = args.caption
        crop_screenshot(args.screenshot, args.slug, extra or None)
    else:
        parser.error("Either provide <screenshot> --slug <name>, or use --batch")
