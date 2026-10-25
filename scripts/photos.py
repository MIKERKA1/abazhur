"""Prepares the site photos: resizes Unsplash originals and gives them one warm "lamp-lit" grade.

Usage: python -I scripts/photos.py <folder with originals named photo-<id>.jpg>
Originals were downloaded from images.unsplash.com at 2000 px wide. Authors and licences live in
src/data/photos.ts; this script only knows file names. The grade pulls every picture towards the
site palette (wine shadows, lamp-cream highlights) so photos from different authors read as one set
and the neon of other venues does not fight the page.
"""
import sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps

OUT = Path(__file__).resolve().parent.parent / "src" / "assets" / "photos"

PHOTOS = {
    "lamp-room": "photo-1704536345279-4b7dfa0c166d",
    "shade": "photo-1780140765084-88e4e0d75528",
    "keyboard": "photo-1547394765-185e1e68f34e",
    "gamepad": "photo-1552820728-8b83bb6b773f",
    "headphones": "photo-1599669454699-248893623440",
    "friends": "photo-1725272333872-4c2d274ad493",
    "player": "photo-1725272334053-cc3ac867255d",
    "player-2": "photo-1725272480173-c858b5acbc82",
    "console": "photo-1493711662062-fa541adb3fc8",
    "duo": "photo-1758410473619-c204b1bcf13a",
    "lamp": "photo-1758789886430-34bdb4701e69",
    "street": "photo-1734115861523-971b65914ad3",
    "room": "photo-1726442145401-81bb64183e3b",
}

# Duotone ends taken from the palette: --room (shadows), --clay (mids), --lamp (highlights).
SHADOW, MID, LIGHT = "#1a0d0e", "#8a5446", "#f4ddb4"
TINT = 0.42  # share of the duotone in the final picture; the rest is the desaturated original


def grade(im: Image.Image) -> Image.Image:
    base = ImageEnhance.Color(im).enhance(0.55)
    tone = ImageOps.colorize(ImageOps.grayscale(im), black=SHADOW, white=LIGHT, mid=MID).convert("RGB")
    return Image.blend(base, tone, TINT)


def main(src: Path) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, pid in PHOTOS.items():
        im = Image.open(src / f"{pid}.jpg").convert("RGB")
        im.thumbnail((1800, 1800), Image.LANCZOS)
        # Saved without EXIF: originals may carry camera and location metadata.
        grade(im).save(OUT / f"{name}.jpg", quality=86, optimize=True, progressive=True)
        print(f"{name}: {im.width}x{im.height}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(Path(sys.argv[1]))
