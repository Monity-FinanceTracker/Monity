"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface BalanceCardProps {
  title: string
  amount: string
  change: string
  trend: "up" | "down"
  icon?: React.ReactNode
  className?: string
}

export function BalanceCard({ title, amount, change, trend, icon, className }: BalanceCardProps) {
  const isPositive = trend === "up"

  return (
    <Card className={cn("relative overflow-hidden backdrop-blur-sm bg-card/95 border-border/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon || <DollarSign className="h-4 w-4 text-primary" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground mb-1">{amount}</div>
        <div className="flex items-center space-x-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium",
              isPositive ? "bg-green-600 text-white border-green-600" : "bg-red-600 text-white border-red-600",
            )}
          >
            {change}
          </Badge>
          <span className="text-xs text-muted-foreground">from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
