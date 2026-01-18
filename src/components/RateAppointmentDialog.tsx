import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reviewsAPI } from '@/services/reviewsAPI';
import { z } from 'zod';

const reviewSchema = z.object({
  ocjena: z.number().min(1, "Molimo odaberite ocjenu").max(5, "Ocjena mora biti između 1 i 5"),
  komentar: z.string().trim().max(1000, "Komentar ne može biti duži od 1000 karaktera").optional()
});

interface RateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terminId: number;
  doctorId: number;
  doctorName: string;
  onSuccess?: () => void;
}

export function RateAppointmentDialog({
  open,
  onOpenChange,
  terminId,
  doctorId,
  doctorName,
  onSuccess
}: RateAppointmentDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(true);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    if (open && terminId) {
      checkIfCanReview();
    }
  }, [open, terminId]);

  const checkIfCanReview = async () => {
    try {
      const response = await reviewsAPI.canReview(terminId);
      
      if (!response.data.can_review) {
        setCanReview(false);
        
        // Ako već postoji recenzija, učitaj je
        if (response.data.recenzija_id) {
          const recenzijeResponse = await reviewsAPI.getByDoktor(doctorId);
          const existing = recenzijeResponse.data.find(
            (r: any) => r.id === response.data.recenzija_id
          );
          
          if (existing) {
            setExistingReview(existing);
            setRating(existing.ocjena);
            setComment(existing.komentar || '');
          }
        } else {
          toast({
            title: "Nije moguće ocijeniti",
            description: response.data.reason,
            variant: "destructive"
          });
          onOpenChange(false);
        }
      } else {
        setCanReview(true);
        setExistingReview(null);
        setRating(0);
        setComment('');
      }
    } catch (error) {
      console.error('Error checking if can review:', error);
      toast({
        title: "Greška",
        description: "Nije moguće provjeriti status recenzije",
        variant: "destructive"
      });
      onOpenChange(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const validation = reviewSchema.safeParse({
        ocjena: rating,
        komentar: comment
      });

      if (!validation.success) {
        toast({
          title: "Greška",
          description: validation.error.errors[0].message,
          variant: "destructive"
        });
        return;
      }

      setLoading(true);

      if (existingReview) {
        // Ažuriraj postojeću recenziju
        await reviewsAPI.update(existingReview.id, {
          ocjena: rating,
          komentar: comment.trim() || undefined
        });
        
        toast({
          title: "Uspjeh",
          description: "Vaša recenzija je ažurirana"
        });
      } else {
        // Kreiraj novu recenziju
        await reviewsAPI.create({
          termin_id: terminId,
          recenziran_type: 'App\\Models\\Doktor',
          recenziran_id: doctorId,
          ocjena: rating,
          komentar: comment.trim() || undefined
        });
        
        toast({
          title: "Uspjeh",
          description: "Hvala na vašoj recenziji!"
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.response?.data?.error || "Nije moguće sačuvati recenziju",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? 'Ažuriraj recenziju' : 'Ocijenite doktora'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Kako biste ocijenili</p>
            <p className="font-semibold text-lg">{doctorName}?</p>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                aria-label={`Ocijenite ${star} zvjezdica`}
                disabled={!canReview && !existingReview}
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              {rating === 1 && 'Veoma loše'}
              {rating === 2 && 'Loše'}
              {rating === 3 && 'Osrednje'}
              {rating === 4 && 'Dobro'}
              {rating === 5 && 'Odlično'}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">
              Komentar <span className="text-xs text-muted-foreground">(opcionalno)</span>
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Podijelite svoje iskustvo sa ostalim pacijentima..."
              rows={4}
              maxLength={1000}
              className="resize-none"
              disabled={!canReview && !existingReview}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/1000 karaktera
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || loading || (!canReview && !existingReview)}
              className="flex-1"
              variant="medical"
            >
              {loading ? 'Čuvanje...' : existingReview ? 'Ažuriraj' : 'Pošalji recenziju'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Otkaži
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}