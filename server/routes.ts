import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertClientSchema,
  insertShootSchema,
  insertProposalSchema,
  insertInvoiceSchema,
  insertGallerySchema,
  insertEmailTemplateSchema,
  insertWorkflowSchema,
  insertTaskSchema,
  insertActivitySchema
} from "@shared/schema";
import { 
  getGoogleAuthUrl, 
  handleGoogleAuthCallback, 
  addShootToGoogleCalendar,
  generateICalForShoot,
  generateICalForAllShoots,
  downloadICalFile
} from "./services/calendar";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userWithoutPassword = {
      ...user,
      password: undefined
    };
    
    res.json(userWithoutPassword);
  });
  
  // Client routes
  app.get('/api/clients', async (req: Request, res: Response) => {
    const clients = await storage.getClients();
    res.json(clients);
  });
  
  app.get('/api/clients/:id', async (req: Request, res: Response) => {
    const clientId = parseInt(req.params.id);
    const client = await storage.getClient(clientId);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  });
  
  app.post('/api/clients', async (req: Request, res: Response) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const newClient = await storage.createClient(clientData);
      res.status(201).json(newClient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid client data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create client' });
    }
  });
  
  app.put('/api/clients/:id', async (req: Request, res: Response) => {
    const clientId = parseInt(req.params.id);
    
    try {
      const clientData = insertClientSchema.partial().parse(req.body);
      const updatedClient = await storage.updateClient(clientId, clientData);
      
      if (!updatedClient) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      res.json(updatedClient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid client data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update client' });
    }
  });
  
  app.delete('/api/clients/:id', async (req: Request, res: Response) => {
    const clientId = parseInt(req.params.id);
    const deleted = await storage.deleteClient(clientId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.status(204).end();
  });
  
  // Shoot routes
  app.get('/api/shoots', async (req: Request, res: Response) => {
    const shoots = await storage.getShoots();
    res.json(shoots);
  });
  
  app.get('/api/shoots/upcoming', async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const shoots = await storage.getUpcomingShoots(limit);
    res.json(shoots);
  });
  
  app.get('/api/shoots/:id', async (req: Request, res: Response) => {
    const shootId = parseInt(req.params.id);
    const shoot = await storage.getShoot(shootId);
    
    if (!shoot) {
      return res.status(404).json({ message: 'Shoot not found' });
    }
    
    res.json(shoot);
  });
  
  app.get('/api/clients/:id/shoots', async (req: Request, res: Response) => {
    const clientId = parseInt(req.params.id);
    const shoots = await storage.getShootsByClient(clientId);
    res.json(shoots);
  });
  
  app.post('/api/shoots', async (req: Request, res: Response) => {
    try {
      const shootData = insertShootSchema.parse(req.body);
      const newShoot = await storage.createShoot(shootData);
      res.status(201).json(newShoot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid shoot data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create shoot' });
    }
  });
  
  app.put('/api/shoots/:id', async (req: Request, res: Response) => {
    const shootId = parseInt(req.params.id);
    
    try {
      const shootData = insertShootSchema.partial().parse(req.body);
      const updatedShoot = await storage.updateShoot(shootId, shootData);
      
      if (!updatedShoot) {
        return res.status(404).json({ message: 'Shoot not found' });
      }
      
      res.json(updatedShoot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid shoot data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update shoot' });
    }
  });
  
  app.delete('/api/shoots/:id', async (req: Request, res: Response) => {
    const shootId = parseInt(req.params.id);
    const deleted = await storage.deleteShoot(shootId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Shoot not found' });
    }
    
    res.status(204).end();
  });
  
  // Task routes
  app.get('/api/tasks', async (req: Request, res: Response) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });
  
  app.get('/api/tasks/incomplete', async (req: Request, res: Response) => {
    const tasks = await storage.getIncompleteTasks();
    res.json(tasks);
  });
  
  app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid task data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create task' });
    }
  });
  
  app.put('/api/tasks/:id', async (req: Request, res: Response) => {
    const taskId = parseInt(req.params.id);
    
    try {
      const taskData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(taskId, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid task data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update task' });
    }
  });
  
  // Activity routes
  app.get('/api/activities', async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const activities = await storage.getActivities(limit);
    res.json(activities);
  });
  
  app.post('/api/activities', async (req: Request, res: Response) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const newActivity = await storage.createActivity(activityData);
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid activity data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create activity' });
    }
  });
  
  // Business metrics
  app.get('/api/metrics', async (req: Request, res: Response) => {
    const metrics = await storage.getBusinessMetrics();
    res.json(metrics);
  });
  
  // Calendar Integration Routes
  
  // Google Calendar Auth URL
  app.get('/api/calendar/google/auth', async (req: Request, res: Response) => {
    try {
      const authUrl = getGoogleAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error('Error generating Google Calendar auth URL:', error);
      res.status(500).json({ message: 'Failed to generate authorization URL' });
    }
  });
  
  // Google Calendar OAuth Callback
  app.get('/api/calendar/google/callback', async (req: Request, res: Response) => {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Authorization code is required' });
    }
    
    try {
      const tokens = await handleGoogleAuthCallback(code);
      
      // In a real application, you would store these tokens in your database
      // associated with the current user
      
      res.json({ 
        message: 'Google Calendar successfully connected',
        accessToken: tokens.access_token 
      });
    } catch (error) {
      console.error('Error handling Google Calendar callback:', error);
      res.status(500).json({ message: 'Failed to connect to Google Calendar' });
    }
  });
  
  // Add a shoot to Google Calendar
  app.post('/api/calendar/google/shoots/:id', async (req: Request, res: Response) => {
    const shootId = parseInt(req.params.id);
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ message: 'Access token is required' });
    }
    
    try {
      const shoot = await storage.getShoot(shootId);
      
      if (!shoot) {
        return res.status(404).json({ message: 'Shoot not found' });
      }
      
      const eventId = await addShootToGoogleCalendar(shoot, accessToken);
      
      res.json({ 
        message: 'Shoot added to Google Calendar',
        eventId 
      });
    } catch (error) {
      console.error('Error adding shoot to Google Calendar:', error);
      res.status(500).json({ message: 'Failed to add shoot to Google Calendar' });
    }
  });
  
  // Download iCal for a single shoot
  app.get('/api/calendar/ical/shoots/:id', async (req: Request, res: Response) => {
    const shootId = parseInt(req.params.id);
    
    try {
      const shoot = await storage.getShoot(shootId);
      
      if (!shoot) {
        return res.status(404).json({ message: 'Shoot not found' });
      }
      
      const icalData = generateICalForShoot(shoot);
      const clientName = shoot.clientName || 'client';
      const sanitizedTitle = (shoot.title || 'shoot').replace(/[^a-zA-Z0-9]/g, '_');
      
      downloadICalFile(req, res, icalData, `${sanitizedTitle}_${clientName}.ics`);
    } catch (error) {
      console.error('Error generating iCal for shoot:', error);
      res.status(500).json({ message: 'Failed to generate iCal file' });
    }
  });
  
  // Download iCal for all shoots
  app.get('/api/calendar/ical/shoots', async (req: Request, res: Response) => {
    try {
      const shoots = await storage.getShoots();
      const icalData = generateICalForAllShoots(shoots);
      
      downloadICalFile(req, res, icalData, 'all_shoots.ics');
    } catch (error) {
      console.error('Error generating iCal for all shoots:', error);
      res.status(500).json({ message: 'Failed to generate iCal file' });
    }
  });
  
  // Download iCal for upcoming shoots
  app.get('/api/calendar/ical/shoots/upcoming', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const shoots = await storage.getUpcomingShoots(limit);
      const icalData = generateICalForAllShoots(shoots);
      
      downloadICalFile(req, res, icalData, 'upcoming_shoots.ics');
    } catch (error) {
      console.error('Error generating iCal for upcoming shoots:', error);
      res.status(500).json({ message: 'Failed to generate iCal file' });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
