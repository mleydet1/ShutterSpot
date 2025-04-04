import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/layouts/main-layout";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { UpcomingShoots } from "@/components/dashboard/upcoming-shoots";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { Task } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch business metrics
  const { 
    data: metrics = { 
      shootsBooked: 0, 
      shootsBookedGrowth: 0, 
      revenue: 0, 
      revenueGrowth: 0,
      newClients: 0,
      newClientsGrowth: 0,
      pendingInvoices: 0,
      pendingInvoicesGrowth: 0
    }, 
    isLoading: metricsLoading 
  } = useQuery({
    queryKey: ['/api/metrics'],
  });

  // Fetch upcoming shoots
  const { 
    data: upcomingShoots = [], 
    isLoading: shootsLoading 
  } = useQuery({
    queryKey: ['/api/shoots/upcoming'],
  });

  // Fetch incomplete tasks
  const { 
    data: tasks = [], 
    isLoading: tasksLoading 
  } = useQuery({
    queryKey: ['/api/tasks/incomplete'],
  });

  // Fetch recent activities
  const { 
    data: activities = [], 
    isLoading: activitiesLoading 
  } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest('PUT', `/api/tasks/${id}`, { completed });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/incomplete'] });
      toast({
        title: "Task updated",
        description: "The task has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      console.error("Error updating task:", error);
    },
  });

  const handleTaskComplete = (taskId: number, completed: boolean) => {
    updateTaskMutation.mutate({ id: taskId, completed });
  };

  const handleAddTask = () => {
    // This would normally open a modal or navigate to task creation
    toast({
      title: "Add Task",
      description: "Task creation functionality will be implemented soon",
    });
  };

  return (
    <MainLayout 
      title="Dashboard" 
      description="Welcome back! Here's what's happening with your business today."
    >
      <QuickActions />
      
      <StatsOverview metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingShoots shoots={upcomingShoots} />
        </div>
        
        <div>
          <TasksCard 
            tasks={tasks} 
            onTaskComplete={handleTaskComplete} 
            onAddTask={handleAddTask} 
          />
          
          <ActivityCard activities={activities} />
        </div>
      </div>
    </MainLayout>
  );
}
