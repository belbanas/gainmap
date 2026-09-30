"""One-time, user-requested public Lyfta thumbnails; never reads account data."""
import concurrent.futures
import html
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request

PAGES = {
    'dumbbell-bench-press': 'dumbbell-bench-press-84',
    'dumbbell-incline-bench-press': 'dumbbell-incline-bench-press-6i6',
    'cable-standing-fly': 'cable-standing-fly-6fr',
    'sled-45-leg-wide-press': 'sled-45-leg-wide-press-6ta',
    'lever-seated-leg-curl': 'lever-seated-leg-curl-11',
    'lever-standing-calf-raise': 'lever-standing-calf-raise-14',
    'lever-preacher-curl': 'lever-preacher-curl-16',
    'dumbbell-incline-biceps-curl': 'dumbbell-incline-curl-6i9',
    'dumbbell-one-arm-hammer-preacher-curl': 'dumbbell-one-arm-hammer-preacher-curl-7fm',
}
ROOT = Path(__file__).resolve().parents[1]

def fetch(item):
    local_id, page_slug = item
    page = 'https://lyfta.app/exercise/' + page_slug
    content = urllib.request.urlopen(page, timeout=30).read().decode()
    tags = re.findall(r'<img[^>]+>', content)
    tag = next(t for t in tags if 'alt="Thumbnail for ' in t)
    source = html.unescape(re.search(r' src="([^"]+)"', tag)[1])
    source = urllib.parse.parse_qs(urllib.parse.urlparse(source).query).get('url', [source])[0]
    image_url = urllib.parse.urljoin('https://lyfta.app', source)
    if urllib.parse.urlparse(image_url).hostname not in ('lyfta.app', 'www.lyfta.app'):
        raise ValueError('Unexpected image host')
    data = urllib.request.urlopen(image_url, timeout=30).read()
    if not data.startswith(b'\xff\xd8'):
        raise ValueError('Expected JPEG thumbnail')
    (ROOT / 'assets/exercises' / (local_id + '.jpg')).write_bytes(data)
    return local_id, page, image_url, re.search(r'alt="([^"]+)"', tag)[1]

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        rows = list(pool.map(fetch, PAGES.items()))
    plan_path = ROOT / 'data/latest.json'
    plan = json.loads(plan_path.read_text(encoding='utf-8'))
    for exercise in plan['exercises']:
        if exercise['id'] in PAGES:
            exercise['image'] = 'assets/exercises/' + exercise['id'] + '.jpg'
    plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    attribution = '\n'.join(f'| {i}.jpg | [{label}]({page}) | {image} |' for i, page, image, label in rows)
    readme = '''# Exercise assets

The user explicitly requested the original Lyfta exercise pictures. These public
Lyfta exercise-page thumbnails are stored locally; the browser makes no external
requests. These are third-party images, not original GainMap artwork. Rights remain
with their respective owners. No broader redistribution license is asserted.

Local image paths use `assets/exercises/<exercise.id>.jpg` (also svg/png/webp).
Missing images use `fallback.svg`. Scheduled runs do not download images by default.
This one-time importer is run only under the user's explicit image request.

| Local file | Public exercise page | Thumbnail source |
|---|---|---|
''' + attribution + '\n'
    (ROOT / 'assets/exercises/README.md').write_text(readme, encoding='utf-8')
    for row in rows:
        print(row[0] + ': ' + row[3])
