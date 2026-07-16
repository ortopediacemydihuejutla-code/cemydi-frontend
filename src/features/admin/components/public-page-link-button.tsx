import { Eye } from "lucide-react";
import Link from "next/link";

import { Button } from "@/features/admin/components/ui/button";
import { cn } from "@/features/admin/lib/utils";

type PublicPageLinkButtonProps = {
  href: string;
  pageName?: string;
  className?: string;
};

export function PublicPageLinkButton({
  href,
  pageName = "la página pública",
  className,
}: PublicPageLinkButtonProps) {
  return (
    <Button asChild variant="outline" className={cn("min-w-32", className)}>
      <Link
        href={href}
        target="_blank"
        rel="noreferrer"
        title={`Abrir ${pageName} en una pestaña nueva`}
        aria-label={`Ver ${pageName} en una pestaña nueva`}
      >
        <Eye className="size-4" aria-hidden="true" />
        Ver página
      </Link>
    </Button>
  );
}
