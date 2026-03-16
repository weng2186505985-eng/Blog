/**
 * Strips markdown syntax from a string to return plain text.
 */
export function stripMarkdown(md: string): string {
  if (!md) return '';

  return md
    // 1. Remove headers
    .replace(/^#+\s+/gm, '')
    // 2. Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // 3. Remove links: [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // 4. Remove inline code
    .replace(/`(.*?)`/g, '$1')
    // 5. Remove blockquotes
    .replace(/^\s*>\s+/gm, '')
    // 6. Remove images: ![alt](url) -> alt
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1')
    // 7. Remove list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // 8. Remove horizontal rules
    .replace(/^[*-]{3,}$/gm, '')
    // 9. Extra cleanup
    .replace(/\n+/g, ' ')
    .trim();
}

/**
 * Gets a plain text excerpt from content or summary.
 * Priority: summary > content (stripped)
 */
export function getPostExcerpt(post: { summary?: string | null; content?: string }, maxLength = 100): string {
  let text = '';
  
  if (post.summary && post.summary.trim()) {
    text = stripMarkdown(post.summary);
  } else if (post.content) {
    text = stripMarkdown(post.content);
  }

  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  
  return text;
}
