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

  monaco.editor.defineTheme("github-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6e7781", fontStyle: "italic" },
      { token: "keyword", foreground: "cf222e", fontStyle: "bold" },
      { token: "string", foreground: "0a3069" },
      { token: "number", foreground: "0550ae" },
      { token: "type", foreground: "953800" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#24292f",
      "editorLineNumber.foreground": "#8c959f",
      "editorLineNumber.activeForeground": "#24292f",
      "editorCursor.foreground": "#0969da",
      "editor.selectionBackground": "#0969da33",
      "editor.lineHighlightBackground": "#f6f8fa",
      "editorWidget.background": "#ffffff",
      "editorWidget.border": "#d0d7de",
    },
  });

  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8b949e", fontStyle: "italic" },
      { token: "keyword", foreground: "ff7b72", fontStyle: "bold" },
      { token: "string", foreground: "a5d6ff" },
      { token: "number", foreground: "79c0ff" },
      { token: "type", foreground: "ffa657" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "editorLineNumber.foreground": "#6e7681",
      "editorLineNumber.activeForeground": "#c9d1d9",
      "editorCursor.foreground": "#58a6ff",
      "editor.selectionBackground": "#388bfd33",
      "editor.lineHighlightBackground": "#161b22",
      "editorWidget.background": "#161b22",
      "editorWidget.border": "#30363d",
    },
  });

  monaco.editor.defineTheme("dracula", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6272a4", fontStyle: "italic" },
      { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
      { token: "string", foreground: "f1fa8c" },
      { token: "number", foreground: "bd93f9" },
      { token: "type", foreground: "8be9fd" },
      { token: "function", foreground: "50fa7b" },
      { token: "variable", foreground: "f8f8f2" },
    ],
    colors: {
      "editor.background": "#282a36",
      "editor.foreground": "#f8f8f2",
      "editorLineNumber.foreground": "#6272a4",
      "editorLineNumber.activeForeground": "#f8f8f2",
      "editorCursor.foreground": "#f8f8f2",
      "editor.selectionBackground": "#44475a",
      "editor.lineHighlightBackground": "#44475a66",
      "editorWidget.background": "#21222c",
      "editorWidget.border": "#6272a4",
    },
  });

  monaco.editor.defineTheme("nord-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "4c566a", fontStyle: "italic" },
      { token: "keyword", foreground: "81a1c1", fontStyle: "bold" },
      { token: "string", foreground: "a3be8c" },
      { token: "number", foreground: "b48ead" },
      { token: "type", foreground: "8fbcbb" },
      { token: "function", foreground: "88c0d0" },
    ],
    colors: {
      "editor.background": "#2e3440",
      "editor.foreground": "#d8dee9",
      "editorLineNumber.foreground": "#4c566a",
      "editorLineNumber.activeForeground": "#d8dee9",
      "editorCursor.foreground": "#88c0d0",
      "editor.selectionBackground": "#434c5e",
      "editor.lineHighlightBackground": "#3b4252",
      "editorWidget.background": "#3b4252",
      "editorWidget.border": "#434c5e",
    },
  });

  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715e", fontStyle: "italic" },
      { token: "keyword", foreground: "f92672", fontStyle: "bold" },
      { token: "string", foreground: "e6db74" },
      { token: "number", foreground: "ae81ff" },
      { token: "type", foreground: "66d9ef" },
      { token: "function", foreground: "a6e22e" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editorLineNumber.foreground": "#75715e",
      "editorLineNumber.activeForeground": "#f8f8f2",
      "editorCursor.foreground": "#f8f8f2",
      "editor.selectionBackground": "#49483e",
      "editor.lineHighlightBackground": "#3e3d32",
      "editorWidget.background": "#1e1f1c",
      "editorWidget.border": "#75715e",
    },
  });

  monaco.editor.defineTheme("tokyo-night", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "565f89", fontStyle: "italic" },
      { token: "keyword", foreground: "bb9af7", fontStyle: "bold" },
      { token: "string", foreground: "9ece6a" },
      { token: "number", foreground: "ff9e64" },
      { token: "type", foreground: "2ac3de" },
      { token: "function", foreground: "7aa2f7" },
    ],
    colors: {
      "editor.background": "#1a1b26",
      "editor.foreground": "#a9b1d6",
      "editorLineNumber.foreground": "#3b4261",
      "editorLineNumber.activeForeground": "#737aa2",
      "editorCursor.foreground": "#c0caf5",
      "editor.selectionBackground": "#283457",
      "editor.lineHighlightBackground": "#1f2335",
      "editorWidget.background": "#1f2335",
      "editorWidget.border": "#3b4261",
    },
  });

  monaco.editor.defineTheme("one-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5c6370", fontStyle: "italic" },
      { token: "keyword", foreground: "c678dd", fontStyle: "bold" },
      { token: "string", foreground: "98c379" },
      { token: "number", foreground: "d19a66" },
      { token: "type", foreground: "56b6c2" },
      { token: "function", foreground: "61afef" },
    ],
    colors: {
      "editor.background": "#282c34",
      "editor.foreground": "#abb2bf",
      "editorLineNumber.foreground": "#4b5263",
      "editorLineNumber.activeForeground": "#abb2bf",
      "editorCursor.foreground": "#528bff",
      "editor.selectionBackground": "#3e4451",
      "editor.lineHighlightBackground": "#2c313a",
      "editorWidget.background": "#21252b",
      "editorWidget.border": "#181a1f",
    },
  });

  monaco.editor.defineTheme("solarized-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "586e75", fontStyle: "italic" },
      { token: "keyword", foreground: "859900", fontStyle: "bold" },
      { token: "string", foreground: "2aa198" },
      { token: "number", foreground: "d33682" },
      { token: "type", foreground: "268bd2" },
      { token: "function", foreground: "b58900" },
    ],
    colors: {
      "editor.background": "#002b36",
      "editor.foreground": "#839496",
      "editorLineNumber.foreground": "#586e75",
      "editorLineNumber.activeForeground": "#839496",
      "editorCursor.foreground": "#839496",
      "editor.selectionBackground": "#073642",
      "editor.lineHighlightBackground": "#073642",
      "editorWidget.background": "#073642",
      "editorWidget.border": "#586e75",
    },
  });


  monaco.editor.defineTheme("catppuccin", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6c7086", fontStyle: "italic" },
      { token: "keyword", foreground: "cba6f7", fontStyle: "bold" },
      { token: "string", foreground: "a6e3a1" },
      { token: "number", foreground: "fab387" },
      { token: "type", foreground: "89dceb" },
      { token: "function", foreground: "89b4fa" },
    ],
    colors: {
      "editor.background": "#1e1e2e",
      "editor.foreground": "#cdd6f4",
      "editorLineNumber.foreground": "#6c7086",
      "editorLineNumber.activeForeground": "#cdd6f4",
      "editorCursor.foreground": "#f5e0dc",
      "editor.selectionBackground": "#313244",
      "editor.lineHighlightBackground": "#313244aa",
      "editorWidget.background": "#181825",
      "editorWidget.border": "#45475a",
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

  // Monaco's own TypeScript defaults never set `jsx` at all (confirmed
  // live: getCompilerOptions() returns only { allowNonTsExtensions, target }
  // before this runs). That was invisible as long as every JS/TS file in
  // HTML Lab was an anonymous, path-less Monaco model — but the moment a
  // file gets a real `.tsx` path (see CodePanel.tsx's per-file model fix),
  // TypeScript correctly starts enforcing the flag it was always missing:
  // "Cannot use JSX unless the '--jsx' flag is provided." `JsxEmit.React`
  // matches this project's actual Babel transform (jsxTranspile.ts uses
  // the React preset's classic runtime, not the newer automatic runtime).
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    jsx: monaco.languages.typescript.JsxEmit.React,
  });

  // HTML Lab loads React/ReactDOM as global UMD scripts (see
  // cdnLibraries.ts's reactCdnTags) — there's no `import React from 'react'`
  // anywhere for Monaco to resolve. The real @types/react package (already
  // a devDependency) is written for real `import` usage and pulls in a
  // ~22,000-line `csstype` dependency; loading all of that into the
  // in-browser TS worker is a real perf risk for a live-typing editor. This
  // is a small, hand-written stand-in instead: real generics for the hooks
  // this app's lessons actually use (confirmed live: a plain `React: any`
  // stub breaks `React.useState<T>(...)` — "Untyped function calls may not
  // accept type arguments" — since calling an `any`-typed function can't
  // take explicit generics), everything else left as loosely-typed `any`.
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `
    type SetStateAction<S> = S | ((prevState: S) => S);
    type Dispatch<A> = (value: A) => void;
    type EffectCallback = () => void | (() => void);
    type DependencyList = readonly unknown[];

    declare namespace React {
      function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
      function useEffect(effect: EffectCallback, deps?: DependencyList): void;
      function useMemo<T>(factory: () => T, deps: DependencyList): T;
      function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T;
      function useRef<T>(initialValue: T): { current: T };
      function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, Dispatch<A>];
      interface Context<T> {
        Provider: (props: { value: T; children?: any }) => any;
        Consumer: (props: { children: (value: T) => any }) => any;
      }
      function createContext<T>(defaultValue: T): Context<T>;
      function useContext<T>(context: Context<T>): T;
      function memo<T>(component: T): T;
      function createElement(...args: any[]): any;
      const Fragment: any;
      class Component<P = {}, S = {}> {
        props: P;
        state: S;
        constructor(props: P);
        setState(state: Partial<S> | ((prevState: S, props: P) => Partial<S>)): void;
        render(): any;
      }
    }

    declare namespace ReactDOM {
      interface Root {
        render(children: any): void;
        unmount(): void;
      }
      function createRoot(container: Element | DocumentFragment, options?: any): Root;
    }

    // Real @types/react makes "key" (and "ref") valid on *any* JSX element
    // regardless of the component's own declared props, via this exact
    // global interface. Without it (confirmed live), passing a totally
    // idiomatic <Component key={...} /> fails: "Property 'key' does not
    // exist on type '...Props'." — a real, standard React pattern (lesson
    // 22 uses it to force a component to remount) flagged as an error.
    declare namespace JSX {
      interface IntrinsicAttributes {
        key?: string | number | null;
      }
      // Real @types/react uses this exact interface to tell TypeScript
      // that nested JSX content (<Foo>content</Foo>) should satisfy
      // whichever prop is named "children" — without it (confirmed live),
      // wrapping a component with a required "children" prop in JSX
      // (lesson 27's <CalculatorErrorBoundary>...</CalculatorErrorBoundary>)
      // fails: "Property 'children' is missing," because TypeScript has
      // no rule connecting nested JSX to any prop at all.
      interface ElementChildrenAttribute {
        children: {};
      }
    }
    `,
    "file:///react-globals.d.ts",
  );
}
