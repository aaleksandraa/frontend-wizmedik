import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, Phone, Download, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';

interface AppointmentDetails {
  doctorName: string;
  specialty?: string;
  date: Date;
  time: string;
  location: string;
  address?: string;
  phone?: string;
  serviceName?: string;
  isGuestVisit?: boolean;
  clinicName?: string;
}

interface AppointmentConfirmationProps {
  appointment: AppointmentDetails;
  onClose: () => void;
}

export function AppointmentConfirmation({ appointment, onClose }: AppointmentConfirmationProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const formatDateLong = (date: Date) => {
    return format(date, 'EEEE, d. MMMM yyyy.', { locale: sr });
  };

  // Generate Google Calendar URL
  const getGoogleCalendarUrl = () => {
    const startDate = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30); // Default 30 min duration

    const formatForGoogle = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '');
    
    const title = encodeURIComponent(`Termin: ${appointment.doctorName}`);
    const details = encodeURIComponent(
      `Termin kod ${appointment.doctorName}${appointment.specialty ? ` (${appointment.specialty})` : ''}\n` +
      `${appointment.serviceName ? `Usluga: ${appointment.serviceName}\n` : ''}` +
      `${appointment.phone ? `Telefon: ${appointment.phone}` : ''}`
    );
    const location = encodeURIComponent(appointment.address || appointment.location);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatForGoogle(startDate)}/${formatForGoogle(endDate)}&details=${details}&location=${location}`;
  };

  // Generate ICS file for iOS/Outlook
  const downloadICS = () => {
    const startDate = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const formatForICS = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, -1);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WizMedik//Appointment//BS
BEGIN:VEVENT
DTSTART:${formatForICS(startDate)}
DTEND:${formatForICS(endDate)}
SUMMARY:Termin: ${appointment.doctorName}
DESCRIPTION:Termin kod ${appointment.doctorName}${appointment.specialty ? ` (${appointment.specialty})` : ''}${appointment.serviceName ? `\\nUsluga: ${appointment.serviceName}` : ''}${appointment.phone ? `\\nTelefon: ${appointment.phone}` : ''}
LOCATION:${appointment.address || appointment.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `termin-${format(appointment.date, 'yyyy-MM-dd')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate and download reminder image
  const downloadReminderImage = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (Instagram story size)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0891b2');
    gradient.addColorStop(1, '#0891b2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 100 + 50, 0, Math.PI * 2);
      ctx.fill();
    }

    // White card background
    const cardX = 80;
    const cardY = 500;
    const cardWidth = canvas.width - 160;
    const cardHeight = 900;
    const radius = 40;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, radius);
    ctx.fill();

    // Add shadow effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;

    // Checkmark circle
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, cardY - 60, 80, 0, Math.PI * 2);
    ctx.fill();

    // Checkmark
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 35, cardY - 60);
    ctx.lineTo(canvas.width / 2 - 5, cardY - 30);
    ctx.lineTo(canvas.width / 2 + 40, cardY - 90);
    ctx.stroke();

    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Termin zakazan', canvas.width / 2, cardY + 100);

    // Doctor name
    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillText(appointment.doctorName, canvas.width / 2, cardY + 200);

    // Specialty
    if (appointment.specialty) {
      ctx.fillStyle = '#64748b';
      ctx.font = '36px system-ui, -apple-system, sans-serif';
      ctx.fillText(appointment.specialty, canvas.width / 2, cardY + 260);
    }

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 60, cardY + 320);
    ctx.lineTo(cardX + cardWidth - 60, cardY + 320);
    ctx.stroke();

    // Date and time section
    ctx.textAlign = 'left';
    const infoX = cardX + 100;
    let infoY = cardY + 420;

    // Calendar icon placeholder + Date
    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillText('📅', infoX, infoY);
    ctx.fillStyle = '#1e293b';
    ctx.font = '42px system-ui, -apple-system, sans-serif';
    ctx.fillText(formatDateLong(appointment.date), infoX + 70, infoY);

    // Time
    infoY += 90;
    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillText('🕐', infoX, infoY);
    ctx.fillStyle = '#1e293b';
    ctx.font = '42px system-ui, -apple-system, sans-serif';
    ctx.fillText(appointment.time, infoX + 70, infoY);

    // Location
    infoY += 90;
    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillText('📍', infoX, infoY);
    ctx.fillStyle = '#1e293b';
    ctx.font = '38px system-ui, -apple-system, sans-serif';
    
    // Wrap location text if too long
    const locationText = appointment.isGuestVisit && appointment.clinicName 
      ? appointment.clinicName 
      : appointment.location;
    const maxWidth = cardWidth - 200;
    if (ctx.measureText(locationText).width > maxWidth) {
      ctx.font = '32px system-ui, -apple-system, sans-serif';
    }
    ctx.fillText(locationText, infoX + 70, infoY);

    // Address if different
    if (appointment.address && appointment.address !== locationText) {
      infoY += 50;
      ctx.fillStyle = '#64748b';
      ctx.font = '32px system-ui, -apple-system, sans-serif';
      ctx.fillText(appointment.address, infoX + 70, infoY);
    }

    // Service if provided
    if (appointment.serviceName) {
      infoY += 90;
      ctx.fillStyle = '#0891b2';
      ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
      ctx.fillText('💼', infoX, infoY);
      ctx.fillStyle = '#1e293b';
      ctx.font = '38px system-ui, -apple-system, sans-serif';
      ctx.fillText(appointment.serviceName, infoX + 70, infoY);
    }

    // Footer - wizMedik branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('wizMedik', canvas.width / 2, canvas.height - 100);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillText('Vaš zdravstveni partner', canvas.width / 2, canvas.height - 55);

    // Download
    const link = document.createElement('a');
    link.download = `termin-${format(appointment.date, 'yyyy-MM-dd')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Termin uspješno zakazan!</h2>
        <p className="text-muted-foreground mt-1">Detalji vašeg termina su ispod</p>
      </div>

      {/* Appointment Card */}
      <Card ref={cardRef} className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6 space-y-4">
          {/* Doctor Info */}
          <div className="text-center pb-4 border-b">
            <h3 className="text-xl font-semibold text-primary">{appointment.doctorName}</h3>
            {appointment.specialty && (
              <p className="text-muted-foreground">{appointment.specialty}</p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{formatDateLong(appointment.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{appointment.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {appointment.isGuestVisit && appointment.clinicName 
                    ? appointment.clinicName 
                    : appointment.location}
                </p>
                {appointment.address && (
                  <p className="text-sm text-muted-foreground">{appointment.address}</p>
                )}
              </div>
            </div>

            {appointment.serviceName && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{appointment.serviceName}</p>
                </div>
              </div>
            )}

            {appointment.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{appointment.phone}</p>
                </div>
              </div>
            )}
          </div>

          {appointment.isGuestVisit && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-amber-800">
                <strong>Napomena:</strong> Ovaj termin je u klinici gdje doktor gostuje, ne u njegovoj matičnoj ordinaciji.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <p className="text-sm text-center text-muted-foreground font-medium">Dodaj u kalendar</p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12"
            onClick={() => window.open(getGoogleCalendarUrl(), '_blank')}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google Calendar
          </Button>
          <Button
            variant="outline"
            className="h-12"
            onClick={downloadICS}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Apple / Outlook
          </Button>
        </div>

        <Button
          variant="secondary"
          className="w-full h-12"
          onClick={downloadReminderImage}
        >
          <Download className="w-5 h-5 mr-2" />
          Preuzmi podsjetnik (slika)
        </Button>

        <Button variant="default" className="w-full h-12" onClick={onClose}>
          Zatvori
        </Button>
      </div>
    </div>
  );
}
