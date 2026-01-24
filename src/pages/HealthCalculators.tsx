import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calculator, Activity, Apple, Flame, Baby, Scale, CalendarIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { format, addDays, differenceInDays, differenceInWeeks } from 'date-fns';
import { bs } from 'date-fns/locale';

export default function HealthCalculators() {
  return (
    <>
      <Helmet>
        <title>Zdravstveni Kalkulatori - BMI, Kalorije, Bazalni Metabolizam | WizMedik</title>
        <meta name="description" content="Besplatni zdravstveni kalkulatori: BMI indeks tjelesne mase, bazalni metabolizam, dnevne potrebe za kalorijama i proteinima, preporučeni unos zaštitnih materija, kalkulator termina porođaja." />
        <meta name="keywords" content="BMI kalkulator, indeks tjelesne mase, bazalni metabolizam, kalorije kalkulator, proteini kalkulator, termin porođaja, zdravstveni kalkulatori" />
        <link rel="canonical" href={`${window.location.origin}/kalkulatori`} />
      </Helmet>

      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Zdravstveni Kalkulatori</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pratite svoje zdravlje uz naše besplatne medicinske kalkulatore. Izračunajte BMI, bazalni metabolizam, 
              dnevne potrebe za kalorijama i proteinima, te termin porođaja.
            </p>
          </div>

          <Tabs defaultValue="bmi" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2">
              <TabsTrigger value="bmi" className="flex items-center gap-2 py-3">
                <Scale className="w-4 h-4" />
                <span className="hidden sm:inline">BMI</span>
              </TabsTrigger>
              <TabsTrigger value="bmr" className="flex items-center gap-2 py-3">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Bazalni Metabolizam</span>
              </TabsTrigger>
              <TabsTrigger value="nutrients" className="flex items-center gap-2 py-3">
                <Apple className="w-4 h-4" />
                <span className="hidden sm:inline">Zaštitne Materije</span>
              </TabsTrigger>
              <TabsTrigger value="calories" className="flex items-center gap-2 py-3">
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">Kalorije i Proteini</span>
              </TabsTrigger>
              <TabsTrigger value="pregnancy" className="flex items-center gap-2 py-3">
                <Baby className="w-4 h-4" />
                <span className="hidden sm:inline">Termin Porođaja</span>
              </TabsTrigger>
            </TabsList>

            {/* BMI Calculator */}
            <TabsContent value="bmi">
              <BMICalculator />
            </TabsContent>

            {/* BMR Calculator */}
            <TabsContent value="bmr">
              <BMRCalculator />
            </TabsContent>

            {/* Nutrients Calculator */}
            <TabsContent value="nutrients">
              <NutrientsCalculator />
            </TabsContent>

            {/* Calories Calculator */}
            <TabsContent value="calories">
              <CaloriesCalculator />
            </TabsContent>

            {/* Pregnancy Calculator */}
            <TabsContent value="pregnancy">
              <PregnancyCalculator />
            </TabsContent>
          </Tabs>

          {/* SEO Content */}
          <div className="mt-16 prose prose-slate max-w-none">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">O Zdravstvenim Kalkulatorima</h2>
                
                <div className="space-y-6 text-muted-foreground">
                  <p>
                    Naši zdravstveni kalkulatori su dizajnirani da vam pomognu u praćenju i razumijevanju vašeg zdravstvenog stanja. 
                    Svi kalkulatori koriste medicinski provjerene formule i standarde.
                  </p>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">BMI - Indeks Tjelesne Mase</h3>
                    <p>
                      BMI (Body Mass Index) je standardna mjera koja se koristi za procjenu da li je vaša tjelesna težina u zdravom rasponu 
                      u odnosu na vašu visinu. Izračunava se dijeljenjem težine u kilogramima sa kvadratom visine u metrima. 
                      Svjetska zdravstvena organizacija (WHO) koristi BMI kao ključni pokazatelj nutritivnog statusa.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Bazalni Metabolizam (BMR)</h3>
                    <p>
                      Bazalni metabolizam predstavlja količinu energije (kalorija) koju vaše tijelo troši u mirovanju za održavanje 
                      osnovnih životnih funkcija kao što su disanje, cirkulacija krvi i regulacija temperature. Poznavanje vašeg BMR-a 
                      pomaže u planiranju ishrane i programa vježbanja.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Preporučeni Dnevni Unos Zaštitnih Materija</h3>
                    <p>
                      Vitamini i minerali su esencijalni za pravilno funkcionisanje organizma. Naš kalkulator vam pomaže da odredite 
                      preporučeni dnevni unos vitamina C, D, kalcijuma, željeza i drugih važnih nutrijenata prema vašem uzrastu, 
                      polu i životnom stilu.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Dnevne Potrebe za Kalorijama i Proteinima</h3>
                    <p>
                      Ovaj kalkulator uzima u obzir vaš bazalni metabolizam i nivo fizičke aktivnosti da bi izračunao koliko kalorija 
                      i proteina trebate dnevno. Ovo je ključno za održavanje zdrave težine, gubitak ili dobijanje kilograma, 
                      kao i za sportske performanse.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Kalkulator Termina Porođaja</h3>
                    <p>
                      Kalkulator termina porođaja koristi datum posljednje menstruacije ili datum začeća da procijeni očekivani datum 
                      porođaja. Trudnoća obično traje 40 sedmica (280 dana) od prvog dana posljednje menstruacije. 
                      Ovaj alat pomaže budućim roditeljima da se pripreme za dolazak bebe.
                    </p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
                    <p className="text-sm">
                      <strong>Napomena:</strong> Ovi kalkulatori služe samo kao informativni alat i ne zamjenjuju profesionalni medicinski savjet. 
                      Za detaljnu procjenu vašeg zdravstvenog stanja i personalizirane preporuke, molimo konsultujte se sa vašim ljekarom.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

// BMI Calculator Component
function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [healthRisk, setHealthRisk] = useState('');

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    
    // Validation
    if (h <= 0 || h > 250) {
      alert('Molimo unesite validnu visinu (1-250 cm)');
      return;
    }
    if (w <= 0 || w > 300) {
      alert('Molimo unesite validnu težinu (1-300 kg)');
      return;
    }
    
    if (h > 0 && w > 0) {
      const heightInMeters = h / 100; // convert cm to m
      const bmiValue = w / (heightInMeters * heightInMeters);
      setBmi(parseFloat(bmiValue.toFixed(1)));
      
      // WHO classification
      if (bmiValue < 16) {
        setCategory('Teška pothranjenost');
        setHealthRisk('Visok rizik');
      } else if (bmiValue < 17) {
        setCategory('Umjerena pothranjenost');
        setHealthRisk('Umjeren rizik');
      } else if (bmiValue < 18.5) {
        setCategory('Blaga pothranjenost');
        setHealthRisk('Nizak rizik');
      } else if (bmiValue < 25) {
        setCategory('Normalna težina');
        setHealthRisk('Minimalan rizik');
      } else if (bmiValue < 30) {
        setCategory('Prekomjerna težina');
        setHealthRisk('Povećan rizik');
      } else if (bmiValue < 35) {
        setCategory('Gojaznost I stepena');
        setHealthRisk('Umjeren rizik');
      } else if (bmiValue < 40) {
        setCategory('Gojaznost II stepena');
        setHealthRisk('Visok rizik');
      } else {
        setCategory('Gojaznost III stepena');
        setHealthRisk('Vrlo visok rizik');
      }
    }
  };

  const getBMIColor = (bmiValue: number) => {
    if (bmiValue < 18.5) return 'text-blue-600 dark:text-blue-400';
    if (bmiValue < 25) return 'text-green-600 dark:text-green-400';
    if (bmiValue < 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          BMI - Indeks Tjelesne Mase
        </CardTitle>
        <CardDescription>
          Izračunajte svoj indeks tjelesne mase prema WHO standardima
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Visina (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="npr. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="1"
              max="250"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Težina (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="npr. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="1"
              max="300"
              step="0.1"
            />
          </div>
        </div>

        <Button onClick={calculateBMI} className="w-full" size="lg">
          Izračunaj BMI
        </Button>

        {bmi !== null && (
          <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">Vaš BMI</p>
              <p className={`text-5xl font-bold mb-2 ${getBMIColor(bmi)}`}>{bmi}</p>
              <p className="text-xl font-semibold">{category}</p>
              <p className="text-sm text-muted-foreground mt-1">{healthRisk}</p>
            </div>
            
            <div className="mt-6 space-y-2 text-sm">
              <p className="font-semibold mb-3">WHO Klasifikacija BMI:</p>
              <div className="flex justify-between p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                <span>Pothranjenost</span>
                <span className="font-semibold">&lt; 18.5</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-green-50 dark:bg-green-950/20">
                <span>Normalna težina</span>
                <span className="font-semibold">18.5 - 24.9</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-yellow-50 dark:bg-yellow-950/20">
                <span>Prekomjerna težina</span>
                <span className="font-semibold">25.0 - 29.9</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-orange-50 dark:bg-orange-950/20">
                <span>Gojaznost I stepena</span>
                <span className="font-semibold">30.0 - 34.9</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-red-50 dark:bg-red-950/20">
                <span>Gojaznost II stepena</span>
                <span className="font-semibold">35.0 - 39.9</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-red-100 dark:bg-red-950/40">
                <span>Gojaznost III stepena</span>
                <span className="font-semibold">≥ 40.0</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// BMR Calculator Component
function BMRCalculator() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmr, setBmr] = useState<number | null>(null);

  const calculateBMR = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    // Validation
    if (w <= 0 || w > 300) {
      alert('Molimo unesite validnu težinu (1-300 kg)');
      return;
    }
    if (h <= 0 || h > 250) {
      alert('Molimo unesite validnu visinu (1-250 cm)');
      return;
    }
    if (a <= 0 || a > 120) {
      alert('Molimo unesite validnu starost (1-120 godina)');
      return;
    }
    
    if (w > 0 && h > 0 && a > 0) {
      let bmrValue;
      if (gender === 'male') {
        // Mifflin-St Jeor formula for men: BMR = 10W + 6.25H - 5A + 5
        bmrValue = 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        // Mifflin-St Jeor formula for women: BMR = 10W + 6.25H - 5A - 161
        bmrValue = 10 * w + 6.25 * h - 5 * a - 161;
      }
      setBmr(Math.round(bmrValue));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Bazalni Metabolizam (BMR)
        </CardTitle>
        <CardDescription>
          Izračunajte koliko kalorija vaše tijelo troši u mirovanju (Mifflin-St Jeor formula)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bmr-age">Starost (godine)</Label>
            <Input
              id="bmr-age"
              type="number"
              placeholder="npr. 30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="1"
              max="120"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-gender">Spol</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="bmr-gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Muško</SelectItem>
                <SelectItem value="female">Žensko</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-height">Visina (cm)</Label>
            <Input
              id="bmr-height"
              type="number"
              placeholder="npr. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="1"
              max="250"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-weight">Težina (kg)</Label>
            <Input
              id="bmr-weight"
              type="number"
              placeholder="npr. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="1"
              max="300"
            />
          </div>
        </div>

        <Button onClick={calculateBMR} className="w-full" size="lg">
          Izračunaj BMR
        </Button>

        {bmr !== null && (
          <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">Vaš Bazalni Metabolizam</p>
              <p className="text-5xl font-bold text-primary mb-1">{bmr}</p>
              <p className="text-lg text-muted-foreground">kalorija/dan</p>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Ovo je broj kalorija koje vaše tijelo troši u potpunom mirovanju za održavanje osnovnih funkcija 
                (disanje, cirkulacija, regulacija temperature).
              </p>
              <p className="font-semibold">Ukupne dnevne potrebe (TDEE) prema aktivnosti:</p>
              <div className="space-y-1 pl-4">
                <p>• Sjedilački (1.2): <strong>{Math.round(bmr * 1.2)} kcal</strong></p>
                <p>• Lagana aktivnost (1.375): <strong>{Math.round(bmr * 1.375)} kcal</strong></p>
                <p>• Umjerena aktivnost (1.55): <strong>{Math.round(bmr * 1.55)} kcal</strong></p>
                <p>• Visoka aktivnost (1.725): <strong>{Math.round(bmr * 1.725)} kcal</strong></p>
                <p>• Ekstremna aktivnost (1.9): <strong>{Math.round(bmr * 1.9)} kcal</strong></p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Nutrients Calculator Component
function NutrientsCalculator() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [pregnant, setPregnant] = useState('no');
  const [nutrients, setNutrients] = useState<any>(null);

  const calculateNutrients = () => {
    const ageNum = parseFloat(age);
    if (ageNum > 0) {
      const isPregnant = pregnant === 'yes';
      const isMale = gender === 'male';
      
      setNutrients({
        vitaminC: isMale ? 90 : (isPregnant ? 85 : 75),
        vitaminD: ageNum > 70 ? 20 : 15,
        calcium: ageNum > 50 ? 1200 : 1000,
        iron: isMale ? 8 : (isPregnant ? 27 : (ageNum > 50 ? 8 : 18)),
        vitaminB12: 2.4,
        folate: isPregnant ? 600 : 400,
        magnesium: isMale ? 400 : 310,
        zinc: isMale ? 11 : 8,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Apple className="w-5 h-5" />
          Preporučeni Dnevni Unos Zaštitnih Materija
        </CardTitle>
        <CardDescription>
          Saznajte koliko vitamina i minerala trebate dnevno
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nut-age">Starost (godine)</Label>
            <Input
              id="nut-age"
              type="number"
              placeholder="npr. 30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nut-gender">Spol</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="nut-gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Muško</SelectItem>
                <SelectItem value="female">Žensko</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {gender === 'female' && (
            <div className="space-y-2">
              <Label htmlFor="nut-pregnant">Trudnoća</Label>
              <Select value={pregnant} onValueChange={setPregnant}>
                <SelectTrigger id="nut-pregnant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Ne</SelectItem>
                  <SelectItem value="yes">Da</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button onClick={calculateNutrients} className="w-full" size="lg">
          Izračunaj Potrebe
        </Button>

        {nutrients && (
          <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
            <h3 className="font-semibold mb-4 text-center">Preporučeni Dnevni Unos</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex justify-between p-3 rounded bg-background">
                <span>Vitamin C</span>
                <span className="font-semibold">{nutrients.vitaminC} mg</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-background">
                <span>Vitamin D</span>
                <span className="font-semibold">{nutrients.vitaminD} μg</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-background">
                <span>Kalcijum</span>
                <span className="font-semibold">{nutrients.calcium} mg</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-background">
                <span>Željezo</span>
                <span className="font-semibold">{nutrients.iron} mg</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-background">
                <span>Vitamin B12</span>
                <span className="font-semibold">{nutrients.vitaminB12} μg</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-background">
                <span>Folna kiselina</span>
                <span className="font-semibold">{nutrients.folate} μg</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-background">
                <span>Magnezijum</span>
                <span className="font-semibold">{nutrients.magnesium} mg</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-background">
                <span>Cink</span>
                <span className="font-semibold">{nutrients.zinc} mg</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Ove vrijednosti su opšte preporuke. Konsultujte se sa ljekarom za personalizirane savjete.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Calories Calculator Component
function CaloriesCalculator() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('1.375');
  const [goal, setGoal] = useState('maintain');
  const [results, setResults] = useState<any>(null);

  const calculateCalories = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    const activityLevel = parseFloat(activity);
    
    // Validation
    if (w <= 0 || w > 300) {
      alert('Molimo unesite validnu težinu (1-300 kg)');
      return;
    }
    if (h <= 0 || h > 250) {
      alert('Molimo unesite validnu visinu (1-250 cm)');
      return;
    }
    if (a <= 0 || a > 120) {
      alert('Molimo unesite validnu starost (1-120 godina)');
      return;
    }
    
    if (w > 0 && h > 0 && a > 0) {
      // Calculate BMR using Mifflin-St Jeor
      let bmr;
      if (gender === 'male') {
        bmr = 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        bmr = 10 * w + 6.25 * h - 5 * a - 161;
      }
      
      // Calculate TDEE (Total Daily Energy Expenditure)
      let tdee = bmr * activityLevel;
      
      // Adjust based on goal
      let targetCalories = tdee;
      let deficit = 0;
      if (goal === 'lose') {
        deficit = 500;
        targetCalories = tdee - deficit; // 500 cal deficit for ~0.5kg/week loss
      } else if (goal === 'gain') {
        deficit = -500;
        targetCalories = tdee + 500; // 500 cal surplus for ~0.5kg/week gain
      }
      
      // Calculate protein needs
      // For weight loss: 2.0-2.4g/kg
      // For maintenance: 1.6-2.0g/kg  
      // For muscle gain: 1.8-2.2g/kg
      let proteinMin, proteinMax;
      if (goal === 'lose') {
        proteinMin = Math.round(w * 2.0);
        proteinMax = Math.round(w * 2.4);
      } else if (goal === 'gain') {
        proteinMin = Math.round(w * 1.8);
        proteinMax = Math.round(w * 2.2);
      } else {
        proteinMin = Math.round(w * 1.6);
        proteinMax = Math.round(w * 2.0);
      }
      
      // Calculate macros
      // Protein: 4 kcal/g
      // Carbs: 4 kcal/g
      // Fats: 9 kcal/g
      const proteinCalories = ((proteinMin + proteinMax) / 2) * 4;
      const fatCalories = targetCalories * 0.25; // 25% from fats
      const carbCalories = targetCalories - proteinCalories - fatCalories;
      
      setResults({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        deficit,
        proteinMin,
        proteinMax,
        carbs: Math.round(carbCalories / 4),
        fats: Math.round(fatCalories / 9),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5" />
          Dnevne Potrebe za Kalorijama i Proteinima
        </CardTitle>
        <CardDescription>
          Izračunajte koliko kalorija i proteina trebate dnevno prema vašim ciljevima
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cal-age">Starost (godine)</Label>
            <Input
              id="cal-age"
              type="number"
              placeholder="npr. 30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="1"
              max="120"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cal-gender">Spol</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="cal-gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Muško</SelectItem>
                <SelectItem value="female">Žensko</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cal-height">Visina (cm)</Label>
            <Input
              id="cal-height"
              type="number"
              placeholder="npr. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="1"
              max="250"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cal-weight">Težina (kg)</Label>
            <Input
              id="cal-weight"
              type="number"
              placeholder="npr. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="1"
              max="300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cal-activity">Nivo Aktivnosti</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger id="cal-activity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.2">Sjedilački (bez vježbanja)</SelectItem>
                <SelectItem value="1.375">Lagana aktivnost (1-3 dana/sedmično)</SelectItem>
                <SelectItem value="1.55">Umjerena aktivnost (3-5 dana/sedmično)</SelectItem>
                <SelectItem value="1.725">Visoka aktivnost (6-7 dana/sedmično)</SelectItem>
                <SelectItem value="1.9">Ekstremna aktivnost (2x dnevno)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cal-goal">Cilj</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger id="cal-goal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">Gubitak težine (-0.5kg/sedmično)</SelectItem>
                <SelectItem value="maintain">Održavanje težine</SelectItem>
                <SelectItem value="gain">Dobijanje težine (+0.5kg/sedmično)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculateCalories} className="w-full" size="lg">
          Izračunaj Potrebe
        </Button>

        {results && (
          <div className="space-y-4">
            <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Dnevne Potrebe za Kalorijama</p>
                <p className="text-5xl font-bold text-primary mb-1">{results.targetCalories}</p>
                <p className="text-lg text-muted-foreground">kalorija/dan</p>
                {results.deficit !== 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    ({results.deficit > 0 ? '-' : '+'}{Math.abs(results.deficit)} kcal od održavanja)
                  </p>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded bg-background">
                  <p className="text-sm text-muted-foreground">BMR (Bazalni Metabolizam)</p>
                  <p className="text-2xl font-bold">{results.bmr} kcal</p>
                </div>
                <div className="p-3 rounded bg-background">
                  <p className="text-sm text-muted-foreground">TDEE (Ukupna Potrošnja)</p>
                  <p className="text-2xl font-bold">{results.tdee} kcal</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border-2 border-green-200 dark:border-green-900">
              <h3 className="font-semibold mb-4 text-center">Preporučeni Makronutrijenti</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded bg-background">
                  <span>Proteini</span>
                  <span className="font-semibold">{results.proteinMin}-{results.proteinMax}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-background">
                  <span>Ugljeni hidrati</span>
                  <span className="font-semibold">{results.carbs}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-background">
                  <span>Masti</span>
                  <span className="font-semibold">{results.fats}g</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Ove vrijednosti su preporuke za aktivne osobe. Konsultujte nutricionistu za personalizirani plan.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Pregnancy Calculator Component
function PregnancyCalculator() {
  const [lastPeriod, setLastPeriod] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [weeksPregnant, setWeeksPregnant] = useState<number | null>(null);
  const [daysPregnant, setDaysPregnant] = useState<number | null>(null);
  const [trimester, setTrimester] = useState('');

  const calculateDueDate = () => {
    if (lastPeriod) {
      // Naegele's rule: LMP + 280 days (40 weeks)
      const due = addDays(lastPeriod, 280);
      setDueDate(due);
      
      // Calculate weeks and days pregnant
      const today = new Date();
      const totalDays = differenceInDays(today, lastPeriod);
      const weeks = Math.floor(totalDays / 7);
      const days = totalDays % 7;
      
      setWeeksPregnant(weeks);
      setDaysPregnant(days);
      
      // Determine trimester
      if (weeks < 13) {
        setTrimester('Prvi trimester (1-12 sedmica)');
      } else if (weeks < 27) {
        setTrimester('Drugi trimester (13-26 sedmica)');
      } else {
        setTrimester('Treći trimester (27-40 sedmica)');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="w-5 h-5" />
          Kalkulator Termina Porođaja
        </CardTitle>
        <CardDescription>
          Izračunajte očekivani datum porođaja na osnovu posljednje menstruacije
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Prvi Dan Posljednje Menstruacije</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {lastPeriod ? format(lastPeriod, 'dd.MM.yyyy.') : 'Odaberite datum'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={lastPeriod}
                onSelect={setLastPeriod}
                initialFocus
                locale={bs}
                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={calculateDueDate} className="w-full" size="lg" disabled={!lastPeriod}>
          Izračunaj Termin
        </Button>

        {dueDate && weeksPregnant !== null && daysPregnant !== null && (
          <div className="bg-pink-50 dark:bg-pink-950/20 p-6 rounded-lg border-2 border-pink-200 dark:border-pink-900">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">Očekivani Datum Porođaja</p>
              <p className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-4">
                {format(dueDate, 'dd. MMMM yyyy.', { locale: bs })}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded bg-background text-center">
                <p className="text-sm text-muted-foreground mb-1">Trudnoća</p>
                <p className="text-3xl font-bold">{weeksPregnant}+{daysPregnant}</p>
                <p className="text-xs text-muted-foreground mt-1">sedmica + dana</p>
              </div>
              <div className="p-4 rounded bg-background text-center">
                <p className="text-sm text-muted-foreground mb-1">Trimester</p>
                <p className="text-lg font-semibold">{trimester}</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-background rounded">
              <p className="text-sm text-muted-foreground">
                <strong>Napomena:</strong> Ovo je procjena zasnovana na Naegele pravilu (prosječna trudnoća od 40 sedmica). 
                Samo 5% beba se rodi na tačan datum. Većina beba se rodi između 38. i 42. sedmice trudnoće. 
                Uvijek konsultujte vašeg ginekologa za tačnije informacije.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
