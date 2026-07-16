"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";

type RichTextEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
};

export function RichTextEditor({
  id,
  value,
  onChange,
  disabled,
  maxLength = 50000,
  placeholder = "Escribe el contenido de esta sección...",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        class:
          "tiptap-editor-content min-h-64 px-5 py-4 text-sm leading-7 text-foreground outline-none [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:bg-muted/50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-7 [&_p]:my-2 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-7",
        "aria-label": "Editor de contenido enriquecido",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const nextValue = currentEditor.isEmpty ? "" : currentEditor.getHTML();
      if (nextValue.length <= maxLength) onChange(nextValue);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (current !== value)
      editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return <div className="min-h-64 animate-pulse rounded-xl bg-muted" />;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(
      "Dirección del enlace",
      previousUrl ?? "https://",
    );
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  const buttonClass = (active = false) =>
    `flex size-9 min-h-0 min-w-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
    }`;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/45 p-2">
        <button
          type="button"
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={disabled}
          title="Título grande"
          aria-label="Título grande"
        >
          <Heading2 className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass(editor.isActive("heading", { level: 3 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={disabled}
          title="Subtítulo"
          aria-label="Subtítulo"
        >
          <Heading3 className="size-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
        <button
          type="button"
          className={buttonClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          title="Negritas"
          aria-label="Negritas"
        >
          <Bold className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          title="Cursivas"
          aria-label="Cursivas"
        >
          <Italic className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass(editor.isActive("underline"))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          title="Subrayado"
          aria-label="Subrayado"
        >
          <UnderlineIcon className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass(editor.isActive("strike"))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={disabled}
          title="Tachado"
          aria-label="Tachado"
        >
          <Strikethrough className="size-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
        <button
          type="button"
          className={buttonClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          title="Lista con viñetas"
          aria-label="Lista con viñetas"
        >
          <List className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          title="Lista numerada"
          aria-label="Lista numerada"
        >
          <ListOrdered className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass(editor.isActive("blockquote"))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          title="Cita"
          aria-label="Cita"
        >
          <Quote className="size-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
        <button
          type="button"
          className={buttonClass(editor.isActive({ textAlign: "left" }))}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          disabled={disabled}
          title="Alinear a la izquierda"
          aria-label="Alinear a la izquierda"
        >
          <AlignLeft className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass(editor.isActive({ textAlign: "center" }))}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          disabled={disabled}
          title="Centrar"
          aria-label="Centrar"
        >
          <AlignCenter className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass(editor.isActive({ textAlign: "justify" }))}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          disabled={disabled}
          title="Justificar"
          aria-label="Justificar"
        >
          <AlignJustify className="size-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
        <button
          type="button"
          className={buttonClass(editor.isActive("link"))}
          onClick={setLink}
          disabled={disabled}
          title="Agregar enlace"
          aria-label="Agregar enlace"
        >
          <LinkIcon className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass()}
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={disabled || !editor.isActive("link")}
          title="Quitar enlace"
          aria-label="Quitar enlace"
        >
          <Unlink className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass()}
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          disabled={disabled}
          title="Limpiar formato"
          aria-label="Limpiar formato"
        >
          <RemoveFormatting className="size-4" />
        </button>
        <span className="ml-auto flex items-center gap-1 pl-2">
          <button
            type="button"
            className={buttonClass()}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().undo()}
            title="Deshacer"
            aria-label="Deshacer"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            className={buttonClass()}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().redo()}
            title="Rehacer"
            aria-label="Rehacer"
          >
            <Redo2 className="size-4" />
          </button>
        </span>
      </div>
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between border-t border-border bg-muted/25 px-4 py-2 text-[11px] text-muted-foreground">
        <span>Selecciona texto para aplicar formato.</span>
        <span>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
