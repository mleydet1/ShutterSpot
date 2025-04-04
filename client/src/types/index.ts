// User related types
export type UserRole = 'administrator' | 'photographer' | 'assistant' | 'client';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  profileImageUrl?: string;
  initials: string;
}

// Client related types
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Shoot related types
export type ShootStatus = 'pending' | 'confirmed' | 'deposit_paid' | 'completed' | 'cancelled';

export interface Shoot {
  id: number;
  title: string;
  clientId: number;
  client?: Client;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: ShootStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Proposal related types
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';

export interface ProposalPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  includedItems: string[];
}

export interface Proposal {
  id: number;
  clientId: number;
  client?: Client;
  title: string;
  message: string;
  packages: ProposalPackage[];
  status: ProposalStatus;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice related types
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  client?: Client;
  shootId?: number;
  shoot?: Shoot;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// Gallery related types
export type GalleryStatus = 'draft' | 'password_protected' | 'public' | 'archived';

export interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  filename: string;
  size: number;
  width: number;
  height: number;
  uploadedAt: string;
}

export interface Gallery {
  id: number;
  title: string;
  clientId: number;
  client?: Client;
  shootId?: number;
  shoot?: Shoot;
  coverImage?: string;
  photos: Photo[];
  status: GalleryStatus;
  password?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Email related types
export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Workflow related types
export type WorkflowTriggerType = 'booking_confirmed' | 'shoot_completed' | 'invoice_sent' | 'invoice_paid' | 'gallery_delivered';
export type WorkflowActionType = 'send_email' | 'create_todo' | 'send_reminder';

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  delay?: number; // In days
}

export interface WorkflowAction {
  type: WorkflowActionType;
  emailTemplateId?: number;
  message?: string;
  reminderDays?: number;
}

export interface Workflow {
  id: number;
  name: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Task and Activity related types
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  dueDate?: string;
  completed: boolean;
  priority: TaskPriority;
  relatedClientId?: number;
  relatedShootId?: number;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'client_added' | 'booking_confirmed' | 'invoice_paid' | 'proposal_sent' | 'gallery_uploaded';

export interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  userId: number;
  user?: User;
  relatedClientId?: number;
  relatedShootId?: number;
  relatedInvoiceId?: number;
  relatedProposalId?: number;
  relatedGalleryId?: number;
  timestamp: string;
}

// Business stats and metrics
export interface BusinessMetrics {
  shootsBooked: number;
  shootsBookedGrowth: number;
  revenue: number;
  revenueGrowth: number;
  newClients: number;
  newClientsGrowth: number;
  pendingInvoices: number;
  pendingInvoicesGrowth: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface BookingData {
  month: string;
  bookings: number;
}
