#!/bin/sh
# crates.io is not reachable from the sandbox, so take the prebuilt mmdr WASM
# (mermaid-rs-renderer compiled for Typst) from the typst/packages repo.
set -e
d=$(mktemp -d)
git clone -q --depth 1 --filter=blob:none --sparse https://github.com/typst/packages "$d/tp"
git -C "$d/tp" sparse-checkout set packages/preview/mmdr
mkdir -p engines
cp "$d/tp/packages/preview/mmdr/0.2.2/typst_mmdr.wasm" engines/
rm -rf "$d"
