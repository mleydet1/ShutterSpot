import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BusinessMetrics } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatsOverviewProps {
  metrics: BusinessMetrics;
}

export function StatsOverview({ metrics }: StatsOverviewProps) {
  const [period, setPeriod] = useState("this-month");

  const stats = [
    {
      id: 1,
      label: "Shoots Booked",
      value: metrics.shootsBooked,
      growth: metrics.shootsBookedGrowth,
      formatter: (val: number) => val.toString()
    },
    {
      id: 2,
      label: "Revenue",
      value: metrics.revenue,
      growth: metrics.revenueGrowth,
      formatter: formatCurrency
    },
    {
      id: 3,
      label: "New Clients",
      value: metrics.newClients,
      growth: metrics.newClientsGrowth,
      formatter: (val: number) => val.toString()
    },
    {
      id: 4,
      label: "Pending Invoices",
      value: metrics.pendingInvoices,
      growth: metrics.pendingInvoicesGrowth,
      formatter: formatCurrency
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Business Overview</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold text-gray-900">{stat.formatter(stat.value)}</p>
              <span className={`flex items-center text-xs font-medium ${
                stat.growth >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {stat.growth >= 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                {Math.abs(stat.growth)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
