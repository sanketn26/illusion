#!/usr/bin/env python3
"""Validate docs/catalog.txt and generate site/topics-data.js and docs/catalog.md.

Run from anywhere:
  python3 scripts/build_catalog.py          validate, regenerate, print batch progress
  python3 scripts/build_catalog.py --next   print the brief for the next unfinished batch
Exits non-zero if the catalogue is inconsistent.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "catalog.txt"
LEVELS = {"S": "Starter", "M": "Moderate", "H": "Hard", "X": "Advanced"}
errors = []


def err(msg):
    errors.append(msg)


def parse():
    domains, topics, paths, batches = [], [], [], []
    for n, raw in enumerate(SRC.read_text(encoding="utf-8").splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith("# ") or line == "#":
            continue
        if line.startswith("## "):
            code, name, blurb = [p.strip() for p in line[3:].split("|")]
            domains.append({"code": code, "name": name, "blurb": blurb})
        elif line.startswith("@batch "):
            bid, name, ids = [p.strip() for p in line[7:].split("|")]
            batches.append({"id": bid, "name": name, "ids": ids.split()})
        elif line.startswith("@path "):
            slug, name, blurb, ids = [p.strip() for p in line[6:].split("|")]
            paths.append({"slug": slug, "name": name, "blurb": blurb, "ids": ids.split()})
        else:
            cols = [p.strip() for p in line.split("|")]
            if len(cols) != 8:
                err(f"line {n}: expected 8 columns, got {len(cols)}: {line[:60]}")
                continue
            tid, title, lv, status, needs, illusion, hook, brief = cols
            if not domains:
                err(f"line {n}: topic before any domain")
                continue
            topics.append({
                "id": tid, "title": title, "level": lv, "domain": domains[-1]["code"],
                "status": "shipped" if status.startswith("shipped:") else status,
                "slug": status.split(":", 1)[1] if status.startswith("shipped:") else "",
                "needs": [] if needs == "-" else needs.split(","),
                "illusion": illusion, "hook": hook, "brief": brief, "line": n,
            })
    return domains, topics, paths, batches


def validate(domains, topics, paths, batches):
    ids = {}
    for t in topics:
        if t["id"] in ids:
            err(f"duplicate id {t['id']}")
        ids[t["id"]] = t
        if not re.fullmatch(r"[A-Z]{3}\d{2}", t["id"]):
            err(f"{t['id']}: id must look like ABC01")
        elif t["id"][:3] != t["domain"]:
            err(f"{t['id']}: prefix does not match domain {t['domain']}")
        if t["level"] not in LEVELS:
            err(f"{t['id']}: bad level {t['level']!r}")
        if t["status"] not in ("idea", "shipped"):
            err(f"{t['id']}: bad status {t['status']!r}")
        if t["slug"] and not (ROOT / "site" / "topics" / f"{t['slug']}.html").exists():
            err(f"{t['id']}: shipped page site/topics/{t['slug']}.html is missing")
        if not t["illusion"] or not t["hook"]:
            err(f"{t['id']}: illusion and hook are required")
    for t in topics:
        for need in t["needs"]:
            if need not in ids:
                err(f"{t['id']}: unknown prerequisite {need}")
            elif need == t["id"]:
                err(f"{t['id']}: needs itself")
    # cycle check (DFS)
    state = {}

    def visit(i, trail):
        if state.get(i) == 2:
            return
        if state.get(i) == 1:
            err("prerequisite cycle: " + " -> ".join(trail + [i]))
            return
        state[i] = 1
        for need in ids[i]["needs"] if i in ids else []:
            if need in ids:
                visit(need, trail + [i])
        state[i] = 2

    for i in ids:
        visit(i, [])
    # briefs
    briefs = [t["brief"] for t in topics if t["brief"]]
    if len(briefs) != len(set(briefs)):
        err("a launch-topics brief number is used twice")
    # paths
    for p in paths:
        seen = set()
        for i in p["ids"]:
            if i not in ids:
                err(f"path {p['slug']}: unknown id {i}")
                continue
            if i in seen:
                err(f"path {p['slug']}: {i} listed twice")
            for need in ids[i]["needs"]:
                if need in p["ids"] and need not in seen:
                    err(f"path {p['slug']}: {i} appears before its prerequisite {need}")
            seen.add(i)
    # batches: every topic exactly once, prerequisites earlier (shipped chapters are exempt)
    where = {}
    for bi, b in enumerate(batches):
        for pos, i in enumerate(b["ids"]):
            if i not in ids:
                err(f"batch {b['id']}: unknown id {i}")
            elif i in where:
                err(f"{i} is in both batch {where[i][0]} and {b['id']}")
            else:
                where[i] = (b["id"], bi, pos)
    for t in topics:
        if t["id"] not in where:
            err(f"{t['id']} is not in any batch")
    for t in topics:
        if t["status"] == "shipped" or t["id"] not in where:
            continue
        _, bi, pos = where[t["id"]]
        for need in t["needs"]:
            if need in where and (where[need][1], where[need][2]) >= (bi, pos):
                err(f"{t['id']} (batch {where[t['id']][0]}) is scheduled before its prerequisite {need} (batch {where[need][0]})")
    # domains with no topics
    for d in domains:
        if not any(t["domain"] == d["code"] for t in topics):
            err(f"domain {d['code']} has no topics")


def library_order(topics, paths):
    """Shipped topics: the start-here path first, then the rest in catalogue order."""
    shipped = [t["id"] for t in topics if t["status"] == "shipped"]
    start = next((p["ids"] for p in paths if p["slug"] == "start-here"), [])
    return [i for i in start if i in shipped] + [i for i in shipped if i not in start]


def write_js(domains, topics, paths, batches):
    slim = [{k: t[k] for k in ("id", "title", "level", "domain", "status", "slug", "needs", "illusion", "hook")}
            for t in topics]
    data = {"levels": LEVELS, "domains": domains, "topics": slim, "paths": paths, "library": library_order(topics, paths)}
    out = ROOT / "site" / "topics-data.js"
    out.write_text(
        "// Generated by scripts/build_catalog.py from docs/catalog.txt. Do not edit.\n"
        "window.ILLUSION_CATALOG = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8")


def progress(topics, batches):
    st = {t["id"]: t["status"] for t in topics}
    return [(b, sum(st[i] == "shipped" for i in b["ids"])) for b in batches]


def write_md(domains, topics, paths, batches):
    title = {t["id"]: t["title"] for t in topics}
    shipped = sum(t["status"] == "shipped" for t in topics)
    lines = [
        "# Topic catalogue", "",
        "<!-- Generated by scripts/build_catalog.py from docs/catalog.txt. Do not edit. -->", "",
        f"{len(topics)} topics in {len(domains)} domains; {shipped} shipped. "
        "Edit `docs/catalog.txt`, then run `python3 scripts/build_catalog.py`.", "",
        "- **Catalogue**: what exists, one shelf per domain, with stable IDs.",
        "- **Needs**: soft prerequisites: worth knowing before the topic.",
        "- **Paths**: suggested reading orders that cut across domains.",
        "- **Level**: S starter, M moderate, H hard, X advanced/speculative (needs careful framing and review).",
        "- **Brief**: the matching row in [`launch-topics.md`](launch-topics.md).", "",
        "## Production batches", "",
        "The order chapters get written. Prerequisites always come first.", "",
        "| Batch | Theme | Topics | Done |", "|---|---|---|---|",
    ]
    for b, done in progress(topics, batches):
        lines.append(f"| {b['id']} | {b['name']} | {' '.join(b['ids'])} | {done}/{len(b['ids'])} |")
    lines += ["", "## Paths", ""]
    for p in paths:
        lines.append(f"### {p['name']}")
        lines.append(f"{p['blurb']}")
        lines.append("")
        lines.append(" → ".join(f"{i} {title[i]}" for i in p["ids"]))
        lines.append("")
    lines += ["## Domains", ""]
    for d in domains:
        rows = [t for t in topics if t["domain"] == d["code"]]
        lines += [f"### {d['code']} · {d['name']}", "", d["blurb"], "",
                  "| ID | Topic | Lv | Core illusion | Needs | Status |", "|---|---|---|---|---|---|"]
        for t in rows:
            status = f"[shipped](../site/topics/{t['slug']}.html)" if t["status"] == "shipped" else (
                f"brief {t['brief']}" if t["brief"] else "idea")
            lines.append(f"| {t['id']} | {t['title']} | {t['level']} | {t['illusion']} | "
                         f"{', '.join(t['needs']) or '-'} | {status} |")
        lines.append("")
    (ROOT / "docs" / "catalog.md").write_text("\n".join(lines), encoding="utf-8")


def next_batch(topics, batches):
    by = {t["id"]: t for t in topics}
    for b, done in progress(topics, batches):
        if done < len(b["ids"]):
            print(f"Next batch: {b['id']} · {b['name']}  ({done}/{len(b['ids'])} done)\n")
            for i in b["ids"]:
                t = by[i]
                mark = "[x]" if t["status"] == "shipped" else "[ ]"
                print(f"{mark} {i}  {t['title']}  (level {t['level']}; needs {', '.join(t['needs']) or '-'})")
                print(f"      illusion: {t['illusion']}\n      hook:     {t['hook']}")
            return
    print("All batches complete.")


def main():
    domains, topics, paths, batches = parse()
    validate(domains, topics, paths, batches)
    if errors:
        print("catalogue has problems:")
        for e in errors:
            print("  -", e)
        sys.exit(1)
    write_js(domains, topics, paths, batches)
    write_md(domains, topics, paths, batches)
    if "--next" in sys.argv:
        next_batch(topics, batches)
        return
    by = {}
    for t in topics:
        by[t["level"]] = by.get(t["level"], 0) + 1
    done = sum(t["status"] == "shipped" for t in topics)
    finished = sum(d == len(b["ids"]) for b, d in progress(topics, batches))
    print(f"ok: {len(topics)} topics, {len(domains)} domains, {len(paths)} paths, {len(batches)} batches; levels {dict(sorted(by.items()))}")
    print(f"progress: {done}/{len(topics)} chapters shipped; {finished}/{len(batches)} batches complete")


if __name__ == "__main__":
    main()
