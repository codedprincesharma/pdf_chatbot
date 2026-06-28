/**
 * Light markdown-to-HTML parser with XSS mitigation.
 * Ported from the vanilla JS `parseMarkdown()` in public/app.js.
 */
export function parseMarkdown(text: string): string {
  if (!text) return '';

  // Escape HTML tags to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Bold text: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Inline code: `code` -> <code>code</code>
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Handle lists and paragraphs
  const lines = html.split('\n');
  let inList = false;
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${trimmed.substring(2)}</li>`);
    } else if (trimmed.match(/^\d+\.\s/)) {
      if (!inList) {
        result.push('<ol>');
        inList = true;
      }
      const itemContent = trimmed.replace(/^\d+\.\s/, '');
      result.push(`<li>${itemContent}</li>`);
    } else {
      if (inList) {
        const lastOpenTag =
          result.lastIndexOf('<ul>') > result.lastIndexOf('<ol>')
            ? '</ul>'
            : '</ol>';
        result.push(lastOpenTag);
        inList = false;
      }
      result.push(line ? `<p>${line}</p>` : '');
    }
  }

  if (inList) {
    const lastOpenTag =
      result.lastIndexOf('<ul>') > result.lastIndexOf('<ol>')
        ? '</ul>'
        : '</ol>';
    result.push(lastOpenTag);
  }

  return result.join('\n');
}
