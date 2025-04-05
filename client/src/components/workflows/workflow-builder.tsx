import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, ChevronDown, ChevronUp, Calendar, Clock, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
export interface WorkflowTrigger {
  id: string;
  type: string; // 'time' or 'event'
  eventType?: string; // For event-based triggers
  timeReference?: string; // For time-based triggers (shoot_date, invoice_due, etc.)
  timeOffset?: number; // For time-based triggers (days before/after)
  timeDirection?: 'before' | 'after'; // For time-based triggers
  conditions: WorkflowCondition[];
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface WorkflowAction {
  id: string;
  type: string;
  config: Record<string, any>;
  delay?: number; // Delay in days
}

export interface WorkflowStep {
  id: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
}

export interface WorkflowData {
  id?: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: WorkflowStep[];
}

// Constants
const EVENT_TRIGGERS = [
  { value: "new_lead", label: "New Lead Created" },
  { value: "proposal_accepted", label: "Proposal Accepted" },
  { value: "invoice_paid", label: "Invoice Paid" },
  { value: "contract_signed", label: "Contract Signed" },
  { value: "questionnaire_submitted", label: "Questionnaire Submitted" },
  { value: "email_opened", label: "Client Opened Email" },
  { value: "shoot_completed", label: "Shoot Marked as Completed" },
  { value: "gallery_delivered", label: "Gallery Delivered" },
  { value: "gallery_viewed", label: "Gallery Viewed by Client" }
];

const TIME_REFERENCES = [
  { value: "shoot_date", label: "Shoot Date" },
  { value: "invoice_due_date", label: "Invoice Due Date" },
  { value: "contract_date", label: "Contract Date" },
  { value: "gallery_delivery_date", label: "Gallery Delivery Date" }
];

const CONDITION_FIELDS = [
  { value: "shoot_type", label: "Shoot Type" },
  { value: "client_type", label: "Client Type" },
  { value: "lead_source", label: "Lead Source" },
  { value: "shoot_status", label: "Shoot Status" },
  { value: "payment_status", label: "Payment Status" },
  { value: "proposal_status", label: "Proposal Status" },
  { value: "gallery_status", label: "Gallery Status" },
  { value: "order_amount", label: "Order Amount" },
  { value: "client_city", label: "Client City" }
];

const CONDITION_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" }
];

const ACTION_TYPES = [
  { value: "send_email", label: "Send Email to Client" },
  { value: "send_questionnaire", label: "Send Questionnaire" },
  { value: "send_contract", label: "Send Contract" },
  { value: "send_invoice", label: "Send Invoice or Payment Reminder" },
  { value: "change_status", label: "Change Shoot Status or Stage" },
  { value: "create_task", label: "Create Task or To-Do" },
  { value: "update_tags", label: "Update Client Tags or Fields" },
  { value: "change_lead_status", label: "Mark Lead as Cold or Change Status" },
  { value: "change_assignee", label: "Change Assigned User" },
  { value: "email_campaign", label: "Add/Remove from Email Campaign" },
  { value: "trigger_workflow", label: "Trigger Another Workflow" }
];

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper function to get label from value
const getLabelFromValue = (options: { value: string; label: string }[], value: string) => {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
};

// Workflow Builder Component
interface WorkflowBuilderProps {
  initialWorkflow?: WorkflowData;
  onSave: (workflow: WorkflowData) => void;
}

export function WorkflowBuilder({ initialWorkflow, onSave }: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<WorkflowData>(
    initialWorkflow || {
      name: "",
      description: "",
      isActive: true,
      steps: []
    }
  );

  // Create a new empty step
  const createEmptyStep = (): WorkflowStep => ({
    id: generateId(),
    trigger: {
      id: generateId(),
      type: "event",
      eventType: "",
      conditions: []
    },
    actions: []
  });

  // Add a new step
  const addStep = () => {
    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, createEmptyStep()]
    });
  };

  // Remove a step
  const removeStep = (stepId: string) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.filter(step => step.id !== stepId)
    });
  };

  // Update step trigger
  const updateTrigger = (stepId: string, trigger: WorkflowTrigger) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map(step => 
        step.id === stepId ? { ...step, trigger } : step
      )
    });
  };

  // Add condition to a trigger
  const addCondition = (stepId: string) => {
    const newCondition: WorkflowCondition = {
      id: generateId(),
      field: "",
      operator: "equals",
      value: ""
    };

    setWorkflow({
      ...workflow,
      steps: workflow.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            trigger: {
              ...step.trigger,
              conditions: [...step.trigger.conditions, newCondition]
            }
          };
        }
        return step;
      })
    });
  };

  // Update condition
  const updateCondition = (stepId: string, conditionId: string, updates: Partial<WorkflowCondition>) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            trigger: {
              ...step.trigger,
              conditions: step.trigger.conditions.map(condition => 
                condition.id === conditionId 
                  ? { ...condition, ...updates } 
                  : condition
              )
            }
          };
        }
        return step;
      })
    });
  };

  // Remove condition
  const removeCondition = (stepId: string, conditionId: string) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            trigger: {
              ...step.trigger,
              conditions: step.trigger.conditions.filter(
                condition => condition.id !== conditionId
              )
            }
          };
        }
        return step;
      })
    });
  };

  // Add action to a step
  const addAction = (stepId: string) => {
    const newAction: WorkflowAction = {
      id: generateId(),
      type: "",
      config: {},
      delay: 0
    };

    setWorkflow({
      ...workflow,
      steps: workflow.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            actions: [...step.actions, newAction]
          };
        }
        return step;
      })
    });
  };

  // Update action
  const updateAction = (stepId: string, actionId: string, updates: Partial<WorkflowAction>) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            actions: step.actions.map(action => 
              action.id === actionId 
                ? { ...action, ...updates } 
                : action
            )
          };
        }
        return step;
      })
    });
  };

  // Remove action
  const removeAction = (stepId: string, actionId: string) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            actions: step.actions.filter(action => action.id !== actionId)
          };
        }
        return step;
      })
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(workflow);
  };

  // Render trigger configuration based on type
  const renderTriggerConfig = (step: WorkflowStep) => {
    const { trigger } = step;
    
    if (trigger.type === "event") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <div className="font-medium">When this happens:</div>
          </div>
          
          <select
            className="w-full p-2 border rounded-md"
            value={trigger.eventType || ""}
            onChange={(e) => updateTrigger(step.id, {
              ...trigger,
              eventType: e.target.value
            })}
          >
            <option value="">Select an event...</option>
            {EVENT_TRIGGERS.map(event => (
              <option key={event.value} value={event.value}>
                {event.label}
              </option>
            ))}
          </select>
        </div>
      );
    } else if (trigger.type === "time") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div className="font-medium">At a specific time:</div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="w-20 p-2 border rounded-md"
              min="1"
              max="365"
              value={trigger.timeOffset || ""}
              onChange={(e) => updateTrigger(step.id, {
                ...trigger,
                timeOffset: parseInt(e.target.value) || 0
              })}
              placeholder="Days"
            />
            
            <select
              className="p-2 border rounded-md"
              value={trigger.timeDirection || "before"}
              onChange={(e) => updateTrigger(step.id, {
                ...trigger,
                timeDirection: e.target.value as 'before' | 'after'
              })}
            >
              <option value="before">before</option>
              <option value="after">after</option>
            </select>
            
            <select
              className="flex-1 p-2 border rounded-md"
              value={trigger.timeReference || ""}
              onChange={(e) => updateTrigger(step.id, {
                ...trigger,
                timeReference: e.target.value
              })}
            >
              <option value="">Select a date reference...</option>
              {TIME_REFERENCES.map(ref => (
                <option key={ref.value} value={ref.value}>
                  {ref.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Render conditions for a trigger
  const renderConditions = (step: WorkflowStep) => {
    const { trigger } = step;
    
    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Only if these conditions are met:</div>
          <Button 
            type="button" 
            size="sm" 
            variant="outline"
            onClick={() => addCondition(step.id)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Condition
          </Button>
        </div>
        
        {trigger.conditions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No conditions - will run for all cases</p>
        ) : (
          <div className="space-y-2">
            {trigger.conditions.map(condition => (
              <div key={condition.id} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                <select
                  className="flex-1 p-2 border rounded-md"
                  value={condition.field}
                  onChange={(e) => updateCondition(step.id, condition.id, { field: e.target.value })}
                >
                  <option value="">Select field...</option>
                  {CONDITION_FIELDS.map(field => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
                
                <select
                  className="p-2 border rounded-md"
                  value={condition.operator}
                  onChange={(e) => updateCondition(step.id, condition.id, { operator: e.target.value })}
                >
                  {CONDITION_OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-md"
                  value={condition.value}
                  onChange={(e) => updateCondition(step.id, condition.id, { value: e.target.value })}
                  placeholder="Value"
                />
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(step.id, condition.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render action configuration
  const renderActionConfig = (step: WorkflowStep, action: WorkflowAction) => {
    // Different configuration options based on action type
    switch (action.type) {
      case "send_email":
        return (
          <div className="mt-2 pl-4 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Email Template:</label>
              <select
                className="flex-1 p-2 border rounded-md"
                value={action.config.templateId || ""}
                onChange={(e) => updateAction(step.id, action.id, { 
                  config: { ...action.config, templateId: e.target.value } 
                })}
              >
                <option value="">Select template...</option>
                <option value="welcome_email">Welcome Email</option>
                <option value="booking_confirmation">Booking Confirmation</option>
                <option value="payment_reminder">Payment Reminder</option>
                <option value="shoot_prep">Shoot Preparation</option>
                <option value="gallery_delivery">Gallery Delivery</option>
                <option value="thank_you">Thank You</option>
              </select>
            </div>
          </div>
        );
        
      case "create_task":
        return (
          <div className="mt-2 pl-4 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Task Name:</label>
              <input
                type="text"
                className="flex-1 p-2 border rounded-md"
                value={action.config.taskName || ""}
                onChange={(e) => updateAction(step.id, action.id, { 
                  config: { ...action.config, taskName: e.target.value } 
                })}
                placeholder="Task name"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Assignee:</label>
              <select
                className="flex-1 p-2 border rounded-md"
                value={action.config.assignee || ""}
                onChange={(e) => updateAction(step.id, action.id, { 
                  config: { ...action.config, assignee: e.target.value } 
                })}
              >
                <option value="">Select assignee...</option>
                <option value="current_user">Me</option>
                <option value="assistant">Assistant</option>
                <option value="second_shooter">Second Shooter</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Due in:</label>
              <input
                type="number"
                className="w-20 p-2 border rounded-md"
                min="0"
                value={action.config.dueInDays || ""}
                onChange={(e) => updateAction(step.id, action.id, { 
                  config: { ...action.config, dueInDays: parseInt(e.target.value) || 0 } 
                })}
                placeholder="Days"
              />
              <span className="text-sm">days</span>
            </div>
          </div>
        );
        
      case "change_status":
        return (
          <div className="mt-2 pl-4 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">New Status:</label>
              <select
                className="flex-1 p-2 border rounded-md"
                value={action.config.status || ""}
                onChange={(e) => updateAction(step.id, action.id, { 
                  config: { ...action.config, status: e.target.value } 
                })}
              >
                <option value="">Select status...</option>
                <option value="inquiry">Inquiry</option>
                <option value="booked">Booked</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        );
        
      // Add more action type configurations as needed
      
      default:
        return (
          <div className="mt-2 pl-4">
            <p className="text-sm text-gray-500 italic">
              Select an action type to configure additional options
            </p>
          </div>
        );
    }
  };

  // Render actions for a step
  const renderActions = (step: WorkflowStep) => {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Then do these actions:</div>
          <Button 
            type="button" 
            size="sm" 
            variant="outline"
            onClick={() => addAction(step.id)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Action
          </Button>
        </div>
        
        {step.actions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No actions added yet</p>
        ) : (
          <div className="space-y-4">
            {step.actions.map((action, index) => (
              <div key={action.id} className="border rounded-md p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    
                    <select
                      className="flex-1 p-2 border rounded-md"
                      value={action.type}
                      onChange={(e) => updateAction(step.id, action.id, { type: e.target.value })}
                    >
                      <option value="">Select an action...</option>
                      {ACTION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAction(step.id, action.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {action.type && renderActionConfig(step, action)}
                
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-sm font-medium">Delay:</label>
                  <input
                    type="number"
                    className="w-20 p-2 border rounded-md"
                    min="0"
                    value={action.delay || "0"}
                    onChange={(e) => updateAction(step.id, action.id, { 
                      delay: parseInt(e.target.value) || 0 
                    })}
                    placeholder="Days"
                  />
                  <span className="text-sm">days before executing</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render workflow summary
  const renderWorkflowSummary = (step: WorkflowStep) => {
    const { trigger } = step;
    let triggerSummary = "";
    
    if (trigger.type === "event" && trigger.eventType) {
      triggerSummary = `When ${getLabelFromValue(EVENT_TRIGGERS, trigger.eventType)}`;
    } else if (trigger.type === "time" && trigger.timeReference) {
      triggerSummary = `${trigger.timeOffset} days ${trigger.timeDirection} ${getLabelFromValue(TIME_REFERENCES, trigger.timeReference)}`;
    }
    
    const conditionSummary = trigger.conditions.length > 0
      ? ` if ${trigger.conditions.map(c => 
          `${getLabelFromValue(CONDITION_FIELDS, c.field)} ${getLabelFromValue(CONDITION_OPERATORS, c.operator)} ${c.value}`
        ).join(" AND ")}`
      : "";
    
    const actionSummary = step.actions.length > 0
      ? step.actions.map(a => getLabelFromValue(ACTION_TYPES, a.type)).join(", ")
      : "No actions";
    
    return (
      <div className="text-sm text-gray-600 mt-2">
        <p><strong>Summary:</strong> {triggerSummary}{conditionSummary}, then: {actionSummary}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Workflow Name</label>
            <Input
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              placeholder="Client Onboarding"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={workflow.description}
              onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
              placeholder="Describe what this workflow does"
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={workflow.isActive}
              onCheckedChange={(checked) => setWorkflow({ ...workflow, isActive: checked })}
              id="workflow-active"
            />
            <label htmlFor="workflow-active" className="text-sm font-medium">
              Workflow Active
            </label>
            <Badge className={workflow.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {workflow.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Automation Steps</h3>
          <Button onClick={addStep} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Step
          </Button>
        </div>
        
        {workflow.steps.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-md">
            <p className="text-gray-500 mb-4">No automation steps added yet</p>
            <Button onClick={addStep}>Add Your First Step</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {workflow.steps.map((step, index) => (
              <Card key={step.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center">
                      <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-2">
                        {index + 1}
                      </span>
                      Automation Step
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(step.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 space-y-4">
                  <Tabs defaultValue="event" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger
                        value="event"
                        onClick={() => updateTrigger(step.id, { ...step.trigger, type: "event" })}
                        className={step.trigger.type === "event" ? "bg-primary text-white" : ""}
                      >
                        Event-Based
                      </TabsTrigger>
                      <TabsTrigger
                        value="time"
                        onClick={() => updateTrigger(step.id, { ...step.trigger, type: "time" })}
                        className={step.trigger.type === "time" ? "bg-primary text-white" : ""}
                      >
                        Time-Based
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="event" className={step.trigger.type === "event" ? "block" : "hidden"}>
                      {renderTriggerConfig(step)}
                    </TabsContent>
                    
                    <TabsContent value="time" className={step.trigger.type === "time" ? "block" : "hidden"}>
                      {renderTriggerConfig(step)}
                    </TabsContent>
                  </Tabs>
                  
                  {renderConditions(step)}
                  {renderActions(step)}
                  {renderWorkflowSummary(step)}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Handle cancel
          }}
        >
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Save Workflow
        </Button>
      </div>
    </div>
  );
}
