// Monaco Monarch tokenizer for Vue SFCs.
// Provides syntax highlighting for all three sections (<script>, <template>, <style>)
// and Vue-specific constructs (v-for, :prop, @event, {{ }}).
// Using language id 'vue' means Monaco's TypeScript service does NOT run on these
// files — eliminating the red squigglies from <template> and <style> sections.

export const VUE_LANG = 'vue'

export function registerVueLanguage(monaco) {
  // Only register once
  if (monaco.languages.getLanguages().some(l => l.id === VUE_LANG)) return

  monaco.languages.register({ id: VUE_LANG, extensions: ['.vue'] })

  // ── Monarch tokenizer ─────────────────────────────────────────────────────
  monaco.languages.setMonarchTokensProvider(VUE_LANG, {
    defaultToken: 'text',
    tokenPostfix: '',

    // Top-level keywords (used in script section)
    keywords: [
      'import', 'export', 'from', 'default', 'const', 'let', 'var',
      'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch',
      'case', 'break', 'continue', 'of', 'in', 'new', 'delete', 'typeof',
      'instanceof', 'void', 'throw', 'try', 'catch', 'finally',
      'class', 'extends', 'super', 'this', 'async', 'await',
      'true', 'false', 'null', 'undefined',
      // TypeScript
      'type', 'interface', 'as', 'implements', 'enum', 'declare', 'abstract',
      'public', 'private', 'protected', 'readonly', 'static', 'override',
    ],

    // Vue Composition API — highlighted distinctly in the editor
    vueApis: [
      'ref', 'reactive', 'computed', 'watch', 'watchEffect', 'toRef', 'toRefs',
      'readonly', 'isRef', 'unref', 'shallowRef', 'shallowReactive',
      'onMounted', 'onUnmounted', 'onUpdated', 'onBeforeMount', 'onBeforeUpdate',
      'onBeforeUnmount', 'onErrorCaptured', 'onActivated', 'onDeactivated',
      'defineProps', 'defineEmits', 'defineExpose', 'withDefaults',
      'provide', 'inject', 'nextTick', 'createApp', 'defineComponent',
      'useSlots', 'useAttrs',
    ],

    tokenizer: {
      // ── Root: the SFC block structure ─────────────────────────────────────
      root: [
        // <script setup lang="ts"> or <script lang="ts"> or <script>
        [/(<)(script)/, ['tag.sfc', { token: 'tag.sfc', next: '@scriptTag' }]],
        // <template> or <template lang="pug"> etc.
        [/(<)(template)/, ['tag.sfc', { token: 'tag.sfc', next: '@templateTag' }]],
        // <style scoped> or <style>
        [/(<)(style)/, ['tag.sfc', { token: 'tag.sfc', next: '@styleTag' }]],
        // Closing SFC block tags
        [/<\/(script|template|style)>/, 'tag.sfc'],
        [/./, 'text'],
      ],

      // Opening tag attribute parsing (between < and >)
      scriptTag: [
        [/>/, { token: 'tag.sfc', next: '@script' }],
        [/lang="ts"/, 'attribute.value'],
        [/lang="js"/, 'attribute.value'],
        [/setup/, 'keyword'],
        [/[a-zA-Z-]+/, 'attribute.name'],
        [/=/, 'delimiter'],
        [/"[^"]*"/, 'attribute.value'],
        [/'[^']*'/, 'attribute.value'],
      ],
      templateTag: [
        [/>/, { token: 'tag.sfc', next: '@template' }],
        [/[a-zA-Z-]+/, 'attribute.name'],
        [/=/, 'delimiter'],
        [/"[^"]*"/, 'attribute.value'],
      ],
      styleTag: [
        [/>/, { token: 'tag.sfc', next: '@style' }],
        [/scoped/, 'keyword'],
        [/[a-zA-Z-]+/, 'attribute.name'],
        [/=/, 'delimiter'],
        [/"[^"]*"/, 'attribute.value'],
      ],

      // ── Script section ────────────────────────────────────────────────────
      script: [
        [/<\/script>/, { token: 'tag.sfc', next: '@pop' }],

        // Line comments
        [/\/\/.*$/, 'comment'],
        // Block comments
        [/\/\*/, { token: 'comment', next: '@blockComment' }],

        // Template literals
        [/`/, { token: 'string.template', next: '@templateLiteral' }],
        // Regular strings
        [/"(?:[^"\\]|\\.)*"/, 'string'],
        [/'(?:[^'\\]|\\.)*'/, 'string'],

        // Vue Composition API — cyan/teal colour in most themes
        [/\b(ref|reactive|computed|watch|watchEffect|toRef|toRefs|readonly|isRef|unref|shallowRef|shallowReactive|onMounted|onUnmounted|onUpdated|onBeforeMount|onBeforeUpdate|onBeforeUnmount|onErrorCaptured|onActivated|onDeactivated|defineProps|defineEmits|defineExpose|withDefaults|provide|inject|nextTick|createApp|defineComponent|useSlots|useAttrs)\b/, 'type.vue-api'],

        // TypeScript type keywords
        [/\b(type|interface|implements|enum|declare|abstract|public|private|protected|readonly|static|override|as)\b/, 'keyword.type'],
        // JS/TS keywords
        [/\b(import|export|from|default|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|of|in|new|delete|typeof|instanceof|void|throw|try|catch|finally|class|extends|super|this|async|await)\b/, 'keyword'],
        // Boolean/null literals
        [/\b(true|false|null|undefined)\b/, 'constant'],

        // Numbers
        [/\b\d+(\.\d+)?([eE][+-]?\d+)?\b/, 'number'],
        [/\b0x[0-9a-fA-F]+\b/, 'number'],

        // Identifiers
        [/[a-zA-Z_$][a-zA-Z0-9_$]*/, 'identifier'],

        // Brackets
        [/[{}()\[\]]/, '@brackets'],
        // Operators
        [/[+\-*/%&|^~<>!=?:]+/, 'operator'],
        [/[;,.]/, 'delimiter'],

        [/\s+/, 'white'],
      ],

      blockComment: [
        [/\*\//, { token: 'comment', next: '@pop' }],
        [/.|\n/, 'comment'],
      ],

      templateLiteral: [
        [/`/, { token: 'string.template', next: '@pop' }],
        [/\$\{/, { token: 'delimiter.template', next: '@templateExpr' }],
        [/./, 'string.template'],
      ],

      templateExpr: [
        [/}/, { token: 'delimiter.template', next: '@pop' }],
        { include: '@script' },
      ],

      // ── Template section ──────────────────────────────────────────────────
      template: [
        [/<\/template>/, { token: 'tag.sfc', next: '@pop' }],

        // Mustache interpolation  {{ expr }}
        [/\{\{/, { token: 'delimiter.mustache', next: '@mustache' }],

        // Vue built-in directives
        [/\b(v-for|v-if|v-else-if|v-else|v-show|v-model|v-bind|v-on|v-slot|v-html|v-text|v-pre|v-once|v-memo|v-cloak)\b/, 'keyword.directive'],

        // Shorthand: :prop  @event  #slot
        [/:[a-zA-Z][a-zA-Z0-9-]*(?=\s*=|\s*>|\s+)/, 'attribute.binding'],
        [/@[a-zA-Z][a-zA-Z0-9-]*(?:\.[a-zA-Z]+)*/, 'attribute.event'],
        [/#[a-zA-Z][a-zA-Z0-9-]*/, 'attribute.slot'],

        // HTML/Vue component tags
        [/<[A-Z][a-zA-Z0-9-]*/, 'tag.component'],  // PascalCase = Vue component
        [/<[a-z][a-zA-Z0-9-]*/, 'tag'],             // lowercase = HTML element
        [/<\/[a-zA-Z][a-zA-Z0-9-]*>/, 'tag'],
        [/\/>/, 'tag'],
        [/>/, 'tag'],

        // Attribute names and values
        [/[a-zA-Z][a-zA-Z0-9-]*(?=\s*=)/, 'attribute.name'],
        [/"[^"]*"/, 'attribute.value'],
        [/'[^']*'/, 'attribute.value'],

        [/\s+/, 'white'],
        [/./, 'text'],
      ],

      mustache: [
        [/\}\}/, { token: 'delimiter.mustache', next: '@pop' }],
        [/\b(true|false|null|undefined)\b/, 'constant'],
        [/\b\d+\b/, 'number'],
        [/'[^']*'|"[^"]*"/, 'string'],
        [/[a-zA-Z_$][a-zA-Z0-9_$]*/, 'identifier'],
        [/[.?!+\-*/%<>=&|,\[\](){}]/, 'operator'],
        [/\s+/, 'white'],
      ],

      // ── Style section ─────────────────────────────────────────────────────
      style: [
        [/<\/style>/, { token: 'tag.sfc', next: '@pop' }],

        [/\/\*/, { token: 'comment', next: '@cssComment' }],

        // :root, &, ::before etc.
        [/::?[a-zA-Z-]+/, 'tag.pseudo'],
        // Class and ID selectors (before `{`)
        [/[.#][a-zA-Z][a-zA-Z0-9_-]*/, 'type.selector'],
        // Element selectors
        [/[a-zA-Z][a-zA-Z0-9-]*(?=\s*[{,])/, 'tag'],

        // CSS variables
        [/--[a-zA-Z][a-zA-Z0-9-]*/, 'variable.css'],

        // Property names (before `:`)
        [/[a-z-]+(?=\s*:)/, 'attribute.css-prop'],

        // Color values
        [/#[0-9a-fA-F]{3,8}\b/, 'number.hex'],
        // Numbers with units
        [/\d+(\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax|s|ms|fr|deg|rad|turn|ch|ex)?/, 'number'],
        // Strings
        [/"[^"]*"|'[^']*'/, 'string'],
        // Keywords
        [/\b(auto|none|inherit|initial|unset|normal|bold|italic|solid|dashed|dotted|flex|grid|block|inline|absolute|relative|fixed|sticky)\b/, 'keyword.css'],
        // Delimiters
        [/[{}:;,]/, 'delimiter'],
        [/\s+/, 'white'],
        [/./, 'text'],
      ],

      cssComment: [
        [/\*\//, { token: 'comment', next: '@pop' }],
        [/.|\n/, 'comment'],
      ],
    },
  })

  // ── Language configuration (bracket matching, autoclosing, etc.) ──────────
  monaco.languages.setLanguageConfiguration(VUE_LANG, {
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
      ['<', '>'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: "'", close: "'", notIn: ['string', 'comment'] },
      { open: '"', close: '"', notIn: ['string'] },
      { open: '`', close: '`', notIn: ['string'] },
    ],
    surroundingPairs: [
      { open: "'", close: "'" },
      { open: '"', close: '"' },
      { open: '`', close: '`' },
      { open: '(', close: ')' },
      { open: '[', close: ']' },
      { open: '{', close: '}' },
      { open: '<', close: '>' },
    ],
    indentationRules: {
      increaseIndentPattern: /^((?!\/\/).)*(\{[^}"'`]*|\([^)"'`]*|\[[^\]"'`]*)$/,
      decreaseIndentPattern: /^((?!.*?\/\*).*\*\/)?\s*[\}\]\)].*$/,
    },
    folding: {
      markers: {
        start: /^\s*<!--\s*#region\b.*-->/,
        end:   /^\s*<!--\s*#endregion\b.*-->/,
      },
    },
  })
}
