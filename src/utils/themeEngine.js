// Tailwind default palette RGB values
export const DEFAULT_PALETTE_RGB = {
  slate: {
    50: '248 250 252',
    100: '241 245 249',
    200: '226 232 240',
    300: '203 213 225',
    400: '148 163 184',
    500: '100 116 139',
    600: '71 85 105',
    700: '51 65 85',
    800: '30 41 59',
    900: '15 23 42',
    950: '2 6 23',
  },
  sky: {
    50: '240 249 255',
    100: '224 242 254',
    200: '186 230 253',
    300: '125 211 252',
    400: '56 189 248',
    500: '14 165 233',
    600: '2 132 199',
    700: '3 105 161',
    800: '7 89 133',
    900: '12 74 110',
    950: '8 47 73',
  },
  brand: {
    50: '240 244 255',
    100: '224 233 255',
    200: '199 215 254',
    300: '165 184 252',
    400: '129 147 248',
    500: '100 112 241',
    600: '80 84 228',
    700: '67 65 202',
    800: '56 55 163',
    900: '50 52 129',
    950: '30 31 76',
  }
};

function hexToRgbArray(hex) {
  if (!hex) return null;
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16)
  ];
}

function hexToRgb(hex) {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return null;
  return rgb.join(' ');
}

function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t)
  ];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = 0; s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1, g1, b1;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
}

function rgbArrayToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

// Rotates a hex color's hue by `degrees`, preserving its saturation/lightness.
// Used to derive a second, genuinely distinct accent color from each theme's
// single accentHex — no per-theme manual curation needed.
export function rotateHue(hex, degrees) {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return hex;
  const [h, s, l] = rgbToHsl(...rgb);
  return rgbArrayToHex(hslToRgb(h + degrees, s, l));
}

function generatePalette(baseHex) {
  if (!baseHex) return DEFAULT_PALETTE_RGB.brand;
  const base = hexToRgbArray(baseHex);
  const white = [255, 255, 255];
  const black = [0, 0, 0];
  
  return {
    50: lerpColor(white, base, 0.1).join(' '),
    100: lerpColor(white, base, 0.2).join(' '),
    200: lerpColor(white, base, 0.4).join(' '),
    300: lerpColor(white, base, 0.6).join(' '),
    400: lerpColor(white, base, 0.8).join(' '),
    500: base.join(' '),
    600: lerpColor(base, black, 0.2).join(' '),
    700: lerpColor(base, black, 0.4).join(' '),
    800: lerpColor(base, black, 0.6).join(' '),
    900: lerpColor(base, black, 0.8).join(' '),
    950: lerpColor(base, black, 0.9).join(' ')
  };
}

export function extractThemeColors(themeDef) {
  if (!themeDef || !themeDef.uiDark) return null;
  const ui = themeDef.uiDark;
  
  // Extract hex from 'bg-[#282a36]' or similar classes
  const extractHex = (str) => {
    const match = str?.match(/#([0-9a-fA-F]{3,6})/i);
    return match ? match[0] : null;
  };

  const strToArr = (str) => str ? str.split(' ').map(Number) : null;
  
  const bg0Arr = hexToRgbArray(extractHex(ui.bg0));
  const bg1Arr = hexToRgbArray(extractHex(ui.bg1));
  const bg2Arr = hexToRgbArray(extractHex(ui.bg2));
  const borderArr = hexToRgbArray(extractHex(ui.border) || extractHex(ui.btnBorder));
  const txt2Arr = hexToRgbArray(extractHex(ui.txt2));
  const txt1Arr = hexToRgbArray(extractHex(ui.txt1));

  const luminance = (arr) => 0.299 * arr[0] + 0.587 * arr[1] + 0.114 * arr[2];
  
  const sortedBgs = [bg0Arr, bg1Arr, bg2Arr]
    .filter(Boolean)
    .sort((a, b) => luminance(a) - luminance(b));
    
  const darkest = sortedBgs[0] || strToArr(DEFAULT_PALETTE_RGB.slate[950]);
  const middle = sortedBgs[1] || strToArr(DEFAULT_PALETTE_RGB.slate[900]);
  const lightest = sortedBgs[2] || strToArr(DEFAULT_PALETTE_RGB.slate[800]);
  
  const b = borderArr || strToArr(DEFAULT_PALETTE_RGB.slate[700]);
  const t2 = txt2Arr || strToArr(DEFAULT_PALETTE_RGB.slate[500]);
  const t1 = txt1Arr || strToArr(DEFAULT_PALETTE_RGB.slate[200]);
  const white = [255, 255, 255];

  const isLight = themeDef.forceLight;

  let slateScale;
  if (isLight) {
    slateScale = {
      ...DEFAULT_PALETTE_RGB.slate,
      50: lightest.join(' '),
      100: middle.join(' '),
      200: darkest.join(' '),
      300: b.join(' '),
      400: lerpColor(b, t2, 0.5).join(' '),
      500: t2.join(' '),
      600: lerpColor(t2, t1, 0.5).join(' '),
      700: lerpColor(t2, t1, 0.8).join(' '),
      800: t1.join(' '),
      900: lerpColor(t1, [0, 0, 0], 0.5).join(' '),
      950: lerpColor(t1, [0, 0, 0], 0.8).join(' '),
    };
  } else {
    slateScale = {
      ...DEFAULT_PALETTE_RGB.slate, // fallback light mode colors remain default
      950: darkest.join(' '),
      900: middle.join(' '),
      800: lightest.join(' '),
      700: b.join(' '),
      600: lerpColor(b, t2, 0.5).join(' '), // Halfway between border and muted text
      500: t2.join(' '),
      400: lerpColor(t2, t1, 0.5).join(' '), // Halfway between muted and normal text
      300: lerpColor(t2, t1, 0.8).join(' '),
      200: t1.join(' '),
      100: lerpColor(t1, white, 0.5).join(' '),
      50:  lerpColor(t1, white, 0.8).join(' '),
    };
  }

  // Map to slate/sky scale.
  return {
    slate: slateScale,
    // "sky" is the theme's secondary accent — hue-rotated from the primary
    // accentHex so every theme automatically gets a second, genuinely
    // distinct accent (used for `teal` in useThemeColors so it's no longer
    // identical to `blue`/brand). No per-theme manual curation needed.
    sky: generatePalette(rotateHue(themeDef.accentHex, 130)),
    brand: generatePalette(themeDef.accentHex)
  };
}

export function generateThemeStyleString(colors, forceLight = false) {
  if (!colors) return '';
  // Always write both selectors so switching themes never leaves residual vars
  // from the other scope. The active scope gets the theme's vars; the inactive
  // scope gets an explicit empty block that resets any previous values.
  let vars = '';
  Object.keys(colors.slate).forEach(shade => {
    vars += `  --tw-custom-slate-${shade}: ${colors.slate[shade]};\n`;
  });
  Object.keys(colors.sky).forEach(shade => {
    vars += `  --tw-custom-sky-${shade}: ${colors.sky[shade]};\n`;
  });
  if (colors.brand) {
    Object.keys(colors.brand).forEach(shade => {
      vars += `  --tw-custom-brand-${shade}: ${colors.brand[shade]};\n`;
    });
  }
  if (forceLight) {
    // Apply to :root so vars are active without a .dark class
    return `:root {\n${vars}}\n.dark {}\n`;
  } else {
    // Apply to .dark; clear :root so vue-light vars don't bleed through
    return `:root {}\n.dark {\n${vars}}\n`;
  }
}
