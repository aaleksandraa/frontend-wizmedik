import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Baby, 
  Activity, 
  Heart, 
  Brain, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const healthCategories = [
  {
    id: 'zdravlje-djece',
    title: 'Zdravlje djece',
    description: 'Savjeti za rast i razvoj vaše djece',
    icon: Baby,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
    articles: '24 članka'
  },
  {
    id: 'dijabetes',
    title: 'Dijabetes',
    description: 'Kontrola šećera i zdrav način života',
    icon: Activity,
    color: 'from-cyan-500 to-cyan-500',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    articles: '18 članaka'
  },
  {
    id: 'visok-pritisak',
    title: 'Visok pritisak',
    description: 'Upravljanje krvnim pritiskom',
    icon: Heart,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    articles: '21 članak'
  },
  {
    id: 'psihicko-zdravlje',
    title: 'Psihičko zdravlje',
    description: 'Mentalno blagostanje i podrška',
    icon: Brain,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    articles: '32 članka'
  }
];

export function HealthTipsSection() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/blog?category=${categoryId}`);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Zdravstveni savjeti</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Istražite teme o zdravlju
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stručni savjeti i informacije za zdraviji život vas i vaše porodice
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {healthCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden h-full"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardContent className="p-6 relative">
                    {/* Background Gradient */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                    
                    {/* Icon */}
                    <div className={`${category.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${category.iconColor}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>

                    {/* Badge */}
                    <Badge variant="secondary" className="mb-4">
                      {category.articles}
                    </Badge>

                    {/* Arrow */}
                    <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Pročitaj više</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button 
            size="lg" 
            onClick={() => navigate('/blog')}
            className="group"
          >
            Pogledaj sve članke
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
}
