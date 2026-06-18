/**
 * TODO UPGRADE: Replace GlobalJSPlayground with a proper page-mode editor.
 * Planned: WebContainer/StackBlitz SDK for real Node.js, project file tree,
 * persistent sessions, React/Vue/Svelte templates, xterm.js terminal pane,
 * collaborative sessions (Y.js).
 */
import { useNavigate } from 'react-router-dom'
import GlobalJSPlayground from '../tools/js-playground/index.jsx'

export default function PlaygroundPage() {
  const navigate = useNavigate()
  return <GlobalJSPlayground isOpen onClose={() => navigate('/')} />
}
