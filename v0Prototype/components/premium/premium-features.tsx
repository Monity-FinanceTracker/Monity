"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users, TrendingUp, Download, Shield, Zap, Target, PieChart } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Categorization",
    description: "Automatically categorize transactions with 95% accuracy using advanced machine learning",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Users,
    title: "Unlimited Group Sharing",
    description: "Create unlimited groups and split expenses with friends, family, and colleagues",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Deep insights into spending patterns, trends, and personalized financial recommendations",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    icon: Target,
    title: "Unlimited Savings Goals",
    description: "Set and track unlimited savings goals with AI-powered achievement projections",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    icon: Download,
    title: "Data Export",
    description: "Export your financial data in CSV and PDF formats for external analysis",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    icon: Shield,
    title: "Priority Support",
    description: "Get priority customer support with faster response times and dedicated assistance",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    icon: Zap,
    title: "Real-time Sync",
    description: "Instant synchronization across all your devices with real-time updates",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: PieChart,
    title: "Custom Categories",
    description: "Create unlimited custom categories and subcategories for precise expense tracking",
    color: "text-primary",
    bg: "bg-primary/10",
  },
]

export function PremiumFeatures() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge className="bg-accent/10 text-accent mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          Premium Features
        </Badge>
        <h2 className="text-2xl font-bold text-foreground mb-2">Everything you need for financial success</h2>
        <p className="text-muted-foreground">Powerful tools and insights to help you make better financial decisions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="backdrop-blur-sm bg-card/95 border-border/50 hover:bg-card/100 transition-colors"
          >
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-3`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <CardTitle className="text-lg text-card-foreground">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
