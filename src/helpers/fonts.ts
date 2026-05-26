import { readFileSync } from 'fs';
import { join } from 'path';
import type { CardOptions } from '../schema';

const fontsDir = join(__dirname, '../fonts');

const ggSansBase64 = readFileSync(join(fontsDir, 'ggsans.woff2')).toString('base64');
const ggSansBoldBase64 = readFileSync(join(fontsDir, 'ggsansbold.woff2')).toString('base64');
export const GG_SANS_FONT_FACE = `
@font-face {
  font-family: 'GG Sans';
  font-style: normal;
  font-weight: 400;
  src: url('data:font/woff2;charset=utf-8;base64,${ggSansBase64}') format('woff2');
}
@font-face {
  font-family: 'GG Sans';
  font-style: normal;
  font-weight: 700;
  src: url('data:font/woff2;charset=utf-8;base64,${ggSansBoldBase64}') format('woff2');
}
`;
export const fontFamily = "GG Sans,sans-serif";

type NameFontKey = Exclude<CardOptions["font"], "ggsans">;

interface NameFont {
  family: string;
  full: string;
  subset: string;
}

const loadFont = (slug: NameFontKey, family: string): NameFont => ({
  family,
  full: readFileSync(join(fontsDir, `${slug}.woff2`)).toString('base64'),
  subset: readFileSync(join(fontsDir, `${slug}-subset.woff2`)).toString('base64'),
});

const nameFonts: Record<NameFontKey, NameFont> = {
  tempo: loadFont("tempo", "Zilla Slab"),
  sakura: loadFont("sakura", "Cherry Bomb One"),
  jellybean: loadFont("jellybean", "Chicle"),
  modern: loadFont("modern", "MuseoModerno"),
  medieval: loadFont("medieval", "Neo-castel"),
  "8bit": loadFont("8bit", "Pixelify Sans"),
  vampyre: loadFont("vampyre", "Sinistre"),
};

const ASCII_ONLY = /^[\x20-\x7E]*$/;

export const nameFontFamily = (font: CardOptions["font"]): string => {
  if (font === "ggsans") return fontFamily;
  return `'${nameFonts[font].family}',${fontFamily}`;
};

export const buildNameFontFace = (font: CardOptions["font"], displayName: string): string => {
  if (font === "ggsans") return "";
  const { family, full, subset } = nameFonts[font];
  const data = ASCII_ONLY.test(displayName) ? subset : full;
  return `
@font-face {
  font-family: '${family}';
  font-style: normal;
  src: url('data:font/woff2;charset=utf-8;base64,${data}') format('woff2');
}
`;
};
