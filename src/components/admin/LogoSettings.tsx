import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Type, Loader2, Eye, Heart } from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface LogoSettings {
  logo_url: string | null;
  logo_enabled: boolean;
  logo_type: 'image' | 'text';
  footer_logo_url: string | null;
  footer_logo_enabled: boolean;
  footer_logo_type: 'image' | 'text';
  show_heart_icon: boolean;
  show_heart_icon_header: boolean;
  logo_height_desktop: number;
  logo_height_mobile: number;
  footer_logo_height_desktop: number;
  footer_logo_height_mobile: number;
}

export function LogoSettings() {
  const [settings, setSettings] = useState<LogoSettings>({
    logo_url: null,
    logo_enabled: true,
    logo_type: 'text',
    footer_logo_url: null,
    footer_logo_enabled: true,
    footer_logo_type: 'text',
    show_heart_icon: true,
    show_heart_icon_header: true,
    logo_height_desktop: 70,
    logo_height_mobile: 50,
    footer_logo_height_desktop: 70,
    footer_logo_height_mobile: 50,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [footerPreviewUrl, setFooterPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const footerFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/admin/logo-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(response.data);
      setPreviewUrl(response.data.logo_url);
      setFooterPreviewUrl(response.data.footer_logo_url);
    } catch (error) {
      console.error('Error fetching logo settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Greška',
        description: 'Molimo odaberite sliku (PNG, JPG, SVG)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Greška',
        description: 'Slika ne smije biti veća od 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);  // Changed from 'file' to 'image'
      formData.append('folder', 'logos');

      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_URL}/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const logoUrl = response.data.url;
      setPreviewUrl(logoUrl);
      setSettings((prev) => ({ ...prev, logo_url: logoUrl, logo_type: 'image' }));

      toast({
        title: 'Uspjeh',
        description: 'Logo uploadovan. Kliknite "Sačuvaj" da primijenite promjene.',
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Nije moguće uploadovati logo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    setSettings((prev) => ({ ...prev, logo_url: null, logo_type: 'text' }));
  };
  
  const handleFooterFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Greška',
        description: 'Molimo odaberite sliku (PNG, JPG, SVG)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Greška',
        description: 'Slika ne smije biti veća od 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'logos');

      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_URL}/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const logoUrl = response.data.url;
      setFooterPreviewUrl(logoUrl);
      setSettings((prev) => ({ ...prev, footer_logo_url: logoUrl, footer_logo_type: 'image' }));

      toast({
        title: 'Uspjeh',
        description: 'Footer logo uploadovan. Kliknite "Sačuvaj" da primijenite promjene.',
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Nije moguće uploadovati logo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFooterLogo = () => {
    setFooterPreviewUrl(null);
    setSettings((prev) => ({ ...prev, footer_logo_url: null, footer_logo_type: 'text' }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API_URL}/admin/logo-settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: 'Uspjeh',
        description: 'Logo postavke sačuvane',
      });

      // Reload page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Nije moguće sačuvati postavke',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo Postavke</CardTitle>
        <CardDescription>
          Upravljajte logotipom koji se prikazuje na sajtu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Logo */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="logo-enabled">Prikaži Logo</Label>
            <p className="text-sm text-muted-foreground">
              Omogući ili onemogući prikaz logotipa
            </p>
          </div>
          <Switch
            id="logo-enabled"
            checked={settings.logo_enabled}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, logo_enabled: checked }))
            }
          />
        </div>

        {settings.logo_enabled && (
          <>
            {/* Logo Type Selection */}
            <div className="space-y-3">
              <Label>Tip Logotipa</Label>
              <RadioGroup
                value={settings.logo_type}
                onValueChange={(value: 'image' | 'text') =>
                  setSettings((prev) => ({ ...prev, logo_type: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="type-text" />
                  <Label htmlFor="type-text" className="font-normal cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      <span>Tekstualni Logo (Animirani)</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="type-image" />
                  <Label htmlFor="type-image" className="font-normal cursor-pointer">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Slika Logotipa</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Heart Icon Toggle for Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-heart-icon-header">Prikaži Srce Ikonu u Hederu</Label>
                <p className="text-sm text-muted-foreground">
                  Prikaži srce ikonu prije logotipa u hederu
                </p>
              </div>
              <Switch
                id="show-heart-icon-header"
                checked={settings.show_heart_icon_header}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, show_heart_icon_header: checked }))
                }
              />
            </div>

            {/* Logo Height Controls */}
            <div className="space-y-4 p-4 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-semibold text-cyan-900 dark:text-cyan-100">Visina Logotipa</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-height-desktop">Desktop (px)</Label>
                  <input
                    id="logo-height-desktop"
                    type="number"
                    min="20"
                    max="200"
                    value={settings.logo_height_desktop}
                    onChange={(e) => setSettings((prev) => ({ ...prev, logo_height_desktop: parseInt(e.target.value) || 70 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-xs text-muted-foreground">Preporučeno: 60-80px</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo-height-mobile">Mobilni (px)</Label>
                  <input
                    id="logo-height-mobile"
                    type="number"
                    min="20"
                    max="200"
                    value={settings.logo_height_mobile}
                    onChange={(e) => setSettings((prev) => ({ ...prev, logo_height_mobile: parseInt(e.target.value) || 50 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-xs text-muted-foreground">Preporučeno: 40-60px</p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Pregled
              </Label>
              <div className="border rounded-lg p-6 bg-muted/30 flex items-center justify-center min-h-[120px]">
                <div className="flex items-center gap-3">
                  {settings.show_heart_icon_header && (
                    <div className="p-2 rounded-xl bg-[rgb(8,145,178)]/10">
                      <Heart className="h-8 w-8" style={{ color: 'rgb(8, 145, 178)' }} />
                    </div>
                  )}
                  {settings.logo_type === 'text' ? (
                    <AnimatedLogo size="lg" />
                  ) : previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Logo"
                        style={{
                          height: '70px',
                          width: 'auto',
                          objectFit: 'contain'
                        }}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={handleRemoveLogo}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nema uploadovanog logotipa</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Image (only if image type selected) */}
            {settings.logo_type === 'image' && (
              <div className="space-y-3">
                <Label>Upload Logo Slike</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploadovanje...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Odaberi Sliku
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Visina: 70px (širina proporcionalna). Max 2MB. Format: PNG, JPG, SVG, WebP
                </p>
              </div>
            )}

            {/* Info about text logo */}
            {settings.logo_type === 'text' && (
              <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Type className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                      Animirani Tekstualni Logo
                    </p>
                    <p className="text-xs text-cyan-700 dark:text-cyan-300">
                      "Wiz" je cyan boje sa shimmer efektom, "Medik" je tamno sive boje.
                      Logo ima hover animaciju sa glow efektom i sparkle česticama.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Divider */}
        <div className="border-t" />

        {/* Footer Logo Settings */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Footer Logo Postavke</h3>
            <p className="text-sm text-muted-foreground">
              Upravljajte logotipom koji se prikazuje u footeru
            </p>
          </div>

          {/* Enable/Disable Footer Logo */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="footer-logo-enabled">Prikaži Footer Logo</Label>
              <p className="text-sm text-muted-foreground">
                Omogući ili onemogući prikaz logotipa u footeru
              </p>
            </div>
            <Switch
              id="footer-logo-enabled"
              checked={settings.footer_logo_enabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, footer_logo_enabled: checked }))
              }
            />
          </div>

          {settings.footer_logo_enabled && (
            <>
              {/* Heart Icon Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-heart-icon">Prikaži Srce Ikonu</Label>
                  <p className="text-sm text-muted-foreground">
                    Prikaži srce ikonu prije logotipa u footeru
                  </p>
                </div>
                <Switch
                  id="show-heart-icon"
                  checked={settings.show_heart_icon}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, show_heart_icon: checked }))
                  }
                />
              </div>

              {/* Footer Logo Height Controls */}
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Visina Footer Logotipa</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-logo-height-desktop">Desktop (px)</Label>
                    <input
                      id="footer-logo-height-desktop"
                      type="number"
                      min="20"
                      max="200"
                      value={settings.footer_logo_height_desktop}
                      onChange={(e) => setSettings((prev) => ({ ...prev, footer_logo_height_desktop: parseInt(e.target.value) || 70 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                    <p className="text-xs text-muted-foreground">Preporučeno: 60-80px</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="footer-logo-height-mobile">Mobilni (px)</Label>
                    <input
                      id="footer-logo-height-mobile"
                      type="number"
                      min="20"
                      max="200"
                      value={settings.footer_logo_height_mobile}
                      onChange={(e) => setSettings((prev) => ({ ...prev, footer_logo_height_mobile: parseInt(e.target.value) || 50 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                    <p className="text-xs text-muted-foreground">Preporučeno: 40-60px</p>
                  </div>
                </div>
              </div>

              {/* Footer Logo Type Selection */}
              <div className="space-y-3">
                <Label>Tip Footer Logotipa</Label>
                <RadioGroup
                  value={settings.footer_logo_type}
                  onValueChange={(value: 'image' | 'text') =>
                    setSettings((prev) => ({ ...prev, footer_logo_type: value }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="footer-type-text" />
                    <Label htmlFor="footer-type-text" className="font-normal cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        <span>Tekstualni Logo</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="footer-type-image" />
                    <Label htmlFor="footer-type-image" className="font-normal cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Slika Logotipa</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Footer Preview */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Pregled Footer Loga
                </Label>
                <div className="border rounded-lg p-6 bg-slate-900 flex items-center justify-center min-h-[120px]">
                  <div className="flex items-center gap-3">
                    {settings.show_heart_icon && (
                      <div className="p-2 rounded-xl bg-[rgb(8,145,178)]/10">
                        <Heart className="w-6 h-6" style={{ color: 'rgb(8, 145, 178)' }} />
                      </div>
                    )}
                    {settings.footer_logo_type === 'text' ? (
                      <div className="flex items-center gap-1 text-2xl font-bold">
                        <span style={{ color: 'rgb(8, 145, 178)' }}>Wiz</span>
                        <span className="text-white">Medik</span>
                      </div>
                    ) : footerPreviewUrl ? (
                      <div className="relative">
                        <img
                          src={footerPreviewUrl}
                          alt="Footer Logo"
                          style={{
                            height: '70px',
                            width: 'auto',
                            objectFit: 'contain'
                          }}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={handleRemoveFooterLogo}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nema uploadovanog footer logotipa</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Footer Image (only if image type selected) */}
              {settings.footer_logo_type === 'image' && (
                <div className="space-y-3">
                  <Label>Upload Footer Logo Slike</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => footerFileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex-1"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploadovanje...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Odaberi Sliku
                        </>
                      )}
                    </Button>
                    <input
                      ref={footerFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFooterFileSelect}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max 2MB. Format: PNG, JPG, SVG, WebP
                  </p>
                </div>
              )}

              {/* Info about footer text logo */}
              {settings.footer_logo_type === 'text' && (
                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Type className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Footer Tekstualni Logo
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        "Wiz" je cyan boje (kao u hederu), "Medik" je bijele boje.
                        Opciono srce ikona se prikazuje prije loga.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Čuvanje...
              </>
            ) : (
              'Sačuvaj Promjene'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
