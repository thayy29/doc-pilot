import ReactMarkdown from "react-markdown";
import Badge from "../Badge";
import { baseStyles, variantStyles } from "./styles";

type Variant = "user" | "assistant";

type Props = {
  variant: Variant;
  content: string;
  hasSources?: boolean;
  className?: string;
}

export default function ChatBubble({
  variant,
  content,
  hasSources = false,
  className
}: Props) {
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {variant === "assistant" ? (
        <article className="prose prose-sm dark:prose-invert max-w-none
          prose-headings:text-brand prose-headings:font-black prose-headings:text-sm prose-headings:mt-3 prose-headings:mb-1
          prose-strong:text-foreground prose-strong:font-black
          prose-code:rounded prose-code:bg-orange-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-orange-700 prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
          dark:prose-code:bg-orange-950 dark:prose-code:text-orange-300
          prose-pre:rounded-lg prose-pre:bg-[#1e1e2e] prose-pre:border prose-pre:border-border prose-pre:p-3 prose-pre:text-xs
          prose-li:text-foreground prose-li:marker:text-brand
          prose-a:text-brand prose-a:underline prose-a:decoration-brand/30 hover:prose-a:decoration-brand
          prose-p:text-foreground prose-p:leading-relaxed
          prose-blockquote:border-brand prose-blockquote:text-foreground-muted prose-blockquote:not-italic
        ">
          <ReactMarkdown
            components={{
              code: ({ className: codeClass, children, ...props }) => {
                const isBlock = codeClass?.startsWith("language-");
                if (isBlock) {
                  return (
                    <code className={`${codeClass} text-[#cdd6f4]`} {...props}>
                      {children}
                    </code>
                  );
                }
                return <code {...props}>{children}</code>;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      ) : (
        <p>{content}</p>
      )}

      {variant === "assistant" && hasSources && (
        <div className="mt-2">
          <Badge variant="info">Com fontes</Badge>
        </div>
      )}
    </div>
  );
}