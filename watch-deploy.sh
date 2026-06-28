#!/bin/bash
# Auto-commit and push on file changes in src/
# Usage: bash watch-deploy.sh

REPO="/Users/alisanosova/psyid-portal"
WATCH_DIR="$REPO/src"
DEBOUNCE=4  # seconds to wait after last change before pushing

echo "👁  Watching $WATCH_DIR for changes..."
echo "    Will auto-push to Vercel after ${DEBOUNCE}s of inactivity."
echo "    Press Ctrl+C to stop."
echo ""

TIMER_PID=""

trigger_deploy() {
  cd "$REPO" || exit 1
  CHANGED=$(git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard src/)
  if [ -z "$CHANGED" ]; then
    return
  fi
  echo "🔄  Changes detected — committing..."
  git add src/
  git commit -m "auto-deploy: $(date '+%H:%M:%S')" --quiet
  echo "🚀  Pushing to Vercel..."
  git push origin master --quiet && echo "✅  Deployed at $(date '+%H:%M:%S')" || echo "❌  Push failed"
}

fswatch -r -e ".*" -i "\\.tsx$" -i "\\.ts$" -i "\\.css$" -i "\\.json$" "$WATCH_DIR" | while read -r event; do
  # Cancel pending timer
  if [ -n "$TIMER_PID" ] && kill -0 "$TIMER_PID" 2>/dev/null; then
    kill "$TIMER_PID" 2>/dev/null
  fi
  # Start new debounce timer
  (sleep "$DEBOUNCE" && trigger_deploy) &
  TIMER_PID=$!
done
