import { User, Client, Shoot, Task, Activity, BusinessMetrics, RevenueData, BookingData } from "@/types";

// Mock data for the current user
export const currentUser: User = {
  id: 1,
  username: "admin",
  fullName: "Jane Doe",
  email: "admin@shutterspot.com",
  role: "administrator",
  initials: "JD"
};

// Mock data for business metrics
export const businessMetrics: BusinessMetrics = {
  shootsBooked: 12,
  shootsBookedGrowth: 20,
  revenue: 4250,
  revenueGrowth: 15,
  newClients: 8,
  newClientsGrowth: 12,
  pendingInvoices: 1840,
  pendingInvoicesGrowth: -5
};

// Mock data for clients
export const clients: Client[] = [
  {
    id: 1,
    name: "Sarah & Michael Johnson",
    email: "johnson@example.com",
    phone: "(555) 123-4567",
    address: "123 Wedding Lane",
    city: "Beachville",
    state: "CA",
    zipCode: "90210",
    createdAt: "2023-05-15T10:00:00Z",
    updatedAt: "2023-05-15T10:00:00Z"
  },
  {
    id: 2,
    name: "Acme Corporation",
    email: "contact@acmecorp.com",
    phone: "(555) 987-6543",
    address: "456 Business Blvd",
    city: "Metropolis",
    state: "NY",
    zipCode: "10001",
    createdAt: "2023-05-10T14:30:00Z",
    updatedAt: "2023-05-10T14:30:00Z"
  },
  {
    id: 3,
    name: "The Smith Family",
    email: "smith@example.com",
    phone: "(555) 456-7890",
    address: "789 Family Road",
    city: "Suburbia",
    state: "TX",
    zipCode: "75001",
    createdAt: "2023-05-05T09:15:00Z",
    updatedAt: "2023-05-05T09:15:00Z"
  }
];

// Mock data for upcoming shoots
export const upcomingShoots: Shoot[] = [
  {
    id: 1,
    title: "Wedding Photo Session",
    clientId: 1,
    client: clients[0],
    date: "2023-06-15",
    startTime: "10:00:00",
    endTime: "14:00:00",
    location: "Sunset Beach Park, 123 Coastal Highway",
    status: "confirmed",
    createdAt: "2023-05-15T10:00:00Z",
    updatedAt: "2023-05-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Corporate Headshots",
    clientId: 2,
    client: clients[1],
    date: "2023-06-18",
    startTime: "09:00:00",
    endTime: "16:00:00",
    location: "Acme Corp, 456 Business Blvd, Suite 200",
    status: "deposit_paid",
    createdAt: "2023-05-10T14:30:00Z",
    updatedAt: "2023-05-10T14:30:00Z"
  },
  {
    id: 3,
    title: "Family Portrait Session",
    clientId: 3,
    client: clients[2],
    date: "2023-06-22",
    startTime: "16:30:00",
    endTime: "18:30:00",
    location: "Golden Hour Park, 789 Scenic Drive",
    status: "pending",
    createdAt: "2023-05-05T09:15:00Z",
    updatedAt: "2023-05-05T09:15:00Z"
  }
];

// Mock data for tasks
export const tasks: Task[] = [
  {
    id: 1,
    title: "Send invoice to Johnson wedding",
    dueDate: "2023-06-10",
    completed: false,
    priority: "high",
    relatedClientId: 1,
    relatedShootId: 1,
    createdAt: "2023-06-05T10:00:00Z",
    updatedAt: "2023-06-05T10:00:00Z"
  },
  {
    id: 2,
    title: "Edit & deliver Smith family photos",
    dueDate: "2023-06-12",
    completed: false,
    priority: "medium",
    relatedClientId: 3,
    createdAt: "2023-06-05T10:05:00Z",
    updatedAt: "2023-06-05T10:05:00Z"
  },
  {
    id: 3,
    title: "Follow up with Acme Corp proposal",
    dueDate: "2023-06-13",
    completed: false,
    priority: "medium",
    relatedClientId: 2,
    createdAt: "2023-06-05T10:10:00Z",
    updatedAt: "2023-06-05T10:10:00Z"
  },
  {
    id: 4,
    title: "Order new backdrop for studio",
    dueDate: "2023-06-15",
    completed: false,
    priority: "low",
    createdAt: "2023-06-05T10:15:00Z",
    updatedAt: "2023-06-05T10:15:00Z"
  }
];

// Mock data for recent activities
export const recentActivities: Activity[] = [
  {
    id: 1,
    type: "booking_confirmed",
    description: "Sarah Johnson confirmed their booking",
    userId: 1,
    user: currentUser,
    relatedClientId: 1,
    relatedShootId: 1,
    timestamp: "2023-06-09T14:45:00Z"
  },
  {
    id: 2,
    type: "invoice_paid",
    description: "Acme Corp paid invoice #INV-2023-05",
    userId: 1,
    user: currentUser,
    relatedClientId: 2,
    timestamp: "2023-06-09T13:30:00Z"
  },
  {
    id: 3,
    type: "proposal_sent",
    description: "Sent proposal to The Smith Family",
    userId: 1,
    user: currentUser,
    relatedClientId: 3,
    timestamp: "2023-06-09T11:15:00Z"
  },
  {
    id: 4,
    type: "gallery_uploaded",
    description: "Uploaded 25 photos to Davis wedding gallery",
    userId: 1,
    user: currentUser,
    timestamp: "2023-06-08T16:20:00Z"
  }
];

// Mock data for revenue chart
export const revenueData: RevenueData[] = [
  { month: "Jan", revenue: 3200 },
  { month: "Feb", revenue: 3800 },
  { month: "Mar", revenue: 4100 },
  { month: "Apr", revenue: 3700 },
  { month: "May", revenue: 4250 },
  { month: "Jun", revenue: 5000 }
];

// Mock data for bookings chart
export const bookingData: BookingData[] = [
  { month: "Jan", bookings: 8 },
  { month: "Feb", bookings: 10 },
  { month: "Mar", bookings: 9 },
  { month: "Apr", bookings: 11 },
  { month: "May", bookings: 12 },
  { month: "Jun", bookings: 14 }
];
