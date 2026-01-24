// src/components/Breadcrumb.tsx

import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Home, ChevronLeft, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const location = useLocation();

  // canonical bez query stringa
  const canonicalUrl = `${window.location.origin}${location.pathname}`;

  // Mobile back target = zadnji item (prije last) koji ima href, fallback na prvi
  const backTarget =
    [...items].reverse().find((x, idx) => idx !== 0 && x.href) || items[0];

  const lastLabel = items[items.length - 1]?.label ?? "";

  // JSON-LD BreadcrumbList
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Početna",
        item: window.location.origin,
      },
      ...items.map((item, index) => {
        const isLast = index === items.length - 1;
        return {
          "@type": "ListItem",
          position: index + 2,
          name: item.label,
          item: item.href
            ? `${window.location.origin}${item.href}`
            : isLast
              ? canonicalUrl
              : undefined,
        };
      }),
    ],
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* MOBILE: compact back + current */}
      <nav aria-label="Breadcrumb" className={"sm:hidden mb-3 " + (className ?? "")}>
        <div className="flex items-center gap-2 min-w-0 text-left">
          <Link
            to={backTarget?.href || "/"}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label={`Nazad: ${backTarget?.label || "Početna"}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-medium leading-none">
              {backTarget?.label || "Početna"}
            </span>
          </Link>

          <span className="text-xs text-muted-foreground/70 shrink-0 leading-none">/</span>

          <span className="text-xs font-medium text-foreground truncate min-w-0 leading-none">
            {lastLabel}
          </span>
        </div>
      </nav>

      {/* DESKTOP+: full breadcrumb, LEFT aligned, no weird baseline issues */}
      <nav
        aria-label="Breadcrumb"
        className={"hidden sm:block mb-5 text-left " + (className ?? "")}
      >
        <div className="w-full bg-muted/30 rounded-xl px-4 py-2">
          <ol
            className="
              flex items-center justify-start gap-1.5
              text-sm text-muted-foreground
              flex-nowrap whitespace-nowrap
              overflow-x-auto
              [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
            "
          >
            {/* Home */}
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-background transition-colors"
                aria-label="Početna"
              >
                <Home className="w-4 h-4" />
                <span className="leading-none">Početna</span>
              </Link>
            </li>

            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li key={`${item.label}-${index}`} className="inline-flex items-center">
                  {/* Separator */}
                  <ChevronRight className="w-4 h-4 opacity-60 mx-1" aria-hidden="true" />

                  {/* Item */}
                  {item.href && !isLast ? (
                    <Link
                      to={item.href}
                      className="inline-flex items-center h-8 px-2 rounded-lg hover:bg-background transition-colors leading-none"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center h-8 px-2 font-medium text-foreground leading-none">
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
