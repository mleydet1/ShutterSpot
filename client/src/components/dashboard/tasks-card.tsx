import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Task } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface TasksCardProps {
  tasks: Task[];
  onTaskComplete: (taskId: number, completed: boolean) => void;
  onAddTask: () => void;
}

export function TasksCard({ tasks, onTaskComplete, onAddTask }: TasksCardProps) {
  const handleTaskChange = (taskId: number, checked: boolean) => {
    onTaskComplete(taskId, checked);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="border-b border-gray-200 px-5 py-4 flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900">Tasks & Reminders</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onAddTask}
          className="text-gray-400 hover:text-gray-500"
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-5 divide-y divide-gray-200">
        {tasks.length === 0 ? (
          <div className="py-3 text-center text-gray-500">
            No tasks yet. Add a task to get started.
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="py-3">
              <div className="flex items-start">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={(checked) => handleTaskChange(task.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="ml-3">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`text-sm font-medium ${
                      task.completed ? "line-through text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </label>
                  <p className="text-xs text-gray-500">
                    {task.dueDate ? (
                      new Date(task.dueDate).toLocaleDateString() === new Date().toLocaleDateString() 
                        ? "Due today" 
                        : `Due ${new Date(task.dueDate).toLocaleDateString()}`
                    ) : (
                      "No due date"
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
