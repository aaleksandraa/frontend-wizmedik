import HomepageCustom3Cyan from "@/components/homepage-templates/HomepageCustom3Cyan";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://wizmedik.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/wizmedik-logo.png`;

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "WizMedik - Pronadite doktore u Bosni i Hercegovini",
  url: `${SITE_URL}/`,
  inLanguage: "bs",
  description:
    "Pronadite i zakazite termin kod doktora online u BiH. Uporedite profile doktora, klinika, laboratorija, banja i domova njege.",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      { "@type": "ListItem", position: 1, item: { "@id": `${SITE_URL}/doktori` } },
      { "@type": "ListItem", position: 2, item: { "@id": `${SITE_URL}/klinike` } },
      { "@type": "ListItem", position: 3, item: { "@id": `${SITE_URL}/laboratorije` } },
      { "@type": "ListItem", position: 4, item: { "@id": `${SITE_URL}/banje` } },
      { "@type": "ListItem", position: 5, item: { "@id": `${SITE_URL}/domovi-njega` } },
      { "@type": "ListItem", position: 6, item: { "@id": `${SITE_URL}/blog` } },
    ],
  },
};

/**
 * Homepage - Always uses Custom 3 Cyan template
 * Template selection has been removed for simplicity and consistency
 */
const Index = () => {
  // Homepage meta is defined here to avoid forcing homepage canonical on all SPA routes.
  return (
    <>
      <Helmet>
        <title>
          WizMedik - Pronadite doktore, klinike, banje, domove i laboratorije u Bosni i Hercegovini
        </title>
        <meta
          name="description"
          content="Pronadite i zakazite termin kod doktora online u BiH. Uporedite profile doktora, klinika, laboratorija, banja i domova njege."
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:title" content="WizMedik - Pronadite doktore u Bosni i Hercegovini" />
        <meta
          property="og:description"
          content="Vodeca platforma za pronalazenje doktora i online zakazivanje termina u BiH."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:site_name" content="WizMedik" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WizMedik - Pronadite doktore u BiH" />
        <meta
          name="twitter:description"
          content="Online zakazivanje termina kod doktora u Bosni i Hercegovini."
        />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(homeSchema)}</script>
      </Helmet>
      <HomepageCustom3Cyan />
    </>
  );
};

export default Index;
