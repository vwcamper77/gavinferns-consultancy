"""Render the downloadable brand assets with Pillow, Liberation Sans and Inkscape."""
from pathlib import Path
from subprocess import run
from tempfile import TemporaryDirectory
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "brand-pack"
FONT_DIRECTORY = Path("/usr/share/fonts/truetype/liberation")
if not FONT_DIRECTORY.exists():
    FONT_DIRECTORY = Path("/usr/share/fonts/truetype/liberation2")

THEMES = {
    "light": {"background": "#f3f7fc", "ink": "#0c1b32", "accent": "#1559cc", "line": "#a8bfdc", "pattern": "#dde8f5"},
    "dark": {"background": "#07172d", "ink": "#ffffff", "accent": "#8bbaff", "line": "#3c5677", "pattern": "#142b47"},
}
FORMATS = {
    "instagram-square": (1080, 1080),
    "instagram-portrait": (1080, 1350),
    "instagram-story": (1080, 1920),
    "open-graph": (1200, 630),
}


def font(size, bold=True):
    weight = "Bold" if bold else "Regular"
    return ImageFont.truetype(str(FONT_DIRECTORY / f"LiberationSans-{weight}.ttf"), size)


def logo(image, mark, x, y, width):
    height = round(width * mark.height / mark.width)
    resized = mark.resize((width, height), Image.Resampling.LANCZOS)
    image.paste(resized, (x, y), resized)


def hexagon(draw, x, y, radius, colour, width):
    draw.polygon([(x, y-radius), (x+radius*.866, y-radius*.5), (x+radius*.866, y+radius*.5),
                         (x, y+radius), (x-radius*.866, y+radius*.5), (x-radius*.866, y-radius*.5)],
                        outline=colour, width=width)


def brand_line(image, mark, x, y, palette, size):
    logo_width = round(size * 4)
    logo(image, mark, x, y, logo_width)
    ImageDraw.Draw(image).text((x + logo_width + round(size * .75), y + round(size * .65)),
                               "Gavin Ferns Consulting", font=font(size), fill=palette["ink"], anchor="lm")


def graphic(mark, name, dimensions, palette):
    w, h = dimensions
    image = Image.new("RGB", dimensions, palette["background"])
    draw = ImageDraw.Draw(image)
    if name == "open-graph":
        margin, top, baseline, size, pitch, bottom = 76, 66, 185, 78, 82, 549
    else:
        margin, top, baseline, size, pitch, bottom = 90, 92, 343, 91, 93, h - 98
        if name == "instagram-story":
            top, baseline, size, pitch, bottom = 268, 641, 97, 104, h - 286
        elif name == "instagram-portrait":
            top, baseline, bottom = 135, 458, h - 144

    for radius in (191, 152, 113):
        hexagon(draw, w - 29, h * .71, radius, palette["pattern"], 3)
    brand_line(image, mark, margin, top, palette, 27 if name == "open-graph" else 31)

    lines = ["Build a more", "profitable business.", "Not just a bigger one."]
    for index, line in enumerate(lines):
        line_size = size if index < 2 else round(size * .68)
        y = baseline + index * pitch + (18 if index == 2 and name != "open-graph" else 0)
        draw.text((margin, y), line, fill=palette["ink"] if index < 2 else palette["accent"], font=font(line_size), anchor="lt")

    draw.line((margin, bottom - 47, w - margin, bottom - 47), fill=palette["line"], width=2)
    draw.text((margin, bottom - 15), "gavinferns.com", fill=palette["ink"], font=font(25, False), anchor="lt")
    return image


def compact_assets(mark, theme, palette):
    lockup = Image.new("RGB", (1200, 360), palette["background"])
    brand_line(lockup, mark, 89, 146, palette, 49)
    lockup.save(OUTPUT / f"logo-{theme}.png", optimize=True)

    profile = Image.new("RGB", (1080, 1080), palette["background"])
    draw = ImageDraw.Draw(profile)
    hexagon(draw, 540, 540, 431, palette["pattern"], 4)
    hexagon(draw, 540, 540, 386, palette["line"], 2)
    logo(profile, mark, 230, 433, 620)
    profile.save(OUTPUT / f"instagram-profile-{theme}.png", optimize=True)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    source = ROOT / "public" / "cgf-logo.svg"
    with TemporaryDirectory() as temp:
        mark_path = Path(temp) / "mark.png"
        run(["inkscape", str(source), "--export-width=1200", f"--export-filename={mark_path}"], check=True)
        mark = Image.open(mark_path).convert("RGBA")
        for theme, palette in THEMES.items():
            compact_assets(mark, theme, palette)
            for name, dimensions in FORMATS.items():
                image = graphic(mark, name, dimensions, palette)
                if name == "open-graph":
                    image.save(OUTPUT / f"{name}-{theme}.jpg", quality=90, optimize=True)
                else:
                    image.save(OUTPUT / f"{name}-{theme}.png", optimize=True)

    guide = """Gavin Ferns Consulting brand pack

Logo lockups: 1200 × 360 PNG plus the scalable, transparent CGF mark (SVG)
Instagram profile: 1080 × 1080 PNG, with the mark centred for circular cropping
Instagram square: 1080 × 1080 PNG
Instagram portrait: 1080 × 1350 PNG
Instagram story: 1080 × 1920 PNG
Open Graph: 1200 × 630 JPG for link previews

Use the light variants on light layouts and the dark variants on dark layouts.
Keep the logo proportions and leave space around the mark.

Palette
Navy #07172D
Ink #0C1B32
Blue #1559CC
Sky #8BBAFF
Light tint #F3F7FC
White #FFFFFF

gavinferns.com
"""
    with ZipFile(OUTPUT / "gavin-ferns-brand-pack.zip", "w") as archive:
        items = {image.name: image.read_bytes() for image in OUTPUT.iterdir() if image.suffix in {".png", ".jpg"}}
        items[source.name] = source.read_bytes()
        items["README.txt"] = guide.encode()
        for name, content in sorted(items.items()):
            archive.writestr(ZipInfo(name), content, compress_type=ZIP_DEFLATED)


if __name__ == "__main__":
    main()
