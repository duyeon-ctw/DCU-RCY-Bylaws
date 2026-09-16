#!/usr/bin/env bash
# Exercise the real exported application in the runner's installed Chrome.
set -euo pipefail
CHROME=$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || true)
if [ -z "$CHROME" ]; then echo 'A Chromium browser is required for the browser smoke test.' >&2; exit 1; fi
WORK=$(mktemp -d)
SERVER_PID=''
cleanup() { if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; fi; rm -rf "$WORK"; }
trap cleanup EXIT
mkdir -p qa/browser
cp -R out "$WORK/site"
python3 - "$WORK/site/bylaws/index.html" <<'PY'
from pathlib import Path
import sys
file = Path(sys.argv[1])
script = r'''<script>
(async () => {
 const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
 const check = (value, message) => { if (!value) throw new Error(message); };
 const finish = (status, message) => { const tag = document.createElement('meta'); tag.name = 'rcy-browser-smoke'; tag.content = status; tag.dataset.result = message; document.head.append(tag); };
 try {
  await wait(2000);
  const panel = document.querySelector('.toc-panel');
  const chapters = document.querySelectorAll('.toc-chapter');
  check(chapters.length === 10, 'Expected nine chapters and supplementary provisions');
  const mobile = matchMedia('(max-width: 1023px)').matches;
  if (mobile) check(!panel.open, 'Mobile contents should initially be collapsed');
  const heading = panel.querySelector(':scope > summary');
  const label = heading.querySelector('.toc-heading-label');
  const actions = Array.from(heading.querySelectorAll('.toc-tools button'));
  check(actions.length === 2, 'Expand and collapse icons must be in the contents heading');
  check(actions.every(button => button.querySelector('svg') && !button.textContent.trim() && button.getAttribute('aria-label') && button.title), 'Icons must have accessible labels and tooltips');
  const labelBox = label.getBoundingClientRect();
  const firstBox = actions[0].getBoundingClientRect();
  const lastBox = actions[1].getBoundingClientRect();
  check(firstBox.width > 0 && firstBox.left >= labelBox.right, 'Contents icons must remain visible beside the label');
  check(Math.abs(firstBox.top + firstBox.height / 2 - labelBox.top - labelBox.height / 2) < 4, 'Contents label and icons must share one row');
  check(lastBox.right <= heading.getBoundingClientRect().right + 1, 'Contents toolbar overflows its heading');
  actions[0].click(); await wait(200);
  check(panel.open, 'Expand action should reveal the contents panel');
  check(document.querySelectorAll('.toc-chapter[open]').length === chapters.length, 'Expand all failed');
  actions[1].click(); await wait(250);
  check(panel.open, 'Collapse all must not close the contents heading');
  check(document.querySelectorAll('.toc-chapter[open]').length === 0, 'Collapse all failed');
  chapters[0].querySelector('summary').click(); await wait(250);
  check(document.querySelectorAll('.toc-chapter[open]').length === 1, 'Single chapter toggle failed');
  const mode = document.querySelector('.controls .icon-button');
  mode.click(); await wait(150);
  check(document.documentElement.dataset.theme === 'dark', 'Theme icon did not activate dark mode');
  mode.click(); await wait(150);
  check(document.documentElement.dataset.theme === 'light', 'Theme icon did not restore light mode');
  check(document.querySelectorAll('.controls .icon-button svg').length === 2, 'Missing control icons');
  check(!document.querySelector('#document-content').innerText.includes('**'), 'Literal Markdown stars remain');
  check(Array.from(document.querySelectorAll('.art-title')).every(node => !/^\s*[(（]/.test(node.textContent)), 'Article title parentheses remain');
  if (mobile) { panel.open = false; check(document.documentElement.scrollWidth <= innerWidth, 'Mobile page overflows horizontally'); }
  finish('passed', JSON.stringify({chapters:chapters.length, mobile, theme:true, accordion:true, typography:true, headingIcons:true}));
 } catch (error) { finish('failed', String(error.stack || error)); }
})();
</script>'''
file.write_text(file.read_text().replace('</body>', script + '</body>'))
PY
python3 -m http.server 8766 --bind 127.0.0.1 --directory "$WORK/site" > qa/browser/server.log 2>&1 &
SERVER_PID=$!
python3 - <<'PY'
import time, urllib.request
for attempt in range(30):
    try:
        urllib.request.urlopen('http://127.0.0.1:8766/bylaws/', timeout=1).close()
        break
    except OSError: time.sleep(.1)
else: raise RuntimeError('Smoke server did not start')
PY
"$CHROME" --version
for MODE in desktop mobile; do
  SIZE='1440,1000'; if [ "$MODE" = mobile ]; then SIZE='390,844'; fi
  "$CHROME" --headless --no-sandbox --disable-gpu --no-first-run --no-default-browser-check --user-data-dir="$WORK/profile-$MODE" --window-size="$SIZE" --virtual-time-budget=10000 --dump-dom http://127.0.0.1:8766/bylaws/ > "qa/browser/$MODE.html" 2> "qa/browser/$MODE.log"
  python3 - "qa/browser/$MODE.html" <<'PY'
from html.parser import HTMLParser
from pathlib import Path
import sys
class Result(HTMLParser):
    def __init__(self): super().__init__(); self.status=None; self.message='No completed browser result'
    def handle_starttag(self, tag, attrs):
        values=dict(attrs)
        if tag=='meta' and values.get('name')=='rcy-browser-smoke':
            self.status=values.get('content'); self.message=values.get('data-result')
r=Result(); r.feed(Path(sys.argv[1]).read_text()); print(r.message)
if r.status!='passed': raise SystemExit('Browser smoke failed: '+str(r.message))
PY
  "$CHROME" --headless --no-sandbox --disable-gpu --no-first-run --no-default-browser-check --user-data-dir="$WORK/screenshot-$MODE" --window-size="$SIZE" --virtual-time-budget=10000 --screenshot="qa/browser/$MODE.png" http://127.0.0.1:8766/bylaws/ > /dev/null 2>> "qa/browser/$MODE.log"
done
