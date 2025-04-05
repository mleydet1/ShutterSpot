import React, { useState } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedWorkflowModal } from "@/components/workflows/enhanced-workflow-modal";
import { WorkflowData } from "@/components/workflows/workflow-builder";
import { Camera, Calendar, FileText, CreditCard, Image, Mail, Clock, ArrowLeft } from "lucide-react";

export default function WorkflowTemplatesPage() {
  const [_, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pre-built workflow templates
  const workflowTemplates = [
    {
      id: "wedding-client-workflow",
      name: "Wedding Client Workflow",
      description: "Complete workflow for wedding clients from inquiry to delivery",
      icon: <Camera className="h-10 w-10 text-primary" />,
      category: "Wedding",
      complexity: "Advanced",
      steps: 8,
      template: {
        name: "Wedding Client Workflow",
        description: "Complete workflow for wedding clients from inquiry to delivery",
        isActive: true,
        steps: [
          {
            id: "step1",
            trigger: {
              id: "trigger1",
              type: "event",
              eventType: "new_lead",
              conditions: [
                {
                  id: "cond1",
                  field: "shoot_type",
                  operator: "equals",
                  value: "Wedding"
                }
              ]
            },
            actions: [
              {
                id: "action1",
                type: "send_email",
                config: {
                  templateId: "wedding_welcome"
                },
                delay: 0
              },
              {
                id: "action2",
                type: "create_task",
                config: {
                  taskName: "Follow up with wedding inquiry",
                  assignee: "current_user",
                  dueInDays: 2
                },
                delay: 2
              }
            ]
          },
          {
            id: "step2",
            trigger: {
              id: "trigger2",
              type: "event",
              eventType: "proposal_accepted",
              conditions: []
            },
            actions: [
              {
                id: "action3",
                type: "send_contract",
                config: {
                  contractTemplate: "wedding_contract"
                },
                delay: 0
              },
              {
                id: "action4",
                type: "send_invoice",
                config: {
                  invoiceType: "deposit",
                  amount: "50%"
                },
                delay: 0
              }
            ]
          },
          {
            id: "step3",
            trigger: {
              id: "trigger3",
              type: "time",
              timeReference: "shoot_date",
              timeOffset: 14,
              timeDirection: "before" as "before",
              conditions: []
            },
            actions: [
              {
                id: "action5",
                type: "send_questionnaire",
                config: {
                  questionnaireId: "wedding_details"
                },
                delay: 0
              }
            ]
          }
        ]
      }
    },
    {
      id: "portrait-session-workflow",
      name: "Portrait Session Workflow",
      description: "Streamlined workflow for portrait sessions",
      icon: <Camera className="h-10 w-10 text-violet-500" />,
      category: "Portrait",
      complexity: "Intermediate",
      steps: 5,
      template: {
        name: "Portrait Session Workflow",
        description: "Streamlined workflow for portrait sessions",
        isActive: true,
        steps: [
          {
            id: "step1",
            trigger: {
              id: "trigger1",
              type: "event",
              eventType: "new_lead",
              conditions: [
                {
                  id: "cond1",
                  field: "shoot_type",
                  operator: "equals",
                  value: "Portrait"
                }
              ]
            },
            actions: [
              {
                id: "action1",
                type: "send_email",
                config: {
                  templateId: "portrait_welcome"
                },
                delay: 0
              }
            ]
          },
          {
            id: "step2",
            trigger: {
              id: "trigger2",
              type: "time",
              timeReference: "shoot_date",
              timeOffset: 2,
              timeDirection: "before" as "before",
              conditions: []
            },
            actions: [
              {
                id: "action2",
                type: "send_email",
                config: {
                  templateId: "session_prep"
                },
                delay: 0
              }
            ]
          }
        ]
      }
    },
    {
      id: "gallery-delivery-workflow",
      name: "Gallery Delivery & Follow-up",
      description: "Deliver galleries and encourage print sales",
      icon: <Image className="h-10 w-10 text-blue-500" />,
      category: "Post-Production",
      complexity: "Simple",
      steps: 3,
      template: {
        name: "Gallery Delivery & Follow-up",
        description: "Deliver galleries and encourage print sales",
        isActive: true,
        steps: [
          {
            id: "step1",
            trigger: {
              id: "trigger1",
              type: "event",
              eventType: "gallery_delivered",
              conditions: []
            },
            actions: [
              {
                id: "action1",
                type: "send_email",
                config: {
                  templateId: "gallery_delivery"
                },
                delay: 0
              }
            ]
          },
          {
            id: "step2",
            trigger: {
              id: "trigger2",
              type: "time",
              timeReference: "gallery_delivery_date",
              timeOffset: 7,
              timeDirection: "after" as "after",
              conditions: []
            },
            actions: [
              {
                id: "action2",
                type: "send_email",
                config: {
                  templateId: "print_reminder"
                },
                delay: 0
              }
            ]
          }
        ]
      }
    },
    {
      id: "invoice-reminder-workflow",
      name: "Invoice Payment Reminders",
      description: "Automated payment reminders for outstanding invoices",
      icon: <CreditCard className="h-10 w-10 text-green-500" />,
      category: "Billing",
      complexity: "Simple",
      steps: 3,
      template: {
        name: "Invoice Payment Reminders",
        description: "Automated payment reminders for outstanding invoices",
        isActive: true,
        steps: [
          {
            id: "step1",
            trigger: {
              id: "trigger1",
              type: "time",
              timeReference: "invoice_due_date",
              timeOffset: 7,
              timeDirection: "before" as "before",
              conditions: [
                {
                  id: "cond1",
                  field: "payment_status",
                  operator: "equals",
                  value: "Unpaid"
                }
              ]
            },
            actions: [
              {
                id: "action1",
                type: "send_email",
                config: {
                  templateId: "payment_reminder"
                },
                delay: 0
              }
            ]
          },
          {
            id: "step2",
            trigger: {
              id: "trigger2",
              type: "time",
              timeReference: "invoice_due_date",
              timeOffset: 1,
              timeDirection: "before" as "before",
              conditions: [
                {
                  id: "cond1",
                  field: "payment_status",
                  operator: "equals",
                  value: "Unpaid"
                }
              ]
            },
            actions: [
              {
                id: "action2",
                type: "send_email",
                config: {
                  templateId: "payment_reminder_urgent"
                },
                delay: 0
              }
            ]
          }
        ]
      }
    },
    {
      id: "mini-session-workflow",
      name: "Mini Session Workflow",
      description: "Streamlined workflow for mini sessions",
      icon: <Clock className="h-10 w-10 text-amber-500" />,
      category: "Mini Sessions",
      complexity: "Intermediate",
      steps: 4,
      template: {
        name: "Mini Session Workflow",
        description: "Streamlined workflow for mini sessions",
        isActive: true,
        steps: [
          {
            id: "step1",
            trigger: {
              id: "trigger1",
              type: "event",
              eventType: "new_lead",
              conditions: [
                {
                  id: "cond1",
                  field: "shoot_type",
                  operator: "equals",
                  value: "Mini Session"
                }
              ]
            },
            actions: [
              {
                id: "action1",
                type: "send_email",
                config: {
                  templateId: "mini_session_welcome"
                },
                delay: 0
              },
              {
                id: "action2",
                type: "send_invoice",
                config: {
                  invoiceType: "full_payment"
                },
                delay: 0
              }
            ]
          }
        ]
      }
    },
    {
      id: "lead-nurture-workflow",
      name: "Lead Nurture Sequence",
      description: "Follow up with leads who haven't booked yet",
      icon: <Mail className="h-10 w-10 text-rose-500" />,
      category: "Marketing",
      complexity: "Advanced",
      steps: 6,
      template: {
        name: "Lead Nurture Sequence",
        description: "Follow up with leads who haven't booked yet",
        isActive: true,
        steps: [
          {
            id: "step1",
            trigger: {
              id: "trigger1",
              type: "event",
              eventType: "new_lead",
              conditions: []
            },
            actions: [
              {
                id: "action1",
                type: "send_email",
                config: {
                  templateId: "lead_welcome"
                },
                delay: 0
              }
            ]
          },
          {
            id: "step2",
            trigger: {
              id: "trigger2",
              type: "event",
              eventType: "email_opened",
              conditions: [
                {
                  id: "cond1",
                  field: "proposal_status",
                  operator: "not_equals",
                  value: "Accepted"
                }
              ]
            },
            actions: [
              {
                id: "action2",
                type: "send_email",
                config: {
                  templateId: "pricing_guide"
                },
                delay: 2
              }
            ]
          }
        ]
      }
    },
    {
      id: "client-birthday-workflow",
      name: "Client Birthday Greetings",
      description: "Send birthday wishes to past clients",
      icon: <Calendar className="h-10 w-10 text-indigo-500" />,
      category: "Client Care",
      complexity: "Simple",
      steps: 1,
      template: {
        name: "Client Birthday Greetings",
        description: "Send birthday wishes to past clients",
        isActive: true,
        steps: [
          {
            id: "step1",
            trigger: {
              id: "trigger1",
              type: "time",
              timeReference: "client_birthday",
              timeOffset: 0,
              timeDirection: "before" as "before",
              conditions: []
            },
            actions: [
              {
                id: "action1",
                type: "send_email",
                config: {
                  templateId: "birthday_greeting"
                },
                delay: 0
              }
            ]
          }
        ]
      }
    },
    {
      id: "contract-reminder-workflow",
      name: "Contract Signing Reminders",
      description: "Remind clients to sign their contracts",
      icon: <FileText className="h-10 w-10 text-orange-500" />,
      category: "Contracts",
      complexity: "Simple",
      steps: 2,
      template: {
        name: "Contract Signing Reminders",
        description: "Remind clients to sign their contracts",
        isActive: true,
        steps: [
          {
            id: "step1",
            trigger: {
              id: "trigger1",
              type: "time",
              timeReference: "contract_date",
              timeOffset: 3,
              timeDirection: "after" as "after",
              conditions: [
                {
                  id: "cond1",
                  field: "contract_status",
                  operator: "equals",
                  value: "Sent"
                }
              ]
            },
            actions: [
              {
                id: "action1",
                type: "send_email",
                config: {
                  templateId: "contract_reminder"
                },
                delay: 0
              }
            ]
          }
        ]
      }
    }
  ];

  // Handle template selection
  const handleSelectTemplate = (template: WorkflowData) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  // Group templates by category
  const groupedTemplates = workflowTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof workflowTemplates>);

  return (
    <MainLayout
      title="Workflow Templates"
      description="Pre-built automation workflows for photographers"
    >
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/workflows")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Workflows
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workflow Templates</CardTitle>
            <CardDescription>
              Start with a pre-built workflow and customize it to fit your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              These templates are designed to help you automate common photography business tasks.
              Select a template to view its details and customize it for your specific needs.
              Each template can be modified before saving to your workflow library.
            </p>
          </CardContent>
        </Card>
      </div>

      {Object.entries(groupedTemplates).map(([category, templates]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{category} Workflows</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded-md bg-gray-50">{template.icon}</div>
                    <Badge variant="outline" className="text-xs">
                      {template.complexity}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.steps} automation steps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <Button
                    className="w-full"
                    onClick={() => handleSelectTemplate(template.template)}
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {isModalOpen && selectedTemplate && (
        <EnhancedWorkflowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialWorkflow={selectedTemplate}
          mode="create"
        />
      )}
    </MainLayout>
  );
}
