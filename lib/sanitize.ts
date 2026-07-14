import "server-only";

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize comment/discussion HTML down to the marks the editor can produce:
 * paragraphs, line breaks, bold/italic/underline, and mention spans (identified
 * by their `data-*` attributes only — no class/style/handlers survive). This is
 * the canonical write-time cleanse, so stored HTML is always safe to render.
 */
export function sanitizeCommentHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "span"],
    ALLOWED_ATTR: ["data-type", "data-id", "data-label"],
    ALLOW_DATA_ATTR: false,
  });
}

/** Plain-text length of HTML (tags stripped, entities decoded roughly) — for
 *  server-side min/max validation of the visible content. */
export function htmlTextLength(html: string): number {
  const text = DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return text.replace(/\s+/g, " ").trim().length;
}
