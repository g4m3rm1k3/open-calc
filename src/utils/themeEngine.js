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

  const bg0 = hexToRgb(extractHex(ui.bg0));
  const bg1 = hexToRgb(extractHex(ui.bg1));
  const bg2 = hexToRgb(extractHex(ui.bg2));
  const border = hexToRgb(extractHex(ui.border) || extractHex(ui.btnBorder));
  const txt1 = hexToRgb(extractHex(ui.txt1));
  const txt2 = hexToRgb(extractHex(ui.txt2));
  const primary = hexToRgb(themeDef.accentHex);

  // Map to slate/sky scale. We only override the dark mode relevant colors.
  return {
    slate: {
      ...DEFAULT_PALETTE_RGB.slate, // fallback light mode colors remain default
      950: bg0 || DEFAULT_PALETTE_RGB.slate[950],
      900: bg1 || DEFAULT_PALETTE_RGB.slate[900],
      800: bg2 || DEFAULT_PALETTE_RGB.slate[800],
      700: border || DEFAULT_PALETTE_RGB.slate[700],
      600: border || DEFAULT_PALETTE_RGB.slate[600],
      500: txt2 || DEFAULT_PALETTE_RGB.slate[500],
      400: txt2 || DEFAULT_PALETTE_RGB.slate[400],
      300: txt1 || DEFAULT_PALETTE_RGB.slate[300],
      200: txt1 || DEFAULT_PALETTE_RGB.slate[200],
      100: txt1 || DEFAULT_PALETTE_RGB.slate[100],
    },
    sky: {
      ...DEFAULT_PALETTE_RGB.sky,
      400: primary || DEFAULT_PALETTE_RGB.sky[400],
      500: primary || DEFAULT_PALETTE_RGB.sky[500],
      600: primary || DEFAULT_PALETTE_RGB.sky[600],
    },
    brand: generatePalette(themeDef.accentHex)
  };
}

export function generateThemeStyleString(colors, isDefault = false) {
  if (!colors) return '';
  const selector = isDefault ? ':root' : '.dark';
  let css = `${selector} {\n`;
  Object.keys(colors.slate).forEach(shade => {
    css += `  --tw-custom-slate-${shade}: ${colors.slate[shade]};\n`;
  });
  Object.keys(colors.sky).forEach(shade => {
    css += `  --tw-custom-sky-${shade}: ${colors.sky[shade]};\n`;
  });
  if (colors.brand) {
    Object.keys(colors.brand).forEach(shade => {
      css += `  --tw-custom-brand-${shade}: ${colors.brand[shade]};\n`;
    });
  }
  css += '}\n';
  return css;
}
