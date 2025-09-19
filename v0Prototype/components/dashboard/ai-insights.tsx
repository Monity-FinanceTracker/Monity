"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, AlertTriangle, Target } from "lucide-react"

const insights = [
  {
    id: 1,
    type: "spending",
    title: "Spending Pattern Alert",
    description: "You've spent 23% more on dining this month compared to your average.",
    action: "Set dining budget",
    icon: AlertTriangle,
    priority: "high" as const,
  },
  {
    id: 2,
    type: "savings",
    title: "Savings Opportunity",
    description: "Based on your income, you could save an additional $400 this month.",
    action: "Create goal",
    icon: Target,
    priority: "medium" as const,
  },
  {
    id: 3,
    type: "trend",
    title: "Positive Trend",
    description: "Your overall spending has decreased by 8% over the last 3 months.",
    action: "View details",
    icon: TrendingUp,
    priority: "low" as const,
  },
]

export function AIInsights() {
  return (
    <Card className="backdrop-blur-sm bg-card/95 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-card-foreground">
            <Sparkles className="h-5 w-5 text-accent" />
            <span>AI Insights</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            Premium
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="p-4 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`p-2 rounded-lg ${
                    insight.priority === "high"
                      ? "bg-destructive/10"
                      : insight.priority === "medium"
                        ? "bg-chart-2/10"
                        : "bg-accent/10"
                  }`}
                >
                  <insight.icon
                    className={`h-4 w-4 ${
                      insight.priority === "high"
                        ? "text-destructive"
                        : insight.priority === "medium"
                          ? "text-chart-2"
                          : "text-accent"
                    }`}
                  />
                </div>
                <h4 className="font-medium text-card-foreground">{insight.title}</h4>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
            <Button
              variant="outline"
              size="sm"
              className="text-primary border-primary/20 hover:bg-primary/5 bg-transparent"
            >
              {insight.action}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
