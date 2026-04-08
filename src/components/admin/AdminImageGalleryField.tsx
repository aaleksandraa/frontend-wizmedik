import { useState } from 'react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { uploadAPI } from '@/services/api';
import { fixImageUrl } from '@/utils/imageUrl';

interface AdminImageGalleryFieldProps {
  label: string;
  folder: string;
  images: string[];
  onChange: (images: string[]) => void;
  description?: string;
  maxImages?: number;
}

export function AdminImageGalleryField({
  label,
  folder,
  images,
  onChange,
  description,
  maxImages = 10,
}: AdminImageGalleryFieldProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file?: File) => {
    if (!file) return;

    if (images.length >= maxImages) {
      toast({
        title: 'Limit galerije',
        description: `Možete dodati maksimalno ${maxImages} slika.`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file, folder);
      const imageReference = response.data.path || response.data.url;
      onChange([...images, imageReference]);
      toast({ title: 'Uspjeh', description: 'Slika je dodana u galeriju.' });
    } catch (error: any) {
      const validationMessage =
        error?.response?.data?.errors?.image?.[0]
        || error?.response?.data?.message
        || 'Upload slike nije uspio.';

      toast({
        title: 'Greška',
        description: validationMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <Label>{label}</Label>
          <span className="text-xs text-muted-foreground">
            {images.length}/{maxImages}
          </span>
        </div>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>

      <Input
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.svg,.heic,.heif,.avif,image/*"
        disabled={uploading || images.length >= maxImages}
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

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="relative overflow-hidden rounded-lg border">
              <img
                src={fixImageUrl(image) || image}
                alt={`${label} ${index + 1}`}
                className="h-28 w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7"
                onClick={() => onChange(images.filter((_, imageIndex) => imageIndex !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          <Upload className="mr-2 h-4 w-4" />
          Nema slika u galeriji
        </div>
      )}
    </div>
  );
}
