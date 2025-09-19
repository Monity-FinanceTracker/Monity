"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Target, Users, PieChart, CreditCard, TrendingUp } from "lucide-react"

const actions = [
  {
    title: "Add Expense",
    description: "Record a new expense",
    icon: Plus,
    color: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20",
  },
  {
    title: "Create Goal",
    description: "Set a new savings goal",
    icon: Target,
    color: "bg-accent/10 text-accent hover:bg-accent/20",
  },
  {
    title: "Join Group",
    description: "Share expenses with others",
    icon: Users,
    color: "bg-chart-4/10 text-chart-4 hover:bg-chart-4/20",
  },
  {
    title: "Set Budget",
    description: "Create spending limits",
    icon: PieChart,
    color: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    title: "Add Income",
    description: "Record income source",
    icon: CreditCard,
    color: "bg-chart-1/10 text-chart-1 hover:bg-chart-1/20",
  },
  {
    title: "View Analytics",
    description: "Deep financial insights",
    icon: TrendingUp,
    color: "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
  },
]

export function QuickActions() {
  return (
    <Card className="backdrop-blur-sm bg-card/95 border-border/50">
      <CardHeader>
        <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="ghost"
              className={`h-auto p-4 flex flex-col items-center space-y-2 ${action.color} transition-colors`}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-70">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
