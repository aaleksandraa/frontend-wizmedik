import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Početna",
        "item": window.location.origin
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.href ? `${window.location.origin}${item.href}` : undefined
      }))
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <nav aria-label="Breadcrumb" className="mb-6 bg-muted/30 rounded-lg px-4 py-3">
        <ol className="flex items-center gap-1 text-sm flex-wrap">
          {/* Home */}
          <li>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-background"
            >
              <Home className="w-4 h-4" />
              <span>Početna</span>
            </Link>
          </li>
          
          {/* Items */}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={index} className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                {item.href && !isLast ? (
                  <Link 
                    to={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-background"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground px-2 py-1">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
