import { useState } from 'react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { uploadAPI } from '@/services/api';
import { fixImageUrl } from '@/utils/imageUrl';

interface AdminSingleImageUploadFieldProps {
  label: string;
  folder: string;
  value?: string | null;
  onChange: (value: string) => void;
  description?: string;
}

export function AdminSingleImageUploadField({
  label,
  folder,
  value,
  onChange,
  description,
}: AdminSingleImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file?: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file, folder);
      onChange(response.data.path || response.data.url);
      toast({ title: 'Uspjeh', description: 'Slika je uploadovana.' });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error?.response?.data?.message || 'Upload slike nije uspio.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="space-y-1">
        <Label>{label}</Label>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>

      <Input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          handleUpload(file);
          event.currentTarget.value = '';
        }}
      />

      {uploading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Upload u toku...
        </div>
      ) : null}

      {value ? (
        <div className="space-y-3">
          <img
            src={fixImageUrl(value) || value}
            alt={label}
            className="h-32 w-full rounded-lg object-cover"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => onChange('')}>
            <Trash2 className="mr-2 h-4 w-4" />
            Ukloni sliku
          </Button>
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          <Upload className="mr-2 h-4 w-4" />
          Nema učitane slike
        </div>
      )}
    </div>
  );
}
