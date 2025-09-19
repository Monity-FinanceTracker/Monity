"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Receipt, Crown } from "lucide-react"

const overviewStats = [
  {
    title: "Active Groups",
    amount: "4",
    subtitle: "2 premium groups",
    icon: Users,
    color: "text-primary",
  },
  {
    title: "Total Shared",
    amount: "$2,340.00",
    subtitle: "This month",
    icon: DollarSign,
    color: "text-accent",
  },
  {
    title: "Pending Expenses",
    amount: "7",
    subtitle: "Need settlement",
    icon: Receipt,
    color: "text-chart-2",
  },
  {
    title: "You Owe",
    amount: "$125.50",
    subtitle: "To be settled",
    icon: Crown,
    color: "text-chart-4",
  },
]

export function GroupsOverview() {
  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Premium Group Features</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unlock unlimited groups, advanced analytics, and automatic expense categorization
              </p>
            </div>
            <Badge className="bg-accent text-accent-foreground">
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Badge>
          </div>
        </CardContent>
      </Card>

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
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
