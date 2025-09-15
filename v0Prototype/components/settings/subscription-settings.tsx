"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Check, Sparkles, Users, TrendingUp, CreditCard } from "lucide-react"

const features = {
  free: [
    "Up to 100 transactions per month",
    "Basic expense tracking",
    "Simple budgeting tools",
    "1 savings goal",
    "Email support",
  ],
  premium: [
    "Unlimited transactions",
    "AI-powered categorization",
    "Advanced analytics & insights",
    "Unlimited savings goals",
    "Group expense sharing",
    "Financial projections",
    "Data export (CSV/PDF)",
    "Priority support",
    "Custom categories",
    "Recurring transaction detection",
  ],
}

export function SubscriptionSettings() {
  const currentPlan = "premium"
  const usageStats = {
    transactions: { used: 245, limit: "unlimited" },
    groups: { used: 4, limit: "unlimited" },
    goals: { used: 3, limit: "unlimited" },
  }

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <Crown className="h-5 w-5 text-accent" />
                <span>Premium Subscription</span>
              </CardTitle>
              <p className="text-muted-foreground mt-1">You're currently on the Premium plan</p>
            </div>
            <Badge className="bg-accent text-accent-foreground">
              <Crown className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
              <p className="text-2xl font-bold text-foreground">{usageStats.transactions.used}</p>
              <p className="text-sm text-muted-foreground">Transactions this month</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
              <p className="text-2xl font-bold text-foreground">{usageStats.groups.used}</p>
              <p className="text-sm text-muted-foreground">Active groups</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/50 border border-border/50">
              <p className="text-2xl font-bold text-foreground">{usageStats.goals.used}</p>
              <p className="text-sm text-muted-foreground">Savings goals</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Next billing date: February 15, 2024</p>
              <p className="text-sm text-muted-foreground">$9.99/month • Auto-renewal enabled</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="bg-input border-border/50">
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment
              </Button>
              <Button variant="outline" className="bg-input border-border/50 text-destructive hover:text-destructive">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="backdrop-blur-sm bg-card/95 border-border/50">
          <CardHeader>
            <CardTitle className="text-card-foreground">Free Plan</CardTitle>
            <div className="text-2xl font-bold text-foreground">
              $0<span className="text-sm font-normal">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" disabled className="w-full bg-muted text-muted-foreground">
              Current Plan
            </Button>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/95 border-accent/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">
            Most Popular
          </div>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-card-foreground">
              <Crown className="h-5 w-5 text-accent" />
              <span>Premium Plan</span>
            </CardTitle>
            <div className="text-2xl font-bold text-foreground">
              $9.99<span className="text-sm font-normal">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Badge className="w-full justify-center bg-accent text-accent-foreground py-2">
              <Crown className="w-4 h-4 mr-2" />
              Currently Active
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-sm bg-card/95 border-border/50">
        <CardHeader>
          <CardTitle className="text-card-foreground">Premium Features in Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border/50 text-center">
              <Sparkles className="h-8 w-8 text-accent mx-auto mb-2" />
              <h4 className="font-medium text-foreground mb-1">AI Categorization</h4>
              <p className="text-xs text-muted-foreground">95% accuracy this month</p>
            </div>
            <div className="p-4 rounded-lg border border-border/50 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium text-foreground mb-1">Group Sharing</h4>
              <p className="text-xs text-muted-foreground">$2,340 shared expenses</p>
            </div>
            <div className="p-4 rounded-lg border border-border/50 text-center">
              <TrendingUp className="h-8 w-8 text-chart-2 mx-auto mb-2" />
              <h4 className="font-medium text-foreground mb-1">Advanced Analytics</h4>
              <p className="text-xs text-muted-foreground">Detailed insights available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
