"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Sparkles } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with basic financial tracking",
    features: [
      "Up to 100 transactions per month",
      "Basic expense tracking",
      "Simple budgeting tools",
      "1 savings goal",
      "Email support",
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    disabled: true,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "per month",
    description: "Complete financial management with AI-powered insights",
    features: [
      "Unlimited transactions",
      "AI-powered categorization",
      "Advanced analytics & insights",
      "Unlimited savings goals",
      "Group expense sharing",
      "Financial projections",
      "Data export (CSV/PDF)",
      "Priority support",
      "Custom categories",
      "Real-time sync",
    ],
    buttonText: "Upgrade to Premium",
    buttonVariant: "default" as const,
    popular: true,
    disabled: false,
  },
]

export function PremiumPricing() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose your plan</h2>
        <p className="text-muted-foreground">Start free and upgrade when you're ready for more advanced features</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`backdrop-blur-sm bg-card/95 border-border/50 relative ${
              plan.popular ? "border-accent/50 shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground px-4 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-card-foreground">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground ml-2">/{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className={`h-4 w-4 ${plan.popular ? "text-accent" : "text-muted-foreground"}`} />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.buttonVariant}
                className={`w-full ${
                  plan.popular ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-input border-border/50"
                }`}
                disabled={plan.disabled}
              >
                {plan.popular && <Sparkles className="w-4 h-4 mr-2" />}
                {plan.buttonText}
              </Button>

              {plan.popular && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Cancel anytime • 30-day money-back guarantee</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4 pt-8">
        <h3 className="text-lg font-semibold text-foreground">Ready to upgrade?</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Join thousands of users who have transformed their financial management with Monity Premium. Start your free
          trial today and experience the difference.
        </p>
        <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Crown className="w-5 h-5 mr-2" />
          Start Free Trial
        </Button>
      </div>
    </div>
  )
}
