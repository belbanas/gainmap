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
    'pulldown': 'pulldown-7j',
    'lever-alternating-narrow-grip-seated-row': 'lever-alternating-narrow-grip-seated-row-0r',
    'lever-shoulder-press': 'lever-shoulder-press-2q',
    'cable-one-arm-lateral-raise': 'cable-one-arm-lateral-raise-64s',
    # Illustrative catalog variant; the logged "Single Delt Row" name has no exact public page.
    'cable-standing-single-delt-row': 'cable-standing-rear-delt-row--6fx',
    'triceps-pushdown': 'triceps-pushdown-7e',
    'standing-triceps-extension': 'standing-triceps-extension-02',
    'hyperextension': 'hyperextension-6mb',
    'lever-seated-hip-abduction': 'lever-seated-hip-abduction-19',
    'lever-lying-t-bar-row': 'lever-lying-t-bar-row-3h',
    'lever-seated-shoulder-press': 'lever-seated-shoulder-press-fg',
    'captains-chair-straight-leg-raise': 'captains-chair-straight-leg-raise-83u',
    'dumbbell-side-bend': 'dumbbell-side-bend-6kr',
    'cross-body-hammer-curl': 'cross-body-hammer-curl-8m',
    'front-plank': 'front-plank-6m1',
    'side-plank': 'side-plank-6t1',
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
    extension = 'jpg' if data.startswith(b'\xff\xd8') else 'png' if data.startswith(b'\x89PNG\r\n\x1a\n') else None
    if extension is None:
        raise ValueError('Expected JPEG or PNG thumbnail')
    filename = local_id + '.' + extension
    (ROOT / 'assets/exercises' / filename).write_bytes(data)
    return filename, page, image_url, html.unescape(re.search(r'alt="([^"]+)"', tag)[1])

if __name__ == '__main__':
    readme_path = ROOT / 'assets/exercises/README.md'
    readme = readme_path.read_text(encoding='utf-8')
    missing = {i: slug for i, slug in PAGES.items()
               if not any((ROOT / 'assets/exercises' / (i + '.' + ext)).exists() for ext in ('jpg', 'png', 'webp', 'svg'))}
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        rows = list(pool.map(fetch, missing.items()))
    images = {i: 'assets/exercises/' + i + '.' + ext for i in PAGES
              for ext in ('jpg', 'png', 'webp', 'svg')
              if (ROOT / 'assets/exercises' / (i + '.' + ext)).exists()}
    (ROOT / 'js/exercise-images.js').write_text(
        '// Local Lyfta artwork, available independently of the current plan.\n'
        + 'export const exerciseImages = ' + json.dumps(images, indent=2) + ';\n', encoding='utf-8')
    plan_path = ROOT / 'data/latest.json'
    plan = json.loads(plan_path.read_text(encoding='utf-8'))
    for exercise in plan['exercises']:
        if exercise['id'] in images:
            exercise['image'] = images[exercise['id']]
    plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    attribution = '\n'.join(f'| {filename} | [{label}]({page}) | {image} |' for filename, page, image, label in rows)
    if rows:
        readme_path.write_text(readme.rstrip() + '\n' + attribution + '\n', encoding='utf-8')
    for row in rows:
        print(row[0] + ': ' + row[3])
