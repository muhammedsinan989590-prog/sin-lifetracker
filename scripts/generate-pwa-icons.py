#!/usr/bin/env python3
"""
Generate PWA icons for Life OS Daily tracker.
Creates:
- icon-192.png, icon-512.png (standard)
- icon-192-maskable.png, icon-512-maskable.png (maskable, with padding)
- apple-touch-icon.png (180x180)
- favicon-32.png, favicon-16.png
- icon.svg (source vector)

Brand: muted teal gradient (#344C4B -> #5E8C8A) with light-teal "S" letter.
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT_DIR = "/home/z/my-project/public/icons"
os.makedirs(OUT_DIR, exist_ok=True)

# Brand colors
TEAL_DARK = (52, 76, 75)      # #344C4B
TEAL_MID = (82, 102, 101)      # #526665
TEAL_LIGHT = (183, 214, 210)   # #B7D6D2
TEAL_ACCENT = (139, 176, 174)  # #8BB0AE
WHITE = (255, 255, 255)


def find_font(size: int) -> ImageFont.FreeTypeFont:
    """Find a suitable bold font for the S letter."""
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def make_gradient_bg(size: int, maskable: bool = False) -> Image.Image:
    """Create a diagonal teal gradient background."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pixels = img.load()
    for y in range(size):
        for x in range(size):
            # diagonal mix factor
            t = (x + y) / (2 * size)
            # blend TEAL_DARK -> TEAL_MID -> TEAL_ACCENT (radial-ish)
            if t < 0.5:
                f = t * 2
                r = int(TEAL_DARK[0] * (1 - f) + TEAL_MID[0] * f)
                g = int(TEAL_DARK[1] * (1 - f) + TEAL_MID[1] * f)
                b = int(TEAL_DARK[2] * (1 - f) + TEAL_MID[2] * f)
            else:
                f = (t - 0.5) * 2
                r = int(TEAL_MID[0] * (1 - f) + TEAL_ACCENT[0] * f)
                g = int(TEAL_MID[1] * (1 - f) + TEAL_ACCENT[1] * f)
                b = int(TEAL_MID[2] * (1 - f) + TEAL_ACCENT[2] * f)
            pixels[x, y] = (r, g, b, 255)
    return img


def add_radial_glow(img: Image.Image) -> Image.Image:
    """Add a soft top-left radial glow for depth."""
    size = img.size[0]
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    # Top-left bright spot
    cx, cy = int(size * 0.25), int(size * 0.2)
    max_r = int(size * 0.55)
    for r in range(max_r, 0, -2):
        alpha = int(40 * (1 - r / max_r) ** 2)
        if alpha <= 0:
            continue
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(TEAL_LIGHT[0], TEAL_LIGHT[1], TEAL_LIGHT[2], alpha),
        )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=size // 30))
    return Image.alpha_composite(img, glow)


def draw_s_letter(img: Image.Image, letter: str = "S"):
    """Draw a large, bold letter centered on the image."""
    size = img.size[0]
    # Font size ~ 60% of icon
    font_size = int(size * 0.58)
    font = find_font(font_size)

    # Measure text
    draw = ImageDraw.Draw(img)
    try:
        bbox = draw.textbbox((0, 0), letter, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        text_x = (size - text_w) / 2 - bbox[0]
        text_y = (size - text_h) / 2 - bbox[1]
    except Exception:
        text_x = size * 0.25
        text_y = size * 0.2

    # Soft shadow
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.text(
        (text_x + size * 0.02, text_y + size * 0.025),
        letter, font=font, fill=(0, 0, 0, 90),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=size // 80))
    img = Image.alpha_composite(img, shadow)

    # Letter body — gradient fill via two-pass: solid color first
    draw = ImageDraw.Draw(img)
    draw.text((text_x, text_y), letter, font=font, fill=TEAL_LIGHT)

    # Inner highlight (smaller, brighter letter offset upward)
    highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(highlight)
    hdraw.text(
        (text_x, text_y - size * 0.012),
        letter, font=font, fill=(255, 255, 255, 70),
    )
    img = Image.alpha_composite(img, highlight)
    return img


def make_icon(size: int, maskable: bool = False, letter: str = "S") -> Image.Image:
    """Create one icon. Maskable icons have a safe-zone padding."""
    if maskable:
        # Background fills the full canvas (no transparency),
        # and the letter is drawn in the inner 80% safe zone.
        img = make_gradient_bg(size)
        img = add_radial_glow(img)
        # Crop center 80% for the letter
        pad = int(size * 0.1)
        # Just draw the letter smaller and centered
        img_letter_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        # Draw letter at 50% size of icon (was 58%)
        font_size = int(size * 0.5)
        font = find_font(font_size)
        draw = ImageDraw.Draw(img_letter_layer)
        try:
            bbox = draw.textbbox((0, 0), letter, font=font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            text_x = (size - text_w) / 2 - bbox[0]
            text_y = (size - text_h) / 2 - bbox[1]
        except Exception:
            text_x = size * 0.28
            text_y = size * 0.25
        # shadow
        shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        sdraw.text((text_x + 3, text_y + 4), letter, font=font, fill=(0, 0, 0, 90))
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=size // 100))
        img = Image.alpha_composite(img, shadow)
        draw = ImageDraw.Draw(img)
        draw.text((text_x, text_y), letter, font=font, fill=TEAL_LIGHT)
    else:
        # Standard icon: full-bleed gradient + large centered letter
        img = make_gradient_bg(size)
        img = add_radial_glow(img)
        img = draw_s_letter(img, letter)

    return img.convert("RGBA")


def make_apple_touch_icon(size: int = 180) -> Image.Image:
    """Apple touch icon: solid background (no transparency), square corners
    (iOS rounds them automatically)."""
    img = make_gradient_bg(size)
    img = add_radial_glow(img)
    img = draw_s_letter(img, "S")
    # Flatten onto solid bg
    bg = Image.new("RGBA", (size, size), TEAL_DARK)
    bg = Image.alpha_composite(bg, img)
    return bg.convert("RGB")


def make_favicon(size: int) -> Image.Image:
    """Smaller favicon — simpler, bolder letter for tiny sizes."""
    img = make_gradient_bg(size)
    font_size = max(8, int(size * 0.65))
    font = find_font(font_size)
    draw = ImageDraw.Draw(img)
    try:
        bbox = draw.textbbox((0, 0), "S", font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        text_x = (size - text_w) / 2 - bbox[0]
        text_y = (size - text_h) / 2 - bbox[1]
    except Exception:
        text_x = size * 0.25
        text_y = size * 0.2
    draw.text((text_x, text_y), "S", font=font, fill=TEAL_LIGHT)
    return img.convert("RGBA")


def main():
    # Standard icons
    for size in [192, 512]:
        icon = make_icon(size, maskable=False)
        icon.save(os.path.join(OUT_DIR, f"icon-{size}.png"), "PNG")
        print(f"Generated icon-{size}.png")

    # Maskable icons (Android adaptive icons)
    for size in [192, 512]:
        icon = make_icon(size, maskable=True)
        icon.save(os.path.join(OUT_DIR, f"icon-{size}-maskable.png"), "PNG")
        print(f"Generated icon-{size}-maskable.png")

    # Apple touch icon
    apple = make_apple_touch_icon(180)
    apple.save(os.path.join(OUT_DIR, "apple-touch-icon.png"), "PNG")
    print("Generated apple-touch-icon.png")

    # Favicons
    for size in [16, 32]:
        fav = make_favicon(size)
        fav.save(os.path.join(OUT_DIR, f"favicon-{size}.png"), "PNG")
        print(f"Generated favicon-{size}.png")

    # 1024 marketing icon (used by some stores)
    big = make_icon(1024, maskable=False)
    big.save(os.path.join(OUT_DIR, "icon-1024.png"), "PNG")
    print("Generated icon-1024.png")

    # Source SVG (for crisp scaling)
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#344C4B"/>
      <stop offset="50%" stop-color="#526665"/>
      <stop offset="100%" stop-color="#8BB0AE"/>
    </linearGradient>
    <radialGradient id="glow" cx="25%" cy="20%" r="55%">
      <stop offset="0%" stop-color="#B7D6D2" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#B7D6D2" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <rect width="512" height="512" fill="url(#glow)"/>
  <text x="256" y="256" font-family="-apple-system, Segoe UI, Roboto, sans-serif" font-size="300" font-weight="700" fill="#B7D6D2" text-anchor="middle" dominant-baseline="central">S</text>
</svg>
"""
    with open(os.path.join(OUT_DIR, "icon.svg"), "w") as f:
        f.write(svg)
    print("Generated icon.svg")


if __name__ == "__main__":
    main()
