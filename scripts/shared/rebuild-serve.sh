#!/usr/bin/env bash
# Rebuilds the production bundle and (re)starts `next start` on port 3400 in the foreground.
# Usage: bash scripts/shared/rebuild-serve.sh
set -e
cd "$(dirname "$0")/../.."
npm run build
exec node node_modules/next/dist/bin/next start -p 3400
