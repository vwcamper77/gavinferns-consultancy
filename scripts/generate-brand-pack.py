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
    source = ROOT / "public" / "gfc-logo.svg"
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

    extra_assets(source)
    guide = brand_guide()
    (OUTPUT / "brand-guidelines.txt").write_text(guide)
    # Always replace the social sharing image alongside the downloadable cards.
    (ROOT / "public" / "social-card.jpg").write_bytes((OUTPUT / "open-graph-dark.jpg").read_bytes())
    with ZipFile(OUTPUT / "gavin-ferns-brand-pack.zip", "w") as archive:
        items = {asset.name: asset.read_bytes() for asset in OUTPUT.iterdir() if asset.is_file() and asset.suffix != ".zip"}
        items[source.name] = source.read_bytes()
        for name, content in sorted(items.items()):
            archive.writestr(ZipInfo(name), content, compress_type=ZIP_DEFLATED)


def brand_guide():
    return """GFC — Gavin Ferns Consulting brand guidelines

Identity and names
G = Gavin. F = Ferns. C = Coaching or Consulting.
Personal brand: Gavin Ferns.
Business advisory: Gavin Ferns Consulting. Coaching: Gavin Ferns Coaching.
Full name: Gavin Ferns Business Consulting and Coaching.
Keep existing social handles; the initials do not change account names.

Logo
The approved mark is three horizontally aligned, filled blue hexagons,
with G, F, C in that order. Preserve geometry, letter size and proportions.
Logo type: Arial Bold, 16 units in the original 104 x 36 viewBox.
Clear space: at least 9/36 of the mark height on all sides, including lockups.
Minimum mark width: 78 px digital or 25 mm print. Minimum full lockup:
300 px digital or 80 mm print. Increase size if the name is hard to read.
Use gfc-logo.svg for the scalable original mark; 4800 px PNG for large exports.
Use transparent logos over clear backgrounds with sufficient contrast.
Light lockup: light or white surfaces. Dark lockup: navy surfaces.
White reversed mark: dark, uncluttered surfaces only. Single-colour: navy
on light backgrounds. The reversed mark has transparent letter cutouts.
Correct: uniform scaling, clear space, approved blues, readable lettering.
Incorrect: stretch, rotate, stack, reorder letters, recolour individual
hexagons, add shadows or gradients, crop or place on busy photographs.

Approved colours (sRGB HEX)
Hexagon one #2772EC; hexagon two #1E5FD2; hexagon three #174AAA.
Navy #07172D; Ink #0C1B32; Action blue #1559CC; Sky #8BBAFF;
Light tint #F3F7FC; White #FFFFFF.
Do not replace the three approved hexagon blues with the action blue.

Typography
Arial Bold for headings and brand name; Arial Regular for body copy.
Website fallback stack: Arial, Helvetica, sans-serif.
Export rendering uses Liberation Sans, an Arial-metric-compatible fallback.
SVG lockups retain Arial with sans-serif fallback; text remains editable.
Use readable body sizes, clear hierarchy and high-contrast text.

Social artwork and safe areas (platform crops can change)
Profile images: 1080 x 1080. Keep the mark in the central 620 x 620 square
for circular crops. Applies to Instagram, Facebook, LinkedIn and YouTube.
Instagram feed: 1080 x 1080 and 1080 x 1350; keep key content 90 px inside.
Story and Reel: 1080 x 1920. Keep key content within x=90..990 and
y=268..1634. Preview in-app because controls and feed crops vary.
Facebook cover: 1640 x 624. Key content in central 1200 x 400; preview
on mobile and desktop and avoid profile-picture overlap in lower left.
LinkedIn banner: 1584 x 396. Text and logo in x=450..1484, y=60..320,
clear of the profile picture at lower left.
YouTube channel: 2560 x 1440; all essential content within the centred
1546 x 423 safe area (x=507..2053, y=508..931).
Open Graph: 1200 x 630. Keep essential copy 76 px inside the edges.
Templates are editable SVG where supplied; replace placeholder headings
before use, and check safe areas against current platform previews.

Documents and email
Presentation and proposal covers: 1920 x 1080, PNG and editable SVG.
Proposal letterhead: 1240 x 1754, PNG and editable SVG; keep document
body below y=300 and above y=1550. Add terms and client details separately.
Email signature: HTML plus a transparent 600 x 180 logo. The HTML uses
a public HTTPS image and the verified website only; no unverified mailbox.

Messaging and tone
Build a more profitable business. Not just a bigger one.
Lead with business coaching, strategic consulting and practical action.
Be clear, commercially focused, evidence-led and approachable. Explain
revenue and profit separately. Use the Three Multipliers of Growth:
Revenue = Customers x Purchase Frequency x Average Order Value.
Private consulting engagements from £3,000. Agree scope before quoting;
do not publish internal pricing ranges or imply guaranteed results.
Executive MBA from Imperial College Business School, majoring in Innovation.
AI, Machine Learning, Entrepreneurship and Venture Capital are MBA modules,
not separate degrees or certifications. Do not imply university endorsement
or use its official logo. Corporate project values are experience, not
consulting revenue. Use only cleared case studies and evidenced claims.

gavinferns.com
"""


def svg_file(name, body, width, height):
    content = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">{body}</svg>'
    path = OUTPUT / f"{name}.svg"
    path.write_text(content)
    return path


def render_svg(path, width, output=None):
    target = output or path.with_suffix(".png")
    run(["inkscape", str(path), f"--export-width={width}", f"--export-filename={target}"], check=True, capture_output=True)
    return target


def extra_assets(source):
    from html import escape
    mark = source.read_text()
    inner = mark[mark.index('  <path'):mark.index('</svg>')]
    # Exact original geometry and typography; only the letter order changed.
    (OUTPUT / "gfc-icon.svg").write_text(mark)
    render_svg(OUTPUT / "gfc-icon.svg", 4800, OUTPUT / "gfc-icon-high-resolution.png")
    render_svg(OUTPUT / "gfc-icon.svg", 1200, OUTPUT / "gfc-icon-transparent.png")
    for name, shapes in [
        ("single-colour", inner.replace('#2772ec', '#07172d').replace('#1e5fd2', '#07172d').replace('#174aaa', '#07172d')),
        ("white-reversed", '<defs><mask id="letters"><rect width="104" height="36" fill="white"/>' + inner[inner.index('<g'):].replace('#fff', '#000') + '</mask></defs><g fill="white" mask="url(#letters)">' + inner[:inner.index('<g')].replace('#2772ec', '#fff').replace('#1e5fd2', '#fff').replace('#174aaa', '#fff') + '</g>'),
    ]:
        path = svg_file(f"gfc-{name}", shapes, 104, 36)
        render_svg(path, 1200)
        ink = "#ffffff" if name == "white-reversed" else "#07172d"
        lockup = f'<g transform="translate(89 146) scale(1.8846)">{shapes}</g><text x="322" y="200" font-family="Arial,sans-serif" font-size="49" font-weight="700" fill="{ink}">Gavin Ferns Consulting</text>'
        render_svg(svg_file(f"logo-{name}", lockup, 1200, 360), 1200)

    for theme, palette in THEMES.items():
        # Both background lockups and true transparent equivalents.
        for transparent in [False, True]:
            name = f"logo-{theme}" + ("-transparent" if transparent else "")
            bg = '' if transparent else f'<rect width="1200" height="360" fill="{palette["background"]}"/>'
            body = bg + f'<g transform="translate(89 146) scale(1.8846)">{inner}</g>'
            body += f'<text x="322" y="200" font-family="Arial,sans-serif" font-size="49" font-weight="700" fill="{palette["ink"]}">Gavin Ferns Consulting</text>'
            path = svg_file(name, body, 1200, 360)
            render_svg(path, 1200)
            if transparent:
                render_svg(path, 4800, OUTPUT / f"{name}-high-resolution.png")

        for platform in ["facebook", "linkedin", "youtube"]:
            (OUTPUT / f"{platform}-profile-{theme}.png").write_bytes((OUTPUT / f"instagram-profile-{theme}.png").read_bytes())
        (OUTPUT / f"instagram-reel-{theme}.png").write_bytes((OUTPUT / f"instagram-story-{theme}.png").read_bytes())
        templates = {
            "facebook-cover": (1640, 624, 300, 210, 48),
            "linkedin-banner": (1584, 396, 480, 100, 42),
            "youtube-channel": (2560, 1440, 590, 590, 52),
            "presentation-cover": (1920, 1080, 140, 160, 60),
            "proposal-cover": (1920, 1080, 140, 160, 60),
            "proposal-letterhead": (1240, 1754, 100, 120, 36),
        }
        for name, (w, h, x, y, size) in templates.items():
            heading = {"presentation-cover": "Your presentation title", "proposal-cover": "Your consulting proposal", "proposal-letterhead": "Gavin Ferns Consulting"}.get(name, "Build a more profitable business.")
            byline = "Gavin Ferns Consulting" if name != "proposal-letterhead" else "Business consulting and coaching"
            body = f'<rect width="{w}" height="{h}" fill="{palette["background"]}"/>'
            body += f'<g transform="translate({x} {y}) scale(2)">{inner}</g>'
            body += f'<text x="{x}" y="{y+135}" font-family="Arial,sans-serif" font-size="{size}" font-weight="700" fill="{palette["ink"]}">{escape(heading)}</text>'
            body += f'<text x="{x}" y="{y+195}" font-family="Arial,sans-serif" font-size="{round(size*.6)}" fill="{palette["ink"]}">{byline} · gavinferns.com</text>'
            path = svg_file(f"{name}-{theme}", body, w, h)
            render_svg(path, w)

    # Square canvases preserve the horizontal icon, without cropping its ends.
    icon = Image.open(OUTPUT / "gfc-icon-transparent.png").convert("RGBA")
    square = Image.new("RGBA", (1200, 1200), "#07172d")
    logo(square, icon, 90, 423, 1020)
    square.resize((180, 180), Image.Resampling.LANCZOS).save(ROOT / "public" / "apple-touch-icon.png")
    square.resize((48, 48), Image.Resampling.LANCZOS).save(ROOT / "public" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    for name in ["apple-touch-icon.png", "favicon.ico"]:
        (OUTPUT / name).write_bytes((ROOT / "public" / name).read_bytes())
    signature = Image.open(OUTPUT / "logo-light-transparent.png")
    signature.resize((600, 180), Image.Resampling.LANCZOS).save(OUTPUT / "email-signature-logo.png")
    (OUTPUT / "email-signature.html").write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Gavin Ferns email signature</title><body><table role="presentation" style="font-family:Arial,sans-serif;color:#0c1b32"><tr><td><img src="https://gavinferns.com/brand-pack/email-signature-logo.png" width="300" height="90" alt="GFC — Gavin Ferns Consulting"></td></tr><tr><td><strong>Gavin Ferns</strong><br>Business coach &amp; strategic consultant<br><a href="https://gavinferns.com">gavinferns.com</a></td></tr></table></body></html>')


if __name__ == "__main__":
    main()
