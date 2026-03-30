#!/usr/bin/env python3
"""
sync_dirs.py - Sync files from source to destination directory.

Usage:
    python sync_dirs.py <source_dir> <destination_dir>

Copies files from source to destination only if:
  - The file does not exist in the destination, OR
  - The file size differs between source and destination
"""

import os
import sys
import shutil


def sync_directories(src: str, dst: str) -> None:
    # Validate source
    if not os.path.isdir(src):
        print(f"Error: Source directory '{src}' does not exist or is not a directory.")
        sys.exit(1)

    # Create destination if it doesn't exist
    os.makedirs(dst, exist_ok=True)

    copied_files = []

    for root, dirs, files in os.walk(src):
        # Compute the relative path from the source root
        rel_root = os.path.relpath(root, src)

        for filename in files:
            src_file = os.path.join(root, filename)

            # Mirror the subdirectory structure in the destination
            dst_dir = os.path.join(dst, rel_root) if rel_root != "." else dst
            dst_file = os.path.join(dst_dir, filename)

            # Determine whether the file needs to be copied
            src_size = os.path.getsize(src_file)
            needs_copy = (
                not os.path.exists(dst_file)
                or os.path.getsize(dst_file) != src_size
            )

            if needs_copy:
                os.makedirs(dst_dir, exist_ok=True)
                shutil.copy2(src_file, dst_file)

                # Build a readable relative path for reporting
                rel_path = os.path.relpath(dst_file, dst)
                reason = "new file" if not os.path.exists(dst_file) else "size changed"
                copied_files.append((rel_path, reason))

    # Summary
    print(f"\nSync complete: {src}  →  {dst}\n")
    if copied_files:
        print(f"{'File':<60} {'Reason'}")
        print("-" * 75)
        for rel_path, reason in copied_files:
            print(f"{rel_path:<60} {reason}")
        print(f"\nTotal files copied: {len(copied_files)}")
    else:
        print("No files needed to be copied — destination is already up to date.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python sync_dirs.py <source_dir> <destination_dir>")
        sys.exit(1)

    source = sys.argv[1]
    destination = sys.argv[2]
    sync_directories(source, destination)
