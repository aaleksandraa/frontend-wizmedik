import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, Edit, Trash2, Ban, CheckCircle, Eye, 
  FlaskConical, Sparkles, Home as HomeIcon, MessageSquare 
} from 'lucide-react';
import { adminAPI } from '@/services/adminApi';
import { AdminListPager, defaultAdminListMeta, parseAdminListPayload, type AdminListMeta } from '@/components/admin/AdminListPager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Entity {
  id: number;
  naziv?: string;
  naslov?: string;
  ime?: string;
  prezime?: string;
  email?: string;
  telefon?: string;
  grad?: string;
  aktivan?: boolean;
  status?: string;
  created_at?: string;
  user?: {
    id: number;
    ime: string;
    prezime: string;
    email: string;
  };
  ime_korisnika?: string;
  email_korisnika?: string;
}

interface EntitiesManagementProps {
  type: 'laboratories' | 'spas' | 'care-homes' | 'questions';
}

const entityConfig = {
  laboratories: {
    title: 'Laboratorije',
    icon: FlaskConical,
    endpoint: '/admin/laboratories',
    fields: ['naziv', 'grad', 'telefon', 'email', 'aktivan'],
  },
  spas: {
    title: 'Banje',
    icon: Sparkles,
    endpoint: '/admin/spas',
    fields: ['naziv', 'grad', 'telefon', 'email', 'aktivan'],
  },
  'care-homes': {
    title: 'Domovi za njegu',
    icon: HomeIcon,
    endpoint: '/admin/care-homes',
    fields: ['naziv', 'grad', 'telefon', 'email', 'aktivan'],
  },
  questions: {
    title: 'Pitanja',
    icon: MessageSquare,
    endpoint: '/admin/pitanja',
    fields: ['naslov', 'autor', 'status', 'created_at'],
  },
};

export function EntitiesManagement({ type }: EntitiesManagementProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<AdminListMeta>(defaultAdminListMeta);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const PAGE_SIZE = 20;

  const config = entityConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    setPage(1);
    setSearchInput('');
    setSearchTerm('');
  }, [type]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchEntities(page, searchTerm);
  }, [type, page, searchTerm]);

  const fetchEntities = async (targetPage = page, search = searchTerm) => {
    if (entities.length === 0 && !search) setLoading(true);
    try {
      const response = await adminAPI.get(config.endpoint, {
        params: {
          page: targetPage,
          per_page: PAGE_SIZE,
          search: search || undefined,
        },
      });
      const parsed = parseAdminListPayload(response.data, targetPage, PAGE_SIZE);
      setEntities(parsed.list);
      setMeta(parsed.meta);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast({
        title: 'Greška',
        description: `Nije moguće učitati ${config.title.toLowerCase()}`,
        variant: 'destructive',
      });
      setEntities([]);
      setMeta(defaultAdminListMeta);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (entity: Entity) => {
    try {
      await adminAPI.put(`${config.endpoint}/${entity.id}`, {
        aktivan: !entity.aktivan,
      });
      toast({
        title: 'Uspjeh',
        description: `Status ${entity.aktivan ? 'deaktiviran' : 'aktiviran'}`,
      });
      fetchEntities();
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Nije moguće promijeniti status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovaj entitet?')) return;

    try {
      await adminAPI.delete(`${config.endpoint}/${id}`);
      toast({
        title: 'Uspjeh',
        description: 'Entitet obrisan',
      });
      fetchEntities();
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Nije moguće obrisati entitet',
        variant: 'destructive',
      });
    }
  };

  const handleView = (entity: Entity) => {
    setSelectedEntity(entity);
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {config.title} ({meta.total})
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Pretraži ${config.title.toLowerCase()}...`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {entities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'Nema rezultata za vašu pretragu.' : 'Nema rezultata'}
            </CardContent>
          </Card>
        ) : (
          entities.map((entity) => (
            <Card key={entity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {entity.naslov || entity.naziv || `${entity.ime} ${entity.prezime}`}
                      </h3>
                      {entity.aktivan !== undefined && (
                        <Badge variant={entity.aktivan ? 'default' : 'secondary'}>
                          {entity.aktivan ? 'Aktivan' : 'Neaktivan'}
                        </Badge>
                      )}
                      {entity.status && (
                        <Badge variant={entity.status === 'published' ? 'default' : 'secondary'}>
                          {entity.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {/* Show user info for questions */}
                      {type === 'questions' && (entity.user || entity.ime_korisnika) && (
                        <span className="flex items-center gap-1">
                          👤 {entity.user ? `${entity.user.ime} ${entity.user.prezime}` : entity.ime_korisnika}
                        </span>
                      )}
                      {entity.grad && (
                        <span className="flex items-center gap-1">
                          📍 {entity.grad}
                        </span>
                      )}
                      {entity.telefon && (
                        <span className="flex items-center gap-1">
                          📞 {entity.telefon}
                        </span>
                      )}
                      {(entity.email || (type === 'questions' && (entity.user?.email || entity.email_korisnika))) && (
                        <span className="flex items-center gap-1 truncate">
                          ✉️ {entity.email || entity.user?.email || entity.email_korisnika}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(entity)}
                      title="Pregledaj"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {entity.aktivan !== undefined && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(entity)}
                        title={entity.aktivan ? 'Deaktiviraj' : 'Aktiviraj'}
                      >
                        {entity.aktivan ? (
                          <Ban className="h-4 w-4 text-orange-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entity.id)}
                      title="Obriši"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <AdminListPager meta={meta} loading={loading} onPageChange={setPage} />

      {/* View Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalji</DialogTitle>
            <DialogDescription>
              Pregled informacija o entitetu
            </DialogDescription>
          </DialogHeader>
          {selectedEntity && (
            <div className="space-y-4">
              {Object.entries(selectedEntity).map(([key, value]) => {
                if (key === 'id' || value === null || value === undefined) return null;
                return (
                  <div key={key} className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}:
                    </div>
                    <div className="col-span-2">
                      {typeof value === 'boolean' ? (
                        <Badge variant={value ? 'default' : 'secondary'}>
                          {value ? 'Da' : 'Ne'}
                        </Badge>
                      ) : typeof value === 'object' ? (
                        <pre className="text-xs bg-muted p-2 rounded">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <span>{String(value)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
