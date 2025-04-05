import {
  users, clients, shoots, proposals, invoices, galleries, 
  emailTemplates, workflows, tasks, activities,
  type User, type InsertUser, 
  type Client, type InsertClient,
  type Shoot, type InsertShoot,
  type Proposal, type InsertProposal,
  type Invoice, type InsertInvoice,
  type Gallery, type InsertGallery,
  type EmailTemplate, type InsertEmailTemplate,
  type Workflow, type InsertWorkflow,
  type Task, type InsertTask,
  type Activity, type InsertActivity
} from "@shared/schema";

// Storage interface with all necessary CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Shoot operations
  getShoot(id: number): Promise<Shoot | undefined>;
  getShoots(): Promise<Shoot[]>;
  getShootsByClient(clientId: number): Promise<Shoot[]>;
  getUpcomingShoots(limit?: number): Promise<Shoot[]>;
  createShoot(shoot: InsertShoot): Promise<Shoot>;
  updateShoot(id: number, shoot: Partial<InsertShoot>): Promise<Shoot | undefined>;
  deleteShoot(id: number): Promise<boolean>;
  
  // Proposal operations
  getProposal(id: number): Promise<Proposal | undefined>;
  getProposals(): Promise<Proposal[]>;
  getProposalsByClient(clientId: number): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: number, proposal: Partial<InsertProposal>): Promise<Proposal | undefined>;
  deleteProposal(id: number): Promise<boolean>;
  
  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoices(): Promise<Invoice[]>;
  getInvoicesByClient(clientId: number): Promise<Invoice[]>;
  getPendingInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  
  // Gallery operations
  getGallery(id: number): Promise<Gallery | undefined>;
  getGalleries(): Promise<Gallery[]>;
  getGalleriesByClient(clientId: number): Promise<Gallery[]>;
  createGallery(gallery: InsertGallery): Promise<Gallery>;
  updateGallery(id: number, gallery: Partial<InsertGallery>): Promise<Gallery | undefined>;
  deleteGallery(id: number): Promise<boolean>;
  
  // Email Template operations
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplatesByCategory(category: string): Promise<EmailTemplate[]>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  
  // Workflow operations
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflows(): Promise<Workflow[]>;
  getActiveWorkflows(): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
  getIncompleteTasks(): Promise<Task[]>;
  getTasksByDueDate(dueDate: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard metrics
  getBusinessMetrics(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private shoots: Map<number, Shoot>;
  private proposals: Map<number, Proposal>;
  private invoices: Map<number, Invoice>;
  private galleries: Map<number, Gallery>;
  private emailTemplates: Map<number, EmailTemplate>;
  private workflows: Map<number, Workflow>;
  private tasks: Map<number, Task>;
  private activities: Map<number, Activity>;
  
  private userId: number;
  private clientId: number;
  private shootId: number;
  private proposalId: number;
  private invoiceId: number;
  private galleryId: number;
  private emailTemplateId: number;
  private workflowId: number;
  private taskId: number;
  private activityId: number;
  
  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.shoots = new Map();
    this.proposals = new Map();
    this.invoices = new Map();
    this.galleries = new Map();
    this.emailTemplates = new Map();
    this.workflows = new Map();
    this.tasks = new Map();
    this.activities = new Map();
    
    this.userId = 1;
    this.clientId = 1;
    this.shootId = 1;
    this.proposalId = 1;
    this.invoiceId = 1;
    this.galleryId = 1;
    this.emailTemplateId = 1;
    this.workflowId = 1;
    this.taskId = 1;
    this.activityId = 1;
    
    // Initialize with an admin user
    this.createUser({
      username: "admin",
      password: "password",
      fullName: "Jane Doe",
      email: "admin@shutterspot.com",
      role: "administrator",
      initials: "JD"
    });
    
    // Add some initial clients
    this.createClient({
      name: "Sarah & Michael Johnson",
      email: "johnson@example.com",
      phone: "(555) 123-4567",
      address: "123 Wedding Lane",
      city: "Beachville",
      state: "CA",
      zipCode: "90210"
    });
    
    this.createClient({
      name: "Acme Corporation",
      email: "contact@acmecorp.com",
      phone: "(555) 987-6543",
      address: "456 Business Blvd",
      city: "Metropolis",
      state: "NY",
      zipCode: "10001"
    });
    
    this.createClient({
      name: "The Smith Family",
      email: "smith@example.com",
      phone: "(555) 456-7890",
      address: "789 Family Road",
      city: "Suburbia",
      state: "TX",
      zipCode: "75001"
    });
    
    // Add some shoots
    this.createShoot({
      title: "Wedding Photo Session",
      clientId: 1,
      date: "2023-06-15",
      startTime: "10:00:00",
      endTime: "14:00:00",
      location: "Sunset Beach Park, 123 Coastal Highway",
      status: "confirmed"
    });
    
    this.createShoot({
      title: "Corporate Headshots",
      clientId: 2,
      date: "2023-06-18",
      startTime: "09:00:00",
      endTime: "16:00:00",
      location: "Acme Corp, 456 Business Blvd, Suite 200",
      status: "deposit_paid"
    });
    
    this.createShoot({
      title: "Family Portrait Session",
      clientId: 3,
      date: "2023-06-22",
      startTime: "16:30:00",
      endTime: "18:30:00",
      location: "Golden Hour Park, 789 Scenic Drive",
      status: "pending"
    });
    
    // Add some tasks
    this.createTask({
      title: "Send invoice to Johnson wedding",
      dueDate: "2023-06-10",
      completed: false,
      priority: "high",
      relatedClientId: 1,
      relatedShootId: 1
    });
    
    this.createTask({
      title: "Edit & deliver Smith family photos",
      dueDate: "2023-06-12",
      completed: false,
      priority: "medium",
      relatedClientId: 3
    });
    
    this.createTask({
      title: "Follow up with Acme Corp proposal",
      dueDate: "2023-06-13",
      completed: false,
      priority: "medium",
      relatedClientId: 2
    });
    
    this.createTask({
      title: "Order new backdrop for studio",
      dueDate: "2023-06-15",
      completed: false,
      priority: "low"
    });
    
    // Add some activities
    this.createActivity({
      type: "booking_confirmed",
      description: "Sarah Johnson confirmed their booking",
      userId: 1,
      relatedClientId: 1,
      relatedShootId: 1
    });
    
    this.createActivity({
      type: "invoice_paid",
      description: "Acme Corp paid invoice #INV-2023-05",
      userId: 1,
      relatedClientId: 2
    });
    
    this.createActivity({
      type: "proposal_sent",
      description: "Sent proposal to The Smith Family",
      userId: 1,
      relatedClientId: 3
    });
    
    this.createActivity({
      type: "gallery_uploaded",
      description: "Uploaded 25 photos to Davis wedding gallery",
      userId: 1
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date().toISOString();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const now = new Date().toISOString();
    const client: Client = {
      ...insertClient,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.clients.set(id, client);
    return client;
  }
  
  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = await this.getClient(id);
    if (!client) return undefined;
    
    const updatedClient: Client = {
      ...client,
      ...clientData,
      updatedAt: new Date().toISOString()
    };
    
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }
  
  // Shoot operations
  async getShoot(id: number): Promise<Shoot | undefined> {
    return this.shoots.get(id);
  }
  
  async getShoots(): Promise<Shoot[]> {
    return Array.from(this.shoots.values());
  }
  
  async getShootsByClient(clientId: number): Promise<Shoot[]> {
    return Array.from(this.shoots.values()).filter(shoot => shoot.clientId === clientId);
  }
  
  async getUpcomingShoots(limit: number = 10): Promise<Shoot[]> {
    const now = new Date();
    return Array.from(this.shoots.values())
      .filter(shoot => new Date(shoot.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }
  
  async createShoot(insertShoot: InsertShoot): Promise<Shoot> {
    const id = this.shootId++;
    const now = new Date().toISOString();
    const shoot: Shoot = {
      ...insertShoot,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.shoots.set(id, shoot);
    return shoot;
  }
  
  async updateShoot(id: number, shootData: Partial<InsertShoot>): Promise<Shoot | undefined> {
    const shoot = await this.getShoot(id);
    if (!shoot) return undefined;
    
    const updatedShoot: Shoot = {
      ...shoot,
      ...shootData,
      updatedAt: new Date().toISOString()
    };
    
    this.shoots.set(id, updatedShoot);
    return updatedShoot;
  }
  
  async deleteShoot(id: number): Promise<boolean> {
    return this.shoots.delete(id);
  }
  
  // Proposal operations
  async getProposal(id: number): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }
  
  async getProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values());
  }
  
  async getProposalsByClient(clientId: number): Promise<Proposal[]> {
    return Array.from(this.proposals.values()).filter(proposal => proposal.clientId === clientId);
  }
  
  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = this.proposalId++;
    const now = new Date().toISOString();
    const proposal: Proposal = {
      ...insertProposal,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.proposals.set(id, proposal);
    return proposal;
  }
  
  async updateProposal(id: number, proposalData: Partial<InsertProposal>): Promise<Proposal | undefined> {
    const proposal = await this.getProposal(id);
    if (!proposal) return undefined;
    
    const updatedProposal: Proposal = {
      ...proposal,
      ...proposalData,
      updatedAt: new Date().toISOString()
    };
    
    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }
  
  async deleteProposal(id: number): Promise<boolean> {
    return this.proposals.delete(id);
  }
  
  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }
  
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }
  
  async getInvoicesByClient(clientId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(invoice => invoice.clientId === clientId);
  }
  
  async getPendingInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      invoice => invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'partial'
    );
  }
  
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceId++;
    const now = new Date().toISOString();
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.invoices.set(id, invoice);
    return invoice;
  }
  
  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = await this.getInvoice(id);
    if (!invoice) return undefined;
    
    const updatedInvoice: Invoice = {
      ...invoice,
      ...invoiceData,
      updatedAt: new Date().toISOString()
    };
    
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }
  
  // Gallery operations
  async getGallery(id: number): Promise<Gallery | undefined> {
    return this.galleries.get(id);
  }
  
  async getGalleries(): Promise<Gallery[]> {
    return Array.from(this.galleries.values());
  }
  
  async getGalleriesByClient(clientId: number): Promise<Gallery[]> {
    return Array.from(this.galleries.values()).filter(gallery => gallery.clientId === clientId);
  }
  
  async createGallery(insertGallery: InsertGallery): Promise<Gallery> {
    const id = this.galleryId++;
    const now = new Date().toISOString();
    const gallery: Gallery = {
      ...insertGallery,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.galleries.set(id, gallery);
    return gallery;
  }
  
  async updateGallery(id: number, galleryData: Partial<InsertGallery>): Promise<Gallery | undefined> {
    const gallery = await this.getGallery(id);
    if (!gallery) return undefined;
    
    const updatedGallery: Gallery = {
      ...gallery,
      ...galleryData,
      updatedAt: new Date().toISOString()
    };
    
    this.galleries.set(id, updatedGallery);
    return updatedGallery;
  }
  
  async deleteGallery(id: number): Promise<boolean> {
    return this.galleries.delete(id);
  }
  
  // Email Template operations
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    return this.emailTemplates.get(id);
  }
  
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values());
  }
  
  async getEmailTemplatesByCategory(category: string): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values()).filter(
      template => template.category === category
    );
  }
  
  async createEmailTemplate(insertTemplate: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = this.emailTemplateId++;
    const now = new Date().toISOString();
    const template: EmailTemplate = {
      ...insertTemplate,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.emailTemplates.set(id, template);
    return template;
  }
  
  async updateEmailTemplate(id: number, templateData: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const template = await this.getEmailTemplate(id);
    if (!template) return undefined;
    
    const updatedTemplate: EmailTemplate = {
      ...template,
      ...templateData,
      updatedAt: new Date().toISOString()
    };
    
    this.emailTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  async deleteEmailTemplate(id: number): Promise<boolean> {
    return this.emailTemplates.delete(id);
  }
  
  // Workflow operations
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }
  
  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }
  
  async getActiveWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(workflow => workflow.isActive);
  }
  
  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowId++;
    const now = new Date().toISOString();
    const workflow: Workflow = {
      ...insertWorkflow,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.workflows.set(id, workflow);
    return workflow;
  }
  
  async updateWorkflow(id: number, workflowData: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const workflow = await this.getWorkflow(id);
    if (!workflow) return undefined;
    
    const updatedWorkflow: Workflow = {
      ...workflow,
      ...workflowData,
      updatedAt: new Date().toISOString()
    };
    
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }
  
  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }
  
  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getIncompleteTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => !task.completed);
  }
  
  async getTasksByDueDate(dueDate: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.dueDate === dueDate
    );
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const now = new Date().toISOString();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    const updatedTask: Task = {
      ...task,
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivities(limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      activity => activity.userId === userId
    );
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      timestamp: new Date().toISOString()
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Dashboard metrics
  async getBusinessMetrics(): Promise<any> {
    return {
      shootsBooked: 12,
      shootsBookedGrowth: 20,
      revenue: 4250,
      revenueGrowth: 15,
      newClients: 8,
      newClientsGrowth: 12,
      pendingInvoices: 1840,
      pendingInvoicesGrowth: -5
    };
  }
}

export const storage = new MemStorage();
