const OPENMAT_KEYWORDS = [
  "if", "else", "elseif", "for", "while", "break", "continue", "return", "end",
  "function", "switch", "case", "otherwise", "try", "catch",
  "hold", "grid", "subplot", "plot", "stem", "area", "surf", "mesh",
  "title", "xlabel", "ylabel", "legend", "xlim", "ylim", "axis",
  "disp", "fprintf", "sprintf", "num2str", "who", "whos", "clear", "clc",
  "format", "slider", "animate",
];

const OPENMAT_BUILTINS = [
  "sin", "cos", "tan", "asin", "acos", "atan", "sinh", "cosh", "tanh",
  "exp", "log", "log10", "sqrt", "abs", "real", "imag", "angle",
  "linspace", "logspace", "zeros", "ones", "eye", "rand", "randn",
  "sum", "prod", "mean", "median", "std", "var", "min", "max",
  "sort", "unique", "find", "diff", "gradient", "trapz", "roots",
  "polyfit", "polyval", "polyder", "det", "inv", "eig", "svd", "qr",
  "lu", "rank", "cond", "orth", "null", "dot", "cross", "meshgrid",
  "interp1", "fft", "fftshift", "conv", "filter", "findpeaks",
];

const OPENMAT_CONSTANTS = ["pi", "inf", "NaN", "true", "false", "i", "j"];

export function setupOpenCalcMonaco(monaco) {
  if (!monaco || monaco.__openCalcConfigured) return;
  monaco.__openCalcConfigured = true;

  monaco.editor.defineTheme("open-calc-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6e86a6" },
      { token: "keyword", foreground: "74c0fc", fontStyle: "bold" },
      { token: "string", foreground: "8ce99a" },
      { token: "number", foreground: "ffd166" },
      { token: "delimiter", foreground: "9fb5d1" },
    ],
    colors: {
      "editor.background": "#07111e",
      "editor.foreground": "#b7d7ff",
      "editorLineNumber.foreground": "#4f6b91",
      "editorLineNumber.activeForeground": "#8dbdff",
      "editorCursor.foreground": "#7dd3fc",
      "editor.selectionBackground": "#173a63",
      "editor.inactiveSelectionBackground": "#112a48",
      "editor.lineHighlightBackground": "#0c1b30",
      "editorIndentGuide.background1": "#132946",
      "editorIndentGuide.activeBackground1": "#244a78",
      "editorWidget.background": "#0c1628",
      "editorWidget.border": "#29415f",
    },
  });

  monaco.editor.defineTheme("open-calc-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "7086a0" },
      { token: "keyword", foreground: "1769d1", fontStyle: "bold" },
      { token: "string", foreground: "0f8d85" },
      { token: "number", foreground: "b36d05" },
      { token: "delimiter", foreground: "607188" },
    ],
    colors: {
      "editor.background": "#f3f9ff",
      "editor.foreground": "#16314f",
      "editorLineNumber.foreground": "#8aa0bc",
      "editorLineNumber.activeForeground": "#1769d1",
      "editorCursor.foreground": "#1769d1",
      "editor.selectionBackground": "#cfe5ff",
      "editor.inactiveSelectionBackground": "#e3f0ff",
      "editor.lineHighlightBackground": "#e9f4ff",
      "editorIndentGuide.background1": "#d8e7fa",
      "editorIndentGuide.activeBackground1": "#a8c7ef",
      "editorWidget.background": "#ffffff",
      "editorWidget.border": "#c9d9ee",
    },
  });

  monaco.editor.defineTheme("openmat-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6582a8" },
      { token: "keyword", foreground: "7dc4ff", fontStyle: "bold" },
      { token: "type.identifier", foreground: "7dc4ff" },
      { token: "identifier", foreground: "d4ecff" },
      { token: "predefined", foreground: "4de0cf" },
      { token: "function.identifier", foreground: "9be7ff" },
      { token: "number", foreground: "ffcb6b" },
      { token: "string", foreground: "9df7c5" },
      { token: "operator", foreground: "8fb7e6" },
      { token: "delimiter", foreground: "8fb7e6" },
    ],
    colors: {
      "editor.background": "#081423",
      "editor.foreground": "#cfe7ff",
      "editorLineNumber.foreground": "#4f6b91",
      "editorLineNumber.activeForeground": "#8dbdff",
      "editor.selectionBackground": "#1a3d67",
      "editor.lineHighlightBackground": "#0c1c31",
      "editorCursor.foreground": "#8ed8ff",
      "editorIndentGuide.background1": "#132946",
      "editorIndentGuide.activeBackground1": "#244a78",
      "editorWidget.background": "#0c1628",
      "editorWidget.border": "#29415f",
    },
  });

  monaco.editor.defineTheme("openmat-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "7d90a8" },
      { token: "keyword", foreground: "1769d1", fontStyle: "bold" },
      { token: "type.identifier", foreground: "1769d1" },
      { token: "identifier", foreground: "16314f" },
      { token: "predefined", foreground: "0f8d85" },
      { token: "function.identifier", foreground: "0f6fbc" },
      { token: "number", foreground: "b36d05" },
      { token: "string", foreground: "0f8d85" },
      { token: "operator", foreground: "607188" },
      { token: "delimiter", foreground: "607188" },
    ],
    colors: {
      "editor.background": "#eef7ff",
      "editor.foreground": "#16314f",
      "editorLineNumber.foreground": "#8aa0bc",
      "editorLineNumber.activeForeground": "#1769d1",
      "editor.selectionBackground": "#cfe5ff",
      "editor.lineHighlightBackground": "#e6f2ff",
      "editorCursor.foreground": "#1769d1",
      "editorIndentGuide.background1": "#d8e7fa",
      "editorIndentGuide.activeBackground1": "#a8c7ef",
      "editorWidget.background": "#ffffff",
      "editorWidget.border": "#c9d9ee",
    },
  });

  monaco.languages.register({ id: "openmat" });
  monaco.languages.setLanguageConfiguration("openmat", {
    comments: {
      lineComment: "%",
      blockComment: ["%{", "%}"],
    },
    brackets: [
      ["[", "]"],
      ["(", ")"],
      ["{", "}"],
    ],
    autoClosingPairs: [
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: "{", close: "}" },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: "'", close: "'" },
    ],
  });

  monaco.languages.setMonarchTokensProvider("openmat", {
    keywords: OPENMAT_KEYWORDS,
    builtins: OPENMAT_BUILTINS,
    constants: OPENMAT_CONSTANTS,
    tokenizer: {
      root: [
        [/%.*$/, "comment"],
        [/[a-zA-Z_][\w]*/, {
          cases: {
            "@keywords": "keyword",
            "@builtins": "predefined",
            "@constants": "type.identifier",
            "@default": "identifier",
          },
        }],
        [/@[a-zA-Z_]\w*/, "predefined"],
        [/\d*\.\d+([eE][\-+]?\d+)?/, "number"],
        [/\d+([eE][\-+]?\d+)?/, "number"],
        [/'([^'\\]|\\.)*'?/, "string"],
        [/[\[\]\(\)\{\};,]/, "delimiter"],
        [/[+\-*\/\\^=<>~:&|\.]+/, "operator"],
      ],
    },
  });
}
