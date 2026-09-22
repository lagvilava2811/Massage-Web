"""Static release checks. Run with Python 3; no third-party packages required."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from collections import Counter
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://ninoabazadze.ge/'

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.elements = []
        self.text = []
        self.in_script = False
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))
        if tag == 'script':
            self.in_script = True

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False

    def handle_data(self, data):
        if not self.in_script:
            self.text.append(data)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

for filename, language in [('index.html', 'ka'), ('en.html', 'en'), ('ru.html', 'ru')]:
    source = (ROOT / filename).read_text(encoding='utf-8')
    page = Page(source)
    ids = [a['id'] for _, a in page.elements if 'id' in a]
    assert all(n == 1 for n in Counter(ids).values()), f'{filename}: duplicate IDs'
    assert sum(t == 'h1' for t, _ in page.elements) == 1
    assert any(t == 'html' and a.get('lang') == language for t, a in page.elements)
    canonical = BASE if language == 'ka' else BASE + filename
    assert any(t == 'link' and a.get('rel') == 'canonical' and a.get('href') == canonical for t, a in page.elements)
    alternates = {a.get('hreflang'): a.get('href') for t, a in page.elements if t == 'link' and a.get('rel') == 'alternate'}
    assert alternates == {'ka': BASE, 'en': BASE + 'en.html', 'ru': BASE + 'ru.html', 'x-default': BASE}
    assert not re.search(r'10\+|E-E-A-T|Local SEO|ლოკალური SEO|Локальный SEO|local search intent', source)
    assert not re.search(r'<meta[^>]+content=["\'][^"\']*noindex', source)
    for tag, attrs in page.elements:
        if tag == 'img':
            assert 'alt' in attrs and 'width' in attrs and 'height' in attrs, f'{filename}: image sizing/alt missing'
        if tag == 'a' and attrs.get('target') == '_blank':
            assert 'noopener' in attrs.get('rel', '')
        for attr in ['href', 'src']:
            value = attrs.get(attr, '')
            if not value:
                continue
            parsed = urlsplit(value)
            if parsed.scheme or parsed.netloc:
                continue
            path = unquote(parsed.path)
            if path:
                target = ROOT / path.lstrip('/') if path != '/' else ROOT / 'index.html'
                assert target.is_file(), f'{filename}: missing {target}'
            if parsed.fragment and not path:
                assert parsed.fragment in ids, f'{filename}: broken anchor {value}'
    schema = re.search(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', source, re.S)
    graph = json.loads(schema.group(1))['@graph']
    faq = next(n for n in graph if n.get('@type') == 'FAQPage')['mainEntity']
    visible_text = ' '.join(' '.join(page.text).split())
    for item in faq:
        assert item['name'] in visible_text and item['acceptedAnswer']['text'] in visible_text, f'{filename}: FAQ mismatch'
    business = next(n for n in graph if n.get('@id') == BASE + '#business')
    offers = business['hasOfferCatalog']['itemListElement']
    assert [(o['price'], o['priceCurrency']) for o in offers] == [(40, 'GEL'), (60, 'GEL'), (35, 'GEL'), (50, 'GEL')]
    assert len(re.findall(r'class="price-card', source)) == 4
    assert len(re.findall(r'class="faq-item"', source)) == 6
    print(f'PASS {filename}: links, assets, headings, languages, prices, schema and FAQ')

tree = ET.parse(ROOT / 'sitemap.xml')
urls = [n.text for n in tree.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert set(urls) == {BASE, BASE + 'en.html', BASE + 'ru.html'}
assert BASE + 'sitemap.xml' in (ROOT / 'robots.txt').read_text()
config = json.loads((ROOT / 'vercel.json').read_text())
assert any(r['source'] == '/index.html' and r['destination'] == '/' for r in config['redirects'])
print('PASS sitemap, robots and canonical redirect')
