"""Record a 30-second scrolling tour of a morning sheet page as an animated GIF.

    python record_gif.py <url> <out.gif>
"""
import io
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

url, out = sys.argv[1], sys.argv[2]
W, H, SCALE = 1280, 800, 1
FRAMES, SECONDS = 24, 30

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=SCALE, color_scheme="dark")
    page.goto(url, wait_until="networkidle")
    page.wait_for_timeout(1500)
    # pre-warm every chart so Plotly has rendered before the tour reaches the annex
    total = page.evaluate("document.body.scrollHeight")
    for y in range(0, total, 600):
        page.evaluate(f"window.scrollTo(0, {y})")
        page.wait_for_timeout(250)
    page.wait_for_timeout(2500)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(800)
    total = page.evaluate("document.body.scrollHeight")
    frames = []
    stops = [0, 0] + [int(i * (total - H) / (FRAMES - 3)) for i in range(1, FRAMES - 2)] + [total - H]
    for y in stops:
        page.evaluate(f"window.scrollTo({{top: {y}, behavior: 'instant'}})")
        page.wait_for_timeout(350)
        png = page.screenshot(type="png")
        im = Image.open(io.BytesIO(png)).convert("RGB")
        im = im.resize((960, int(960 * H / W)), Image.LANCZOS)
        frames.append(im.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE))
    browser.close()

dur = int(SECONDS * 1000 / len(frames))
frames[0].save(out, save_all=True, append_images=frames[1:], duration=[dur * 2] + [dur] * (len(frames) - 2) + [dur * 2],
               loop=0, optimize=True)
import os
print(f"{out}: {len(frames)} frames, {os.path.getsize(out) / 1024 / 1024:.1f} MB")
