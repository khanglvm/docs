#!/bin/sh
# Installs the weekly docs review (ops/docs-review.mjs) as a launchd job on this Mac.
# Runs Mondays at 09:30 local time; logs go to ~/.local/share/oss-docs/review.log.
set -eu
label=dev.khangle.oss-docs-review
repo=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
plist="$HOME/Library/LaunchAgents/$label.plist"
mkdir -p "$HOME/.local/share/oss-docs"
cat > "$plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key>
  <array><string>$node</string><string>$repo/ops/docs-review.mjs</string></array>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>$(dirname "$node"):$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string></dict>
  <key>StartCalendarInterval</key>
  <dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>9</integer><key>Minute</key><integer>30</integer></dict>
  <key>StandardOutPath</key><string>$HOME/.local/share/oss-docs/review.log</string>
  <key>StandardErrorPath</key><string>$HOME/.local/share/oss-docs/review.log</string>
</dict>
</plist>
EOF
launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$plist"
echo "installed $label ($plist)"
