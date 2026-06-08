#!/bin/bash
set -e

# Save current branch name
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
VERSION=$(node -p "require('./package.json').version")

cleanup() {
  git checkout "$ORIGINAL_BRANCH" 2>/dev/null || true
  git branch -D deploy-temp 2>/dev/null || true
}
trap cleanup EXIT

# Force-push gh-pages by deleting remote first
git push origin --delete gh-pages 2>/dev/null || true

git checkout -b deploy-temp
git add -f dist/pwa
git commit -m "Deploy v$VERSION"
git subtree push --prefix dist/pwa origin gh-pages
