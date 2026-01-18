import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { reviewsAPI, Recenzija } from '@/services/reviewsAPI';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ReviewCardProps {
  recenzija: Recenzija;
  onUpdate?: () => void;
  canRespond?: boolean;
}

export const ReviewCard = ({ recenzija, onUpdate, canRespond = false }: ReviewCardProps) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [odgovor, setOdgovor] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddResponse = async () => {
    if (!odgovor.trim()) {
      toast({
        variant: "destructive",
        title: "Greška",
        description: "Odgovor ne može biti prazan"
      });
      return;
    }
    
    setLoading(true);
    try {
      await reviewsAPI.addResponse(recenzija.id, odgovor);
      setShowResponseForm(false);
      setOdgovor('');
      toast({
        title: "Uspjeh",
        description: "Odgovor uspješno dodan"
      });
      onUpdate?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Greška",
        description: error.response?.data?.error || 'Greška pri dodavanju odgovora'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Da li ste sigurni da želite obrisati ovu recenziju?')) return;
    
    setLoading(true);
    try {
      await reviewsAPI.delete(recenzija.id);
      toast({
        title: "Uspjeh",
        description: "Recenzija uspješno obrisana"
      });
      onUpdate?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Greška",
        description: error.response?.data?.error || 'Greška pri brisanju recenzije'
      });
    } finally {
      setLoading(false);
    }
  };

  // FIX: Provjerava recenzija.user?.id umjesto recenzija.user_id
  const canDelete = user && (
    user.tip === 'admin' || 
    (user.tip === 'pacijent' && user.id === recenzija.user?.id)
  );

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold flex-shrink-0">
              {recenzija.user?.ime?.[0] || 'P'}{recenzija.user?.prezime?.[0] || 'P'}
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-base">
                  {recenzija.user?.ime} {recenzija.user?.prezime}
                </h4>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Stars */}
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < recenzija.ocjena
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Date */}
                <span className="text-sm text-muted-foreground">
                  {new Date(recenzija.created_at).toLocaleDateString('sr-Latn-BA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
          
          {canDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              disabled={loading}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Komentar */}
        {recenzija.komentar && (
          <p className="text-muted-foreground leading-relaxed mb-3">
            {recenzija.komentar}
          </p>
        )}
        
        {/* Odgovor od doktora/klinike */}
        {recenzija.odgovor && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mt-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-blue-900 mb-2">
                  Odgovor doktora:
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {recenzija.odgovor}
                </p>
                {recenzija.odgovor_datum && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(recenzija.odgovor_datum).toLocaleDateString('sr-Latn-BA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gumb za odgovor (samo za doktore/klinike) */}
        {canRespond && !recenzija.odgovor && !showResponseForm && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowResponseForm(true)}
            className="mt-3"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Odgovori na recenziju
          </Button>
        )}

        {/* Forma za odgovor */}
        {showResponseForm && (
          <div className="mt-4 space-y-3 p-4 bg-muted/50 rounded-lg">
            <Textarea
              placeholder="Napišite odgovor na recenziju..."
              value={odgovor}
              onChange={(e) => setOdgovor(e.target.value)}
              rows={3}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {odgovor.length}/1000 karaktera
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleAddResponse} 
                disabled={loading || !odgovor.trim()}
                size="sm"
              >
                {loading ? 'Šaljem...' : 'Pošalji odgovor'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowResponseForm(false);
                  setOdgovor('');
                }}
                size="sm"
              >
                Otkaži
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};