#!/bin/bash
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/bin:/bin:$PATH"
cd "$(dirname "$0")/.."

touch dist/.nojekyll

INDEX_FILE="$(pwd)/.git/gh-pages-index"
rm -f "$INDEX_FILE"
export GIT_INDEX_FILE="$INDEX_FILE"

cd dist
while IFS= read -r -d '' f; do
  path="${f#./}"
  blob=$(git hash-object -w "$f")
  git update-index --add --cacheinfo "100644,$blob,$path"
done < <(find . -type f -print0)

TREE=$(git write-tree)
COMMIT=$(printf 'Deploy web build to GitHub Pages\n' | git commit-tree "$TREE")
echo "Created $COMMIT"

git update-ref refs/heads/gh-pages "$COMMIT"
unset GIT_INDEX_FILE
rm -f "$INDEX_FILE"

cd ..
git push -f origin gh-pages
echo "Pushed gh-pages"

TOKEN=$(gh auth token)
CODE=$(curl -s -o /tmp/pages-resp.json -w "%{http_code}" -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/KennaWilson/mobile-app/pages \
  -d '{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"}}')
echo "Pages create HTTP $CODE"
cat /tmp/pages-resp.json
echo

CODE=$(curl -s -o /tmp/pages-resp.json -w "%{http_code}" -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/KennaWilson/mobile-app/pages \
  -d '{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"}}')
echo "Pages update HTTP $CODE"
cat /tmp/pages-resp.json
echo

sleep 4
curl -s -o /dev/null -w "Site HTTP %{http_code}\n" https://kennawilson.github.io/mobile-app/
curl -s -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/KennaWilson/mobile-app/pages
echo
git status -sb
git branch -v | head
