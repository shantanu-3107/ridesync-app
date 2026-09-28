import { Ride, RideRequest, UserProfile, PastRide } from '../types/ride';

export interface EmailDispatchPayload {
  eventType: 'NEW_RIDE_OFFERED' | 'NEW_RIDE_REQUEST' | 'COUNTER_OFFER' | 'RIDE_ACCEPTED' | 'TEST_NOTIFICATION';
  title: string;
  recipientEmail: string;
  data: Record<string, any>;
}

/**
 * Sends form data directly to the user's email using FormSubmit AJAX API.
 * Free, zero-backend, sends formatted emails directly to the recipient.
 */
export async function sendDataToEmail(payload: EmailDispatchPayload): Promise<{ success: boolean; message: string }> {
  const { eventType, title, recipientEmail, data } = payload;

  if (!recipientEmail || !recipientEmail.includes('@')) {
    return { success: false, message: 'Invalid recipient email address.' };
  }

  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail.trim())}`;

  const formattedData: Record<string, any> = {
    _subject: `[RidePartner Alert] ${title}`,
    _template: 'table',
    _captcha: 'false',
    eventType,
    timestamp: new Date().toLocaleString(),
    ...data,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    const result = await response.json();
    if (response.ok) {
      return { success: true, message: result.message || 'Notification dispatched to your email!' };
    } else {
      return { success: false, message: result.message || 'Failed to dispatch email.' };
    }
  } catch (error: any) {
    console.error('Error dispatching email notification:', error);
    return { success: false, message: error?.message || 'Network error while sending email notification.' };
  }
}

/**
 * Exports data as a CSV file to the user's local device Downloads folder.
 */
export function exportToCSV(rides: Ride[], requests: RideRequest[]): void {
  const sanitize = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;

  // 1. Rides CSV
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Type,ID,Driver/Passenger,Contact Phone,Vehicle,Origin,Destination,Waypoints,Date,Time,Fare,Seats,Status/Notes\n';

  rides.forEach((r) => {
    const row = [
      'Ride Offered',
      r.id,
      r.driver.name,
      r.driver.phone || 'N/A',
      `${r.vehicleType.toUpperCase()} - ${r.vehicleModel} (${r.vehicleNumberPlate || 'N/A'})`,
      r.origin,
      r.destination,
      (r.intermediateStops || []).join(' | '),
      r.date,
      r.departureTime,
      `₹${r.fare}`,
      `${r.seatsAvailable}/${r.totalSeats}`,
      r.notes || '',
    ].map(sanitize).join(',');
    csvContent += row + '\n';
  });

  requests.forEach((req) => {
    const row = [
      'Companion Request',
      req.id,
      req.passengerName,
      'N/A',
      req.pricingModel,
      req.pickupLocation,
      req.requestedDropoff,
      req.isCustomDropoff ? 'Custom Dropoff' : 'Exact Route',
      req.createdAt,
      'Pending Confirmation',
      `Offered: ₹${req.offeredFare} (Original: ₹${req.originalFare})`,
      '1',
      `Status: ${req.status} - Message: ${req.message || ''}`,
    ].map(sanitize).join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ridepartner_data_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports full JSON backup to user's local device.
 */
export function exportToJSON(data: {
  user: UserProfile;
  rides: Ride[];
  requests: RideRequest[];
  pastRides: PastRide[];
}): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `ridepartner_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
