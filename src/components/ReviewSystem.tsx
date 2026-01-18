import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare, Calendar, CheckCircle } from 'lucide-react';
import { reviewsAPI, Recenzija, RatingStats } from '@/services/reviewsAPI';
import api from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { bs } from 'date-fns/locale';
import DOMPurify from 'dompurify';

interface ReviewSystemProps {
  type: 'doktor' | 'klinika' | 'laboratorija' | 'banja' | 'dom';
  id: number;
  canLeaveReview?: boolean;
  terminId?: number;
  allowGuestReviews?: boolean; // Za laboratorije, banje, domove
}

export function ReviewSystem({ 
  type, 
  id, 
  canLeaveReview = false, 
  terminId,
  allowGuestReviews = false 
}: ReviewSystemProps) {
  const [recenzije, setRecenzije] = useState<any[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const [formData, setFormData] = useState({
    ocjena: 5,
    komentar: '',
    ime: '', // Za gost korisnike
  });

  useEffect(() => {
    loadRecenzije();
    loadStats();
  }, [type, id]);

  const loadRecenzije = async () => {
    try {
      let response;
      
      if (type === 'doktor') {
        response = await reviewsAPI.getByDoktor(id);
      } else if (type === 'klinika') {
        response = await reviewsAPI.getByKlinika(id);
      } else if (type === 'laboratorija') {
        response = await api.get(`/laboratorije/${id}/recenzije`);
      } else if (type === 'banja') {
        response = await api.get(`/banje/${id}/recenzije`);
      } else if (type === 'dom') {
        response = await api.get(`/domovi-njega/${id}/recenzije`);
      }
      
      setRecenzije(response?.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      let response;
      
      if (type === 'doktor' || type === 'klinika') {
        response = await reviewsAPI.getRatingStats(type, id);
      } else if (type === 'laboratorija') {
        response = await api.get(`/laboratorije/${id}/recenzije/stats`);
      } else if (type === 'banja') {
        response = await api.get(`/banje/${id}/recenzije/stats`);
      } else if (type === 'dom') {
        response = await api.get(`/domovi-njega/${id}/recenzije/stats`);
      }
      
      setStats(response?.data || null);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validacija za gost korisnike
    if (allowGuestReviews && !user && !formData.ime.trim()) {
      toast.error('Molimo unesite vaše ime');
      return;
    }
    
    // Validacija za termin-based recenzije
    if (!allowGuestReviews && !terminId) {
      toast.error('Termin ID nije dostupan');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      
      if (type === 'doktor' || type === 'klinika') {
        // Termin-based review
        response = await reviewsAPI.create({
          termin_id: terminId!,
          recenziran_type: type === 'doktor' ? 'App\\Models\\Doktor' : 'App\\Models\\Klinika',
          recenziran_id: id,
          ocjena: formData.ocjena,
          komentar: formData.komentar,
        });
      } else if (type === 'laboratorija') {
        response = await api.post(`/laboratorije/${id}/recenzije`, {
          ocjena: formData.ocjena,
          komentar: formData.komentar,
          ime: user ? undefined : formData.ime,
        });
      } else if (type === 'banja') {
        response = await api.post(`/banje/${id}/recenzije`, {
          ocjena: formData.ocjena,
          komentar: formData.komentar,
          ime: user ? undefined : formData.ime,
        });
      } else if (type === 'dom') {
        response = await api.post(`/domovi-njega/${id}/recenzije`, {
          ocjena: formData.ocjena,
          komentar: formData.komentar,
          ime: user ? undefined : formData.ime,
        });
      }
      
      const message = allowGuestReviews 
        ? 'Recenzija uspješno poslata. Čeka odobrenje administratora.'
        : 'Recenzija uspješno dodana';
        
      toast.success(message);
      setShowForm(false);
      setFormData({ ocjena: 5, komentar: '', ime: '' });
      loadRecenzije();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Greška pri dodavanju recenzije');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Učitavanje recenzija...</div>
        </CardContent>
      </Card>
    );
  }

  const canUserLeaveReview = canLeaveReview || (allowGuestReviews && !user);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && stats.total > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {stats.average.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(stats.average))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.total} {stats.total === 1 ? 'recenzija' : 'recenzija'}
                </div>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating} ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${stats.total > 0 ? (stats.distribution[rating as keyof typeof stats.distribution] / stats.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {stats.distribution[rating as keyof typeof stats.distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Review Button */}
      {canUserLeaveReview && !showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <MessageSquare className="w-4 h-4 mr-2" />
          Ostavite recenziju
        </Button>
      )}

      {/* Review Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ostavite recenziju</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Guest name field */}
              {allowGuestReviews && !user && (
                <div>
                  <Label htmlFor="ime">Vaše ime *</Label>
                  <Input
                    id="ime"
                    value={formData.ime}
                    onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
                    placeholder="Unesite vaše ime"
                    required
                    maxLength={100}
                  />
                </div>
              )}
              
              <div>
                <Label className="block mb-2">Ocjena *</Label>
                {renderStars(formData.ocjena, true, (rating) => 
                  setFormData({ ...formData, ocjena: rating })
                )}
              </div>
              
              <div>
                <Label htmlFor="komentar">Komentar (opcionalno)</Label>
                <Textarea
                  id="komentar"
                  value={formData.komentar}
                  onChange={(e) => setFormData({ ...formData, komentar: e.target.value })}
                  placeholder="Podijelite svoje iskustvo..."
                  rows={4}
                  maxLength={1000}
                />
              </div>
              
              {allowGuestReviews && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Vaša recenzija će biti vidljiva nakon što je administrator odobri.
                </div>
              )}
              
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Slanje...' : 'Pošalji recenziju'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Otkaži
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Recenzije ({recenzije.length})
        </h3>
        
        {recenzije.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Još nema recenzija
            </CardContent>
          </Card>
        ) : (
          recenzije.map((recenzija) => (
            <Card key={recenzija.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {recenzija.user?.ime?.[0] || recenzija.ime?.[0] || '?'}
                      {recenzija.user?.prezime?.[0] || recenzija.ime?.[1] || ''}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">
                          {recenzija.user ? `${recenzija.user.ime} ${recenzija.user.prezime}` : recenzija.ime}
                          {recenzija.verifikovano && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verifikovano
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(recenzija.created_at), { 
                            addSuffix: true,
                            locale: bs 
                          })}
                        </div>
                      </div>
                      {renderStars(recenzija.ocjena)}
                    </div>
                    
                    {recenzija.komentar && (
                      <p 
                        className="text-sm mb-3"
                        dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(recenzija.komentar, {
                            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
                            ALLOWED_ATTR: []
                          })
                        }}
                      />
                    )}
                    
                    {recenzija.odgovor && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">Odgovor</Badge>
                          <span className="text-xs text-muted-foreground">
                            {recenzija.odgovor_datum && formatDistanceToNow(new Date(recenzija.odgovor_datum), { 
                              addSuffix: true,
                              locale: bs 
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{recenzija.odgovor}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
