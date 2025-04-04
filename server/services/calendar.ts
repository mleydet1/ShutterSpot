import { google, calendar_v3 } from 'googleapis';
import ical from 'ical-generator';
import { Shoot } from '@shared/schema';
import { Request, Response } from 'express';

// Initialize Google Calendar API
function getGoogleCalendarClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  return google.calendar({
    version: 'v3',
    auth: oauth2Client
  });
}

// Generate authorization URL for Google Calendar
export function getGoogleAuthUrl() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

// Handle Google OAuth callback and set tokens
export async function handleGoogleAuthCallback(code: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  // Here you would typically store these tokens in your database
  // associated with the current user
  return tokens;
}

// Add a shoot to Google Calendar
export async function addShootToGoogleCalendar(
  shoot: Shoot, 
  accessToken: string
): Promise<string> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Format the event details
    const startDateTime = new Date(shoot.date);
    const endDateTime = new Date(shoot.date);
    // Default shoot duration to 2 hours if not specified
    endDateTime.setHours(endDateTime.getHours() + (shoot.duration || 2));
    
    const event: calendar_v3.Schema$Event = {
      summary: shoot.title,
      description: shoot.description || '',
      location: shoot.location,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC'
      },
      reminders: {
        useDefault: true
      }
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });
    
    return response.data.id || '';
  } catch (error) {
    console.error('Error adding shoot to Google Calendar:', error);
    throw error;
  }
}

// Generate iCal file for a shoot
export function generateICalForShoot(shoot: Shoot): string {
  const cal = ical({
    name: 'Photography Shoots',
    prodId: { company: 'Photography Business', product: 'Shoot Manager' }
  });
  
  const startDateTime = new Date(shoot.date);
  const endDateTime = new Date(shoot.date);
  // Default shoot duration to 2 hours if not specified
  endDateTime.setHours(endDateTime.getHours() + (shoot.duration || 2));
  
  cal.createEvent({
    start: startDateTime,
    end: endDateTime,
    summary: shoot.title,
    description: shoot.description || '',
    location: shoot.location,
    url: `${process.env.APP_URL || ''}/shoots/${shoot.id}`
  });
  
  return cal.toString();
}

// Generate iCal file for all shoots
export function generateICalForAllShoots(shoots: Shoot[]): string {
  const cal = ical({
    name: 'Photography Shoots',
    prodId: { company: 'Photography Business', product: 'Shoot Manager' }
  });
  
  shoots.forEach(shoot => {
    const startDateTime = new Date(shoot.date);
    const endDateTime = new Date(shoot.date);
    // Default shoot duration to 2 hours if not specified
    endDateTime.setHours(endDateTime.getHours() + (shoot.duration || 2));
    
    cal.createEvent({
      start: startDateTime,
      end: endDateTime,
      summary: shoot.title,
      description: shoot.description || '',
      location: shoot.location,
      url: `${process.env.APP_URL || ''}/shoots/${shoot.id}`
    });
  });
  
  return cal.toString();
}

// Middleware to download an iCal file
export function downloadICalFile(req: Request, res: Response, icalData: string, filename: string) {
  res.setHeader('Content-Type', 'text/calendar');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(icalData);
}