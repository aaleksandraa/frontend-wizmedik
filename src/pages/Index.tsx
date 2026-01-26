import { useHomepageData } from "@/hooks/useHomepageData";
import { HomepageSoft } from "@/components/homepage-templates/HomepageSoft";
import { HomepageClean } from "@/components/homepage-templates/HomepageClean";
import { HomepageZocdoc } from "@/components/homepage-templates/HomepageZocdoc";
import HomepageZocDocBiH from "@/components/homepage-templates/HomepageZocDocBiH";
import { HomepageWarm } from "@/components/homepage-templates/HomepageWarm";
import { HomepageOcean } from "@/components/homepage-templates/HomepageOcean";
import { HomepageLime } from "@/components/homepage-templates/HomepageLime";
import { HomepageTeal } from "@/components/homepage-templates/HomepageTeal";
import { HomepageRose } from "@/components/homepage-templates/HomepageRose";
import { HomepageSunset } from "@/components/homepage-templates/HomepageSunset";
import { HomepageMinimal } from "@/components/homepage-templates/HomepageMinimal";
import { HomepageBold } from "@/components/homepage-templates/HomepageBold";
import { HomepageCards } from "@/components/homepage-templates/HomepageCards";
import HomepageCustom from "@/components/homepage-templates/HomepageCustom";
import { HomepageMedical } from "@/components/homepage-templates/HomepageMedical";
import { HomepageModern } from "@/components/homepage-templates/HomepageModern";
import { HomepagePro } from "@/components/homepage-templates/HomepagePro";
import HomepageCustom2Cyan from "@/components/homepage-templates/HomepageCustom2Cyan";
import HomepageCustom2Yellow from "@/components/homepage-templates/HomepageCustom2Yellow";
import HomepageCustom3Cyan from "@/components/homepage-templates/HomepageCustom3Cyan";

const homepageTemplates: Record<string, React.ComponentType> = {
  soft: HomepageSoft,
  clean: HomepageClean,
  custom: HomepageCustom,
  'custom2-cyan': HomepageCustom2Cyan,
  'custom2-yellow': HomepageCustom2Yellow,
  'custom3-cyan': HomepageCustom3Cyan,
  medical: HomepageMedical,
  modern: HomepageModern,
  pro: HomepagePro,
  zocdoc: HomepageZocdoc,
  'zocdoc-bih': HomepageZocDocBiH,
  warm: HomepageWarm,
  ocean: HomepageOcean,
  lime: HomepageLime,
  teal: HomepageTeal,
  rose: HomepageRose,
  sunset: HomepageSunset,
  minimal: HomepageMinimal,
  bold: HomepageBold,
  cards: HomepageCards,
};

const Index = () => {
  const { data, loading } = useHomepageData();

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Debug log to see what template is being loaded
  console.log('Homepage template:', data.settings.homepage_template);
  console.log('Available templates:', Object.keys(homepageTemplates));

  // Default to custom2-cyan if no template is set or template not found
  const templateName = data.settings.homepage_template || 'custom2-cyan';
  const TemplateComponent = homepageTemplates[templateName] || homepageTemplates['custom2-cyan'];
  
  if (TemplateComponent) {
    return <TemplateComponent />;
  }

  // This should never happen now, but keep as ultimate fallback
  console.error('No template found, using custom2-cyan as fallback');
  return <HomepageCustom2Cyan />;
};

export default Index;
