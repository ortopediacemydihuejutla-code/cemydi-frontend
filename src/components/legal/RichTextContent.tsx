import type { ReactNode } from "react";
import sanitizeHtml from "sanitize-html";
import styles from "./legal-document.module.css";

const inlinePattern =
  /(\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\)|\*\*[^*]+\*\*|\+\+[^+]+\+\+|~~[^~]+~~|_[^_]+_)/g;

function renderInline(value: string): ReactNode[] {
  return value
    .split(inlinePattern)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("++") && part.endsWith("++")) {
        return <u key={index}>{part.slice(2, -2)}</u>;
      }
      if (part.startsWith("~~") && part.endsWith("~~")) {
        return <del key={index}>{part.slice(2, -2)}</del>;
      }
      if (part.startsWith("_") && part.endsWith("_")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }

      const link = part.match(
        /^\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)]+)\)$/,
      );
      if (link) {
        const external = link[2].startsWith("http");
        return (
          <a
            key={index}
            href={link[2]}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {link[1]}
          </a>
        );
      }

      return part;
    });
}

export function RichTextContent({ value }: { value: string }) {
  if (/<[a-z][\s\S]*>/i.test(value)) {
    const html = sanitizeHtml(value, {
      allowedTags: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "s",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "blockquote",
        "a",
        "hr",
      ],
      allowedAttributes: {
        a: ["href", "target", "rel"],
        p: ["style"],
        h2: ["style"],
        h3: ["style"],
      },
      allowedSchemes: ["http", "https", "mailto"],
      allowedStyles: {
        "*": {
          "text-align": [/^(left|center|right|justify)$/],
        },
      },
      transformTags: {
        a: sanitizeHtml.simpleTransform("a", {
          target: "_blank",
          rel: "noopener noreferrer",
        }),
      },
    });

    return (
      <div
        className={styles.richText}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const blocks = value.split(/\n\s*\n/).filter((block) => block.trim());

  return (
    <div className={styles.richText}>
      {blocks.map((block, index) => {
        const lines = block.split("\n").filter((line) => line.trim());

        if (lines.length === 1 && /^#{2,3}\s+/.test(lines[0])) {
          return (
            <h3 key={index}>
              {renderInline(lines[0].replace(/^#{2,3}\s+/, ""))}
            </h3>
          );
        }

        if (lines.length === 1 && /^---+$/.test(lines[0].trim())) {
          return <hr key={index} />;
        }

        if (lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={index}>
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  {renderInline(line.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((line) => /^\d+\.\s+/.test(line))) {
          return (
            <ol key={index}>
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  {renderInline(line.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        if (lines.every((line) => /^>\s?/.test(line))) {
          return (
            <blockquote key={index}>
              {renderInline(
                lines.map((line) => line.replace(/^>\s?/, "")).join("\n"),
              )}
            </blockquote>
          );
        }

        return <p key={index}>{renderInline(block)}</p>;
      })}
    </div>
  );
}
