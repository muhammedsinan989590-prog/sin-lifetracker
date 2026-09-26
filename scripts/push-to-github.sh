#!/usr/bin/env bash
#
# Push the Life OS Daily tracker to your own GitHub repository.
#
# Usage:
#   1. Create an empty repo on GitHub (no README, no LICENSE — leave it empty)
#      e.g. https://github.com/new  →  name: sin-lifetracker
#
#   2. Make this script executable:
#      chmod +x scripts/push-to-github.sh
#
#   3. Run it with your repo URL:
#      ./scripts/push-to-github.sh https://github.com/muhammedsinan989590-prog/sin-lifetracker.git
#
#   4. (First time only) GitHub will prompt for your username + personal access token.
#      Create a token at: https://github.com/settings/tokens (scopes: repo, workflow)
#
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "❌ Usage: $0 <github-repo-url>"
  echo "   e.g. $0 https://github.com/yourname/life-os-daily.git"
  exit 1
fi

REPO_URL="$1"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_DIR"

echo "📂 Project directory: $PROJECT_DIR"
echo "🌐 Target repo:       $REPO_URL"
echo ""

# Sanity checks
if [ ! -d ".git" ]; then
  echo "❌ No .git directory found. Run this from a git repo."
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "❌ No package.json found. Are you in the right directory?"
  exit 1
fi

# Check for sensitive files that shouldn't be pushed
LEAKS=$(git ls-files | grep -E "^(\.env$|\.env\.local|.*\.db$|.*\.pid$)" || true)
if [ -n "$LEAKS" ]; then
  echo "⚠️  WARNING: The following sensitive files are tracked in git:"
  echo "$LEAKS"
  echo ""
  echo "Aborting. Remove them with: git rm --cached <file>"
  exit 1
fi

# Verify working tree is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Working tree is not clean. Uncommitted changes:"
  git status --short
  echo ""
  read -p "Commit them now? [y/N] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A
    git commit -m "Pre-push cleanup"
  else
    echo "Aborting. Please commit or stash your changes first."
    exit 1
  fi
fi

# Check existing remotes
EXISTING_REMOTE=$(git remote get-url origin 2>/dev/null || true)

if [ -n "$EXISTING_REMOTE" ]; then
  echo "🔗 Existing 'origin' remote: $EXISTING_REMOTE"
  if [ "$EXISTING_REMOTE" = "$REPO_URL" ]; then
    echo "   (already points to the target repo — proceeding)"
  else
    read -p "   Update it to $REPO_URL? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git remote set-url origin "$REPO_URL"
    else
      echo "   Keeping existing remote. Pushing to $EXISTING_REMOTE instead."
      REPO_URL="$EXISTING_REMOTE"
    fi
  fi
else
  echo "🔗 Adding 'origin' remote..."
  git remote add origin "$REPO_URL"
fi

echo ""
echo "🚀 Pushing main branch to $REPO_URL ..."
echo "   (you may be prompted for your GitHub username + personal access token)"
echo ""

# Push with -u to set upstream tracking
if git push -u origin main; then
  echo ""
  echo "✅ Push successful!"
  echo ""
  echo "   View your repo at: ${REPO_URL%.git}"
  echo ""
  echo "   Next steps:"
  echo "   - Star the repo to bookmark it"
  echo "   - Enable GitHub Pages (Settings → Pages) for free hosting if you want"
  echo "   - Or connect to Vercel/Netlify for one-click PWA deployment"
  echo "     (Vercel: https://vercel.com/new → import the repo → Deploy)"
else
  echo ""
  echo "❌ Push failed. Common causes:"
  echo "   - Wrong repo URL (check the .git suffix)"
  echo "   - Repo isn't empty on GitHub (delete README/LICENSE there first)"
  echo "   - Authentication failed (use a Personal Access Token, not your password)"
  echo "     Create one at: https://github.com/settings/tokens (scopes: repo)"
  exit 1
fi
