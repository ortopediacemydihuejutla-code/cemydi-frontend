import {
  BadgeDollarSign,
  PackageCheck,
  PackageSearch,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/features/admin/components/ui/badge";
import type { ProductClusterCode } from "@/data/product-clusters";
import { productClusterDefinitions } from "@/data/product-clusters";

const clusterVisuals: Record<
  ProductClusterCode,
  { icon: LucideIcon; badge: "blue" | "violet" | "emerald" | "amber"; iconClass: string }
> = {
  C1: {
    icon: RefreshCcw,
    badge: "blue",
    iconClass: "bg-sky-500/12 text-sky-700 dark:text-sky-200",
  },
  C2: {
    icon: BadgeDollarSign,
    badge: "violet",
    iconClass: "bg-violet-500/12 text-violet-700 dark:text-violet-200",
  },
  C3: {
    icon: PackageCheck,
    badge: "emerald",
    iconClass: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-200",
  },
  C4: {
    icon: PackageSearch,
    badge: "amber",
    iconClass: "bg-amber-500/12 text-amber-700 dark:text-amber-200",
  },
};

export function ProductClusterSummary({
  counts,
}: {
  counts: Record<ProductClusterCode, number>;
}) {
  return (
    <section aria-labelledby="cluster-summary-title" className="space-y-4">
      <div>
        <h2 id="cluster-summary-title" className="text-lg font-semibold text-foreground">
          Resumen de segmentos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Distribución comercial y prioridad operativa por grupo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(productClusterDefinitions) as ProductClusterCode[]).map((code) => {
          const cluster = productClusterDefinitions[code];
          const visual = clusterVisuals[code];
          const Icon = visual.icon;

          return (
            <article
              key={code}
              className="flex min-h-56 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`grid size-10 place-items-center rounded-xl ${visual.iconClass}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <Badge variant={visual.badge}>{code}</Badge>
              </div>

              <div className="mt-5 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight text-foreground">
                    {counts[code]}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    productos
                  </span>
                </div>
                <h3 className="mt-3 font-semibold leading-snug text-foreground">{cluster.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {cluster.description}
                </p>
              </div>

              <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-foreground">
                <span className="font-semibold">Acción:</span> {cluster.action}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
