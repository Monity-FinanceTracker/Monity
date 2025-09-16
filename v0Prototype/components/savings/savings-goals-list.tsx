"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Target, Home, Car, Plane, MoreHorizontal, DollarSign, Calendar, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const savingsGoals = [
  {
    id: 1,
    name: "Emergency Fund",
    description: "6 months of expenses",
    targetAmount: 15000,
    currentAmount: 8750,
    deadline: "2024-12-31",
    category: "Emergency",
    icon: Target,
    color: "bg-accent/10 text-accent",
    priority: "high" as const,
  },
  {
    id: 2,
    name: "House Down Payment",
    description: "20% down payment for new home",
    targetAmount: 50000,
    currentAmount: 12500,
    deadline: "2025-06-30",
    category: "Real Estate",
    icon: Home,
    color: "bg-primary/10 text-primary",
    priority: "high" as const,
  },
  {
    id: 3,
    name: "New Car",
    description: "Tesla Model 3",
    targetAmount: 35000,
    currentAmount: 8200,
    deadline: "2024-09-15",
    category: "Transportation",
    icon: Car,
    color: "bg-chart-2/10 text-chart-2",
    priority: "medium" as const,
  },
  {
    id: 4,
    name: "Europe Vacation",
    description: "2-week trip to Europe",
    targetAmount: 8000,
    currentAmount: 3200,
    deadline: "2024-07-01",
    category: "Travel",
    icon: Plane,
    color: "bg-chart-4/10 text-chart-4",
    priority: "low" as const,
  },
]

export function SavingsGoalsList() {
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null)

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getDaysRemaining = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Your Goals</h2>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Create Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {savingsGoals.map((goal) => {
          const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount)
          const daysRemaining = getDaysRemaining(goal.deadline)
          const isOnTrack = progress >= 50 // Simple logic for demo

          return (
            <Card
              key={goal.id}
              className={cn(
                "backdrop-blur-sm bg-card/95 border-border/50 hover:bg-card/100 transition-all duration-200 cursor-pointer",
                selectedGoal === goal.id && "ring-2 ring-primary/20 border-primary/30",
              )}
              onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={goal.color}>
                        <goal.icon className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-card-foreground">{goal.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Allocate Funds
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Projections
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Goal</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-accent">${goal.currentAmount.toLocaleString()}</span>
                    <span className="text-muted-foreground">of ${goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="text-xs">
                      {goal.category}
                    </Badge>
                    <Badge
                      variant={isOnTrack ? "secondary" : "outline"}
                      className={cn(
                        "text-xs",
                        isOnTrack
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
                      )}
                    >
                      {isOnTrack ? "On Track" : "Behind"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{daysRemaining > 0 ? `${daysRemaining} days left` : "Overdue"}</span>
                  </div>
                </div>

                {selectedGoal === goal.id && (
                  <div className="pt-4 border-t border-border/50 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="bg-input border-border/50">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Add Money
                      </Button>
                      <Button variant="outline" size="sm" className="bg-input border-border/50">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Projections
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>
                        At your current rate, you'll reach this goal in{" "}
                        <span className="font-medium text-foreground">
                          {Math.ceil((goal.targetAmount - goal.currentAmount) / 500)} months
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
