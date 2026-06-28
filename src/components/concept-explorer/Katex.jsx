import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function Katex({ latex, display = true }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { displayMode: display, throwOnError: false, strict: false });
    } catch {
      return `<code style="color:#f87171">${latex}</code>`;
    }
  }, [latex, display]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
