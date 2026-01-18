import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, CheckCircle, XCircle, Clock, UserPlus, Building2, 
  Mail, Phone, MapPin, Calendar, Eye, FlaskConical, Droplet, Home 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import axios from 'axios';
import { format } from 'date-fns';

interface RegistrationRequest {
  id: number;
  type: 'doctor' | 'clinic' | 'laboratory' | 'spa' | 'care_home';
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  email_verified_at: string | null;
  created_at: string;
  ime?: string;
  prezime?: string;
  naziv?: string;
  telefon?: string;
  grad?: string;
  specijalnost?: string;
  adresa?: string;
  // Legacy support for data object
  data?: {
    ime?: string;
    prezime?: string;
    naziv?: string;
    telefon?: string;
    grad?: string;
    specijalnost?: string;
    adresa?: string;
  };
}

export function RegistrationRequests() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:8000/api/admin/registration-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati zahtjeve za registraciju',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`http://localhost:8000/api/admin/registration-requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Odobreno',
        description: 'Zahtjev za registraciju je odobren',
      });
      fetchRequests();
      setShowDetails(false);
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće odobriti zahtjev',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovaj zahtjev? Ova akcija se ne može poništiti.')) {
      return;
    }
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`http://localhost:8000/api/admin/registration-requests/${id}/reject`, {
        reason: 'Zahtjev odbijen i obrisan od strane administratora'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Obrisano',
        description: 'Zahtjev za registraciju je obrisan',
      });
      fetchRequests();
      setShowDetails(false);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće obrisati zahtjev',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string, emailVerifiedAt: string | null) => {
    if (!emailVerifiedAt) {
      return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> Čeka verifikaciju</Badge>;
    }
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Na čekanju</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle className="w-3 h-3" /> Odobreno</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Odbijeno</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending'); // Uklonjena provjera email_verified
  const doctorRequests = requests.filter(r => r.type === 'doctor');
  const clinicRequests = requests.filter(r => r.type === 'clinic');
  const laboratoryRequests = requests.filter(r => r.type === 'laboratory');
  const spaRequests = requests.filter(r => r.type === 'spa');
  const careHomeRequests = requests.filter(r => r.type === 'care_home');

  // Helper functions to get data from request (supports both direct fields and legacy data object)
  const getName = (request: RegistrationRequest) => {
    if (request.type === 'doctor') {
      return `${request.ime || request.data?.ime || ''} ${request.prezime || request.data?.prezime || ''}`.trim() || 'N/A';
    }
    return request.naziv || request.data?.naziv || 'N/A';
  };

  const getTelefon = (request: RegistrationRequest) => request.telefon || request.data?.telefon;
  const getGrad = (request: RegistrationRequest) => request.grad || request.data?.grad;
  const getSpecijalnost = (request: RegistrationRequest) => request.specijalnost || request.data?.specijalnost;
  const isEmailVerified = (request: RegistrationRequest) => !!request.email_verified_at;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zahtjevi za Registraciju</h2>
          <p className="text-gray-600 mt-1">
            {pendingRequests.length} zahtjeva čeka odobrenje
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          Osvježi
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Na čekanju ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="doctors" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Doktori ({doctorRequests.length})
          </TabsTrigger>
          <TabsTrigger value="clinics" className="gap-2">
            <Building2 className="w-4 h-4" />
            Klinike ({clinicRequests.length})
          </TabsTrigger>
          <TabsTrigger value="laboratories" className="gap-2">
            <FlaskConical className="w-4 h-4" />
            Laboratorije ({laboratoryRequests.length})
          </TabsTrigger>
          <TabsTrigger value="spas" className="gap-2">
            <Droplet className="w-4 h-4" />
            Banje ({spaRequests.length})
          </TabsTrigger>
          <TabsTrigger value="care_homes" className="gap-2">
            <Home className="w-4 h-4" />
            Domovi ({careHomeRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-lg font-medium text-gray-900">Nema zahtjeva na čekanju</p>
                <p className="text-sm text-gray-500">Svi zahtjevi su obrađeni</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {request.type === 'doctor' ? (
                            <UserPlus className="w-6 h-6 text-primary" />
                          ) : request.type === 'laboratory' ? (
                            <FlaskConical className="w-6 h-6 text-primary" />
                          ) : request.type === 'spa' ? (
                            <Droplet className="w-6 h-6 text-primary" />
                          ) : request.type === 'care_home' ? (
                            <Home className="w-6 h-6 text-primary" />
                          ) : (
                            <Building2 className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {getName(request)}
                            </h3>
                            {getStatusBadge(request.status, request.email_verified_at)}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {request.email}
                            </div>
                            {getTelefon(request) && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {getTelefon(request)}
                              </div>
                            )}
                            {getGrad(request) && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {getGrad(request)}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(request.created_at), 'dd.MM.yyyy. HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detalji
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                          title={!isEmailVerified(request) ? 'Email nije verifikovan, ali možete odobriti' : 'Odobri zahtjev'}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Odobri
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          disabled={processing}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Obriši
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          {doctorRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900">Nema zahtjeva od doktora</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {doctorRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {getName(request)}
                          </h3>
                          {getStatusBadge(request.status, request.email_verified_at)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>{request.email}</div>
                          {getSpecijalnost(request) && <div>Specijalnost: {getSpecijalnost(request)}</div>}
                          <div>{format(new Date(request.created_at), 'dd.MM.yyyy. HH:mm')}</div>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                            title={!isEmailVerified(request) ? 'Email nije verifikovan, ali možete odobriti' : 'Odobri zahtjev'}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Odobri
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            disabled={processing}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Obriši
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="clinics" className="space-y-4">
          {clinicRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900">Nema zahtjeva od klinika</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {clinicRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{getName(request)}</h3>
                          {getStatusBadge(request.status, request.email_verified_at)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>{request.email}</div>
                          {getGrad(request) && <div>Grad: {getGrad(request)}</div>}
                          <div>{format(new Date(request.created_at), 'dd.MM.yyyy. HH:mm')}</div>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                            title={!isEmailVerified(request) ? 'Email nije verifikovan, ali možete odobriti' : 'Odobri zahtjev'}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Odobri
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            disabled={processing}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Obriši
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="laboratories" className="space-y-4">
          {laboratoryRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FlaskConical className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900">Nema zahtjeva od laboratorija</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {laboratoryRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{getName(request)}</h3>
                          {getStatusBadge(request.status, request.email_verified_at)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>{request.email}</div>
                          {getGrad(request) && <div>Grad: {getGrad(request)}</div>}
                          <div>{format(new Date(request.created_at), 'dd.MM.yyyy. HH:mm')}</div>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                            title={!isEmailVerified(request) ? 'Email nije verifikovan, ali možete odobriti' : 'Odobri zahtjev'}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Odobri
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            disabled={processing}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Obriši
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="spas" className="space-y-4">
          {spaRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Droplet className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900">Nema zahtjeva od banja</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {spaRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{getName(request)}</h3>
                          {getStatusBadge(request.status, request.email_verified_at)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>{request.email}</div>
                          {getGrad(request) && <div>Grad: {getGrad(request)}</div>}
                          <div>{format(new Date(request.created_at), 'dd.MM.yyyy. HH:mm')}</div>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                            title={!isEmailVerified(request) ? 'Email nije verifikovan, ali možete odobriti' : 'Odobri zahtjev'}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Odobri
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            disabled={processing}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Obriši
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="care_homes" className="space-y-4">
          {careHomeRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Home className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900">Nema zahtjeva od domova za njegu</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {careHomeRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{getName(request)}</h3>
                          {getStatusBadge(request.status, request.email_verified_at)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>{request.email}</div>
                          {getGrad(request) && <div>Grad: {getGrad(request)}</div>}
                          <div>{format(new Date(request.created_at), 'dd.MM.yyyy. HH:mm')}</div>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                            title={!isEmailVerified(request) ? 'Email nije verifikovan, ali možete odobriti' : 'Odobri zahtjev'}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Odobri
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            disabled={processing}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Obriši
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalji Zahtjeva</DialogTitle>
            <DialogDescription>Pregled svih informacija o zahtjevu za registraciju</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tip</Label>
                  <p className="mt-1">
                    {selectedRequest.type === 'doctor' ? 'Doktor' : 
                     selectedRequest.type === 'laboratory' ? 'Laboratorija' :
                     selectedRequest.type === 'spa' ? 'Banja' :
                     selectedRequest.type === 'care_home' ? 'Dom za njegu' : 'Klinika'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status, selectedRequest.email_verified_at)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="mt-1">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Datum</Label>
                  <p className="mt-1">{format(new Date(selectedRequest.created_at), 'dd.MM.yyyy. HH:mm')}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Dodatne informacije</Label>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify({
                    ime: selectedRequest.ime,
                    prezime: selectedRequest.prezime,
                    naziv: selectedRequest.naziv,
                    telefon: selectedRequest.telefon,
                    grad: selectedRequest.grad,
                    adresa: selectedRequest.adresa,
                    specijalnost: selectedRequest.specijalnost,
                  }, null, 2)}
                </pre>
              </div>
              {selectedRequest.status === 'pending' && (
                <>
                  {!isEmailVerified(selectedRequest) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      <strong>Napomena:</strong> Email još nije verifikovan. Možete odobriti zahtjev, a korisnik će moći verifikovati email kasnije.
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="default"
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Odobri
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Obriši
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
