import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { adminAPI } from '@/services/adminApi';
import { Database, Download, Loader2, RefreshCw, Clock, HardDrive } from 'lucide-react';

interface BackupItem {
  path: string;
  filename: string;
  date: string;
  size_bytes: number;
  size_human: string;
}

interface BackupStatus {
  schedule: {
    command: string;
    time: string;
    timezone: string;
    cleanup_time: string;
    cleanup_command: string;
    log_file: string;
    retention: {
      keep_all_days: number;
      keep_daily_days: number;
      keep_weekly_weeks: number;
      keep_monthly_months: number;
    };
  };
  storage: {
    disk: string;
    backup_name: string;
    reachable: boolean;
    used_bytes: number;
  };
  backups: BackupItem[];
  newest_backup: BackupItem | null;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString('bs-BA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

function downloadBlobResponse(response: { data: Blob; headers?: Record<string, string> }, fallbackFileName: string) {
  const dispositionHeader = response.headers?.['content-disposition'] || '';
  const utfFilenameMatch = dispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
  const plainFilenameMatch = dispositionHeader.match(/filename="?([^"]+)"?/i);
  const rawFileName = utfFilenameMatch?.[1] || plainFilenameMatch?.[1] || fallbackFileName;
  const decodedFileName = (() => {
    try {
      return decodeURIComponent(rawFileName);
    } catch {
      return rawFileName;
    }
  })();
  const fileName = decodedFileName.replace(/[/\\?%*:|"<>]/g, '-');

  const blob = new Blob([response.data], { type: 'application/zip' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export function AdminDatabaseBackup() {
  const { toast } = useToast();
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDatabaseBackupStatus();
      setStatus(response.data);
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error?.response?.data?.message || 'Nije moguće učitati informacije o backupu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDownload = async (backup: BackupItem) => {
    setDownloadingPath(backup.path);
    try {
      const response = await adminAPI.downloadDatabaseBackup(backup.path);
      downloadBlobResponse(response, backup.filename);
      toast({ title: 'Uspjeh', description: 'Backup baze je preuzet.' });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error?.response?.data?.message || 'Preuzimanje backupa nije uspjelo.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingPath(null);
    }
  };

  const handleCreateAndDownload = async () => {
    setCreatingBackup(true);
    try {
      const runResponse = await adminAPI.runDatabaseBackup();
      const backup = runResponse.data?.backup as BackupItem | undefined;

      if (!backup?.path) {
        throw new Error(runResponse.data?.message || 'Backup nije kreiran.');
      }

      const downloadResponse = await adminAPI.downloadDatabaseBackup(backup.path);
      downloadBlobResponse(downloadResponse, backup.filename);

      toast({
        title: 'Uspjeh',
        description: 'Novi backup baze je kreiran i preuzet.',
      });
      await fetchStatus();
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error?.response?.data?.message || error?.message || 'Kreiranje backupa nije uspjelo.',
        variant: 'destructive',
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Učitavanje backup informacija...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup baze podataka
            </CardTitle>
            <CardDescription>
              Automatski i ručni backup PostgreSQL baze (Spatie Laravel Backup).
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStatus} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Osvježi
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {status && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4 text-primary" />
                  Automatski raspored
                </div>
                <p className="text-sm text-muted-foreground">
                  Svaki dan u <strong>{status.schedule.time}</strong> ({status.schedule.timezone})
                </p>
                <p className="text-sm text-muted-foreground">
                  Komanda: <code className="text-xs">{status.schedule.command}</code>
                </p>
                <p className="text-sm text-muted-foreground">
                  Čišćenje starih backupa u <strong>{status.schedule.cleanup_time}</strong> ({status.schedule.cleanup_command})
                </p>
                <p className="text-xs text-muted-foreground">
                  Log: {status.schedule.log_file}
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <HardDrive className="h-4 w-4 text-primary" />
                  Pohrana
                </div>
                <p className="text-sm text-muted-foreground">
                  Disk: <strong>{status.storage.disk}</strong> / {status.storage.backup_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status:{' '}
                  <Badge variant={status.storage.reachable ? 'default' : 'destructive'}>
                    {status.storage.reachable ? 'Dostupno' : 'Nedostupno'}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  Retencija: {status.schedule.retention.keep_all_days} dana (svi), {status.schedule.retention.keep_daily_days} dana (dnevni)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCreateAndDownload}
                disabled={creatingBackup || !!downloadingPath}
                className="gap-2"
              >
                {creatingBackup ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Kreiranje backupa...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Kreiraj i preuzmi backup sada
                  </>
                )}
              </Button>

              {status.newest_backup && (
                <Button
                  variant="outline"
                  onClick={() => handleDownload(status.newest_backup!)}
                  disabled={creatingBackup || downloadingPath === status.newest_backup.path}
                  className="gap-2"
                >
                  {downloadingPath === status.newest_backup.path ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Preuzmi najnoviji backup
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Dostupni backupi ({status.backups.length})</h3>

              {status.backups.length === 0 ? (
                <p className="text-sm text-muted-foreground rounded-lg border p-4">
                  Još nema sačuvanih backupa. Automatski backup se pokreće svake noći u 02:00, ili kliknite gumb iznad za ručno kreiranje.
                </p>
              ) : (
                <div className="space-y-2">
                  {status.backups.map((backup) => (
                    <div
                      key={backup.path}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{backup.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(backup.date)} · {backup.size_human}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(backup)}
                        disabled={creatingBackup || downloadingPath === backup.path}
                        className="gap-2 shrink-0"
                      >
                        {downloadingPath === backup.path ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Preuzmi
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
