"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, Calendar, DollarSign } from "lucide-react"

const overviewStats = [
  {
    title: "Total Saved",
    amount: "$8,750.00",
    change: "+12.8%",
    icon: DollarSign,
    color: "text-accent",
  },
  {
    title: "Active Goals",
    amount: "3",
    change: "2 on track",
    icon: Target,
    color: "text-primary",
  },
  {
    title: "Monthly Progress",
    amount: "$425.00",
    change: "This month",
    icon: TrendingUp,
    color: "text-chart-2",
  },
  {
    title: "Next Milestone",
    amount: "14 days",
    change: "Emergency Fund",
    icon: Calendar,
    color: "text-chart-4",
  },
]

export function SavingsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewStats.map((stat) => (
        <Card key={stat.title} className="backdrop-blur-sm bg-card/95 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground mb-1">{stat.amount}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
