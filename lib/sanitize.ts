import "server-only";

import sanitizeHtml from "sanitize-html";

/**
 * Sanitize comment/discussion HTML down to the marks the editor can produce:
 * paragraphs, line breaks, bold/italic/underline, and mention spans (identified
 * by their `data-*` attributes only — no class/style/handlers/links survive).
 * This is the canonical write-time cleanse, so stored HTML is always safe to
 * render. Uses `sanitize-html` (pure JS, htmlparser2) — no jsdom, so it runs
 * cleanly in serverless.
 */
export function sanitizeCommentHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "em", "u", "span"],
    allowedAttributes: { span: ["data-type", "data-id", "data-label"] },
    // Drop disallowed tags but keep their text; no schemes/links permitted.
    disallowedTagsMode: "discard",
  });
}

/** Visible-text length of HTML (all tags stripped) — for server-side min/max
 *  validation of the content the reader actually sees. */
export function htmlTextLength(html: string): number {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  return text.replace(/\s+/g, " ").trim().length;
}
