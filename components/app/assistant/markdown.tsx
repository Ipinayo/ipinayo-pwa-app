import type { Components } from "react-markdown";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders the assistant's Markdown text. Raw HTML is NOT rendered (react-markdown
 * default), so LLM output is safe; elements are mapped to compact, on-brand
 * styles since the app has no typography plugin. Links open in a new tab.
 */
const components: Components = {
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-4">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="bg-background/60 rounded px-1 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  ),
  a: ({ href, children }) => (
    <Link
      href={href ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="text-primary underline underline-offset-2"
    >
      {children}
    </Link>
  ),
};

export function Markdown({ children }: Readonly<{ children: string }>) {
  return (
    <div className="space-y-2 text-sm wrap-break-word">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
