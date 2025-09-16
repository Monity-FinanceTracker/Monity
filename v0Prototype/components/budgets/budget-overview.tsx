"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PieChart, AlertTriangle, CheckCircle, DollarSign } from "lucide-react"

const budgetStats = [
  {
    title: "Total Budget",
    amount: "$4,500.00",
    subtitle: "This month",
    icon: DollarSign,
    color: "text-primary",
  },
  {
    title: "Spent",
    amount: "$3,240.00",
    subtitle: "72% of budget",
    icon: PieChart,
    color: "text-chart-2",
  },
  {
    title: "Remaining",
    amount: "$1,260.00",
    subtitle: "28% left",
    icon: CheckCircle,
    color: "text-accent",
  },
  {
    title: "Over Budget",
    amount: "2",
    subtitle: "Categories",
    icon: AlertTriangle,
    color: "text-destructive",
  },
]

export function BudgetOverview() {
  const overallProgress = 72 // 72% of total budget spent

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-card/95 border-border/50">
        <CardHeader>
          <CardTitle className="text-card-foreground">Monthly Budget Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-chart-2">$3,240 spent</span>
              <span className="text-muted-foreground">of $4,500 budget</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-chart-2 text-chart-2 bg-chart-2/5">
              On Track
            </Badge>
            <span className="text-xs text-muted-foreground">You're spending within your limits this month</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {budgetStats.map((stat) => (
          <Card key={stat.title} className="backdrop-blur-sm bg-card/95 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground mb-1">{stat.amount}</div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
