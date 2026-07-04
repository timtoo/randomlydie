#!/usr/bin/env bash
set -euo pipefail

STRINGS_FILE="android/app/src/main/res/values/strings.xml"

if [ ! -f "$STRINGS_FILE" ]; then
  echo "Error: $STRINGS_FILE not found" >&2
  exit 1
fi

sed -i 's|<string name="app_name">[^<]*</string>|<string name="app_name">Randomly/Die</string>|g' "$STRINGS_FILE"
sed -i 's|<string name="title_activity_main">[^<]*</string>|<string name="title_activity_main">Randomly/Die</string>|g' "$STRINGS_FILE"

echo "Updated $STRINGS_FILE:"
grep -E 'app_name|title_activity_main' "$STRINGS_FILE"
