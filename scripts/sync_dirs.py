#!/usr/bin/env python3
"""
sync_dirs.py - Sync one or more source/destination directory pairs.

Usage:
    # Single pair (same as before):
    python3 sync_dirs.py <source_dir> <destination_dir>

    # Multiple pairs via JSON config file:
    python3 sync_dirs.py --config sync_config.json

Config file format (sync_config.json):
    [
        {
            "source": "/Volume1/Documents",
            "destination": "/Volume1/@usb/usbshare_sdc1/Documents"
        },
        {
            "source": "/Volume1/Movies",
            "destination": "/Volume1/@usb/usbshare_sdc1/Movies"
        }
    ]

Copies files only if:
  - The file does not exist in the destination, OR
  - The file size differs between source and destination
"""

import os
import sys
import json
import shutil


def sync_pair(src: str, dst: str) -> list[tuple[str, str]]:
    """Sync a single source→destination pair. Returns list of (rel_path, reason) copied."""

    if not os.path.isdir(src):
        print(f"  ERROR: Source '{src}' does not exist or is not a directory. Skipping.")
        return []

    os.makedirs(dst, exist_ok=True)
    copied_files = []

    for root, dirs, files in os.walk(src):
        rel_root = os.path.relpath(root, src)

        for filename in files:
            src_file = os.path.join(root, filename)
            dst_dir  = os.path.join(dst, rel_root) if rel_root != "." else dst
            dst_file = os.path.join(dst_dir, filename)

            try:
                # Get sizes. For broken symlinks, getsize() raises OSError.
                src_size   = os.path.getsize(src_file)
                dst_exists = os.path.exists(dst_file)
                needs_copy = (not dst_exists) or (os.path.getsize(dst_file) != src_size)
            except OSError:
                # This handles broken symlinks or files that disappear during walk
                continue

            if needs_copy:
                reason = "new file" if not dst_exists else "size changed"
                os.makedirs(dst_dir, exist_ok=True)
                shutil.copy2(src_file, dst_file)
                rel_path = os.path.relpath(dst_file, dst)
                copied_files.append((rel_path, reason))

    return copied_files


def print_results(src: str, dst: str, copied_files: list[tuple[str, str]]) -> None:
    print(f"\n{'='*75}")
    print(f"  {src}")
    print(f"  → {dst}")
    print(f"{'='*75}")

    if copied_files:
        print(f"  {'File':<56} {'Reason'}")
        print(f"  {'-'*70}")
        for rel_path, reason in copied_files:
            print(f"  {rel_path:<56} {reason}")
        print(f"\n  Files copied: {len(copied_files)}")
    else:
        print("  No files needed copying — already up to date.")


def load_pairs_from_config(config_path: str) -> list[dict]:
    if not os.path.isfile(config_path):
        print(f"Error: Config file '{config_path}' not found.")
        sys.exit(1)
    with open(config_path) as f:
        try:
            pairs = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in config file — {e}")
            sys.exit(1)
    if not isinstance(pairs, list) or not all("source" in p and "destination" in p for p in pairs):
        print("Error: Config must be a JSON array of objects with 'source' and 'destination' keys.")
        sys.exit(1)
    return pairs


def main() -> None:
    args = sys.argv[1:]

    # --config <file>
    if len(args) == 2 and args[0] == "--config":
        pairs = load_pairs_from_config(args[1])

    # Two plain paths  →  single pair (backwards-compatible)
    elif len(args) == 2:
        pairs = [{"source": args[0], "destination": args[1]}]

    else:
        print("Usage:")
        print("  python3 sync_dirs.py <source_dir> <destination_dir>")
        print("  python3 sync_dirs.py --config sync_config.json")
        sys.exit(1)

    total_copied = 0
    num_pairs = len(pairs)
    for i, pair in enumerate(pairs, start=1):
        src = pair["source"]
        dst = pair["destination"]
        copied = sync_pair(src, dst)
        print_results(src, dst, copied)
        total_copied += len(copied)
        print(f"  Summary: {i}/{num_pairs} pairs complete — {total_copied} file(s) copied so far.")

    print(f"\nDone. Total files copied across all pairs: {total_copied}\n")


if __name__ == "__main__":
    main()
