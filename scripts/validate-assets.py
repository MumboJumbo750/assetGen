import argparse
import itertools
import json
import os
import re
import sys


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def expand_pattern(pattern, vars_map, lists):
    keys = list(vars_map.keys())
    values = []
    for key in keys:
        list_name = vars_map[key]
        if list_name not in lists:
            raise KeyError(f"Unknown list '{list_name}' for '{key}'")
        values.append(lists[list_name])
    for combo in itertools.product(*values):
        result = pattern
        for key, value in zip(keys, combo):
            result = result.replace("{" + key + "}", value)
        yield result


def parse_size(value):
    if not value or not isinstance(value, str):
        return None
    if "x" not in value:
        return None
    parts = value.lower().split("x")
    if len(parts) != 2:
        return None
    try:
        return int(parts[0]), int(parts[1])
    except ValueError:
        return None


def get_png_size(path):
    try:
        with open(path, "rb") as f:
            header = f.read(24)
    except OSError:
        return None
    if len(header) < 24 or header[:8] != PNG_SIGNATURE:
        return None
    width = int.from_bytes(header[16:20], "big")
    height = int.from_bytes(header[20:24], "big")
    return width, height


def parse_int_cell(value):
    if not value:
        return None
    text = value.strip()
    if text.isdigit():
        return int(text)
    return None


def parse_size_cell(value):
    if not value:
        return None
    match = re.search(r"(\d+)\s*x\s*(\d+)", value)
    if not match:
        return None
    return int(match.group(1)), int(match.group(2))


def extract_backtick_path(value):
    if not value:
        return None
    match = re.search(r"`([^`]+)`", value)
    if match:
        return match.group(1).strip()
    return None


def parse_spritesheet_spec(path):
    entries = []
    if not os.path.exists(path):
        return entries

    headers = None
    header_map = {}
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for line in lines:
        stripped = line.strip()
        if not stripped.startswith("|") or not stripped.endswith("|"):
            headers = None
            header_map = {}
            continue

        cols = [c.strip() for c in stripped.strip("|").split("|")]
        if headers is None:
            lower = [c.lower() for c in cols]
            if any("file" in c for c in lower) and (
                any("frame" in c for c in lower) or any(c == "size" for c in lower)
            ):
                headers = cols
                header_map = {c.lower(): idx for idx, c in enumerate(cols)}
            continue

        if all(set(c) <= {"-"} for c in cols):
            continue

        file_idx = None
        frame_size_idx = None
        frames_idx = None
        size_idx = None

        for name, idx in header_map.items():
            if "file" in name and file_idx is None:
                file_idx = idx
            if "frame size" in name and frame_size_idx is None:
                frame_size_idx = idx
            if name == "frames" and frames_idx is None:
                frames_idx = idx
            if name == "size" and size_idx is None:
                size_idx = idx

        file_cell = cols[file_idx] if file_idx is not None and file_idx < len(cols) else ""
        path_value = extract_backtick_path(file_cell)
        if not path_value:
            continue

        frame_size = None
        if frame_size_idx is not None and frame_size_idx < len(cols):
            frame_size = parse_size_cell(cols[frame_size_idx])

        frames_value = None
        if frames_idx is not None and frames_idx < len(cols):
            frames_value = parse_int_cell(cols[frames_idx])

        explicit_size = None
        if size_idx is not None and size_idx < len(cols):
            explicit_size = parse_size_cell(cols[size_idx])

        expected_size = None
        if explicit_size:
            expected_size = explicit_size
        elif frame_size and frames_value:
            expected_size = (frame_size[0] * frames_value, frame_size[1])

        if expected_size:
            entries.append({"rel_path": path_value, "expected_size": expected_size})

    return entries


def collect_paths(index):
    root = index.get("root", "")
    lists = index.get("lists", {})
    entries = index.get("entries", [])

    expected = []
    for entry in entries:
        entry_type = entry.get("type")
        status = entry.get("status", "required")
        size = entry.get("size")
        fmt = entry.get("format")
        if entry_type == "file":
            expected.append((entry.get("path"), status, size, fmt))
        elif entry_type == "pattern":
            pattern = entry.get("pattern")
            vars_map = entry.get("vars", {})
            for path in expand_pattern(pattern, vars_map, lists):
                expected.append((path, status, size, fmt))
        else:
            raise ValueError(f"Unknown entry type: {entry_type}")

    resolved = []
    for path, status, size, fmt in expected:
        if not path:
            continue
        full_path = os.path.normpath(os.path.join(root, path))
        resolved.append(
            {
                "rel_path": path,
                "full_path": full_path,
                "status": status,
                "size": size,
                "format": fmt,
            }
        )
    return resolved


def main():
    parser = argparse.ArgumentParser(
        description="Validate asset index files exist (and optionally emit a machine-readable report)."
    )
    parser.add_argument(
        "--index",
        default="specs/zelos-asset-index.json",
        help="Path to asset index JSON",
    )
    parser.add_argument(
        "--root",
        default=None,
        help="Override root path (defaults to index root)",
    )
    parser.add_argument(
        "--include-planned",
        action="store_true",
        help="Include entries marked status=planned",
    )
    parser.add_argument(
        "--include-optional",
        action="store_true",
        help="Include entries marked status=optional",
    )
    parser.add_argument(
        "--check-size",
        action="store_true",
        help="Validate PNG dimensions against the size field when available",
    )
    parser.add_argument(
        "--spritesheet-spec",
        default=None,
        help="Path to spritesheet metadata markdown file",
    )
    parser.add_argument(
        "--strict-spritesheets",
        action="store_true",
        help="Fail when spritesheet spec files are missing on disk",
    )

    parser.add_argument(
        "--report",
        choices=["text", "json"],
        default="text",
        help="Report output format: text (default) or json",
    )
    parser.add_argument(
        "--report-path",
        default=None,
        help="Optional path to write the report (useful with --report json)",
    )

    args = parser.parse_args()

    if not os.path.exists(args.index):
        print(f"Index not found: {args.index}")
        return 2

    with open(args.index, "r", encoding="utf-8") as f:
        index = json.load(f)

    if args.root:
        index["root"] = args.root

    expected = collect_paths(index)

    allowed_status = {"required"}
    if args.include_planned:
        allowed_status.add("planned")
    if args.include_optional:
        allowed_status.add("optional")

    missing = []
    size_mismatches = []
    present = 0
    expected_by_rel_path = {}

    for entry in expected:
        rel_path = entry["rel_path"]
        full_path = entry["full_path"]
        status = entry["status"]
        if status not in allowed_status:
            continue

        expected_by_rel_path[rel_path] = {
            "rel_path": rel_path,
            "full_path": full_path,
            "status": status,
            "format": entry.get("format"),
            "size": entry.get("size"),
        }

        if os.path.exists(full_path):
            present += 1
            if args.check_size:
                expected_size = parse_size(entry.get("size"))
                fmt = (entry.get("format") or "").lower()
                if expected_size and (fmt == "png" or rel_path.lower().endswith(".png")):
                    actual_size = get_png_size(full_path)
                    if actual_size and actual_size != expected_size:
                        size_mismatches.append((rel_path, expected_size, actual_size))
        else:
            missing.append(rel_path)

    total = present + len(missing)
    print(f"Checked: {total} | Present: {present} | Missing: {len(missing)}")

    exit_code = 0
    if missing or size_mismatches:
        exit_code = 1

    if args.report == "text":
        if missing:
            print("Missing files:")
            for path in missing:
                print(f"- {path}")
        if size_mismatches:
            print("Size mismatches:")
            for path, expected_size, actual_size in size_mismatches:
                print(
                    f"- {path} expected {expected_size[0]}x{expected_size[1]}, got {actual_size[0]}x{actual_size[1]}"
                )

    sheet_entries = []
    sheet_missing = []
    sheet_mismatches = []
    sheet_checked = 0

    if args.spritesheet_spec:
        sheet_entries = parse_spritesheet_spec(args.spritesheet_spec)
        root = index.get("root", "")
        for entry in sheet_entries:
            rel_path = entry["rel_path"]
            expected_size = entry["expected_size"]
            full_path = os.path.normpath(os.path.join(root, rel_path))
            if not os.path.exists(full_path):
                sheet_missing.append(rel_path)
                continue
            sheet_checked += 1
            actual_size = get_png_size(full_path)
            if actual_size and actual_size != expected_size:
                sheet_mismatches.append((rel_path, expected_size, actual_size))
            elif actual_size is None:
                sheet_mismatches.append((rel_path, expected_size, ("?", "?")))

        print(f"Spritesheet metadata: {len(sheet_entries)} | Checked: {sheet_checked} | Missing: {len(sheet_missing)}")
        if sheet_missing:
            print("Spritesheet files missing:")
            for path in sheet_missing:
                print(f"- {path}")
        if sheet_mismatches:
            print("Spritesheet size mismatches:")
            for path, expected_size, actual_size in sheet_mismatches:
                print(f"- {path} expected {expected_size[0]}x{expected_size[1]}, got {actual_size[0]}x{actual_size[1]}")

        if sheet_mismatches or (sheet_missing and args.strict_spritesheets):
            exit_code = 1

    if args.report == "json":
        missing_items = []
        for rel_path in missing:
            meta = expected_by_rel_path.get(rel_path, {"rel_path": rel_path})
            expected_size = parse_size(meta.get("size"))
            missing_items.append(
                {
                    **meta,
                    "expected_size": expected_size,
                }
            )

        mismatch_items = []
        for rel_path, expected_size, actual_size in size_mismatches:
            mismatch_items.append(
                {
                    "rel_path": rel_path,
                    "full_path": expected_by_rel_path.get(rel_path, {}).get("full_path"),
                    "expected_size": expected_size,
                    "actual_size": actual_size,
                }
            )

        sheet_mismatch_items = []
        for rel_path, expected_size, actual_size in sheet_mismatches:
            sheet_mismatch_items.append(
                {
                    "rel_path": rel_path,
                    "expected_size": expected_size,
                    "actual_size": actual_size,
                }
            )

        report_obj = {
            "index": args.index,
            "root": index.get("root", ""),
            "checked": total,
            "present": present,
            "missing": missing_items,
            "size_mismatches": mismatch_items,
            "spritesheet_spec": args.spritesheet_spec,
            "spritesheet_entries": sheet_entries,
            "spritesheet_checked": sheet_checked,
            "spritesheet_missing": sheet_missing,
            "spritesheet_size_mismatches": sheet_mismatch_items,
        }

        report_text = json.dumps(report_obj, indent=2)
        if args.report_path:
            os.makedirs(os.path.dirname(args.report_path) or ".", exist_ok=True)
            with open(args.report_path, "w", encoding="utf-8") as f:
                f.write(report_text)
            print(f"Wrote report: {args.report_path}")
        else:
            print(report_text)

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
