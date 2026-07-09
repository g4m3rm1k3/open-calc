// ─── Visual Code Studio — Core Types ─────────────────────────────────────────

export type BlockCategory = 'oop' | 'state' | 'flow' | 'output' | 'html' | 'types'

export type BlockType =
  // OOP
  | 'class' | 'constructor' | 'method' | 'staticMethod' | 'getter' | 'setter' | 'function' | 'call'
  // State
  | 'field' | 'variable' | 'assign' | 'return'
  // Flow
  | 'if' | 'loop'
  // Output
  | 'log'
  // HTML
  | 'event' | 'htmlText' | 'readValue' | 'addClass' | 'removeClass' | 'toggleClass' | 'setStyle'
  // TypeScript-only
  | 'interface' | 'interfaceField' | 'typeAlias' | 'enum' | 'enumMember'

export type FieldKind = 'text' | 'code' | 'select'

export interface FieldSpec {
  name: string
  label: string
  kind: FieldKind
  options?: string[]
}

export interface BlockDefinition {
  type: BlockType
  label: string
  category: BlockCategory
  description: string
  concept: BlockConcept
  defaults: Record<string, string>
  fields: FieldSpec[]
  childTypes: BlockType[]
  tsOnly?: boolean
}

// Explanation of what a block teaches — the "how code goes together" layer
export interface BlockConcept {
  summary: string      // one sentence: what this is
  why: string          // why it exists in the language
  connects: string[]   // what other concepts it relates to (block types or concept names)
  example?: string     // short code example
}

export interface Block {
  id: string
  type: BlockType
  category: BlockCategory
  fields: Record<string, string>
  children: Block[]
}

export interface ProjectFile {
  id: string
  name: string
  blocks: Block[]
}

export interface Project {
  schemaVersion: 2
  id: string
  name: string
  target: 'javascript' | 'typescript'
  files: ProjectFile[]
  activeFileId: string
  html: string
}

export interface Diagnostic {
  level: 'error' | 'warning' | 'info'
  message: string
  blockId?: string
}

export interface GeneratedOutput {
  targetId: string
  code: string
  diagnostics: Diagnostic[]
  // Map from blockId → [startLine, endLine] in generated code
  sourceMap: Record<string, [number, number]>
}

export interface TargetDefinition {
  id: string
  label: string
  fileExtension: string
  transpile: (project: Project, fileId: string) => GeneratedOutput
}
