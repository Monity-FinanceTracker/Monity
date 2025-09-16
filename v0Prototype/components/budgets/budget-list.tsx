"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Home,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const budgets = [
  {
    id: 1,
    category: "Food & Dining",
    budgetAmount: 800,
    spentAmount: 650,
    icon: Utensils,
    color: "bg-chart-1/10 text-chart-1",
    transactions: 24,
  },
  {
    id: 2,
    category: "Transportation",
    budgetAmount: 400,
    spentAmount: 480,
    icon: Car,
    color: "bg-chart-2/10 text-chart-2",
    transactions: 12,
  },
  {
    id: 3,
    category: "Shopping",
    budgetAmount: 600,
    spentAmount: 420,
    icon: ShoppingBag,
    color: "bg-chart-3/10 text-chart-3",
    transactions: 8,
  },
  {
    id: 4,
    category: "Entertainment",
    budgetAmount: 300,
    spentAmount: 180,
    icon: Gamepad2,
    color: "bg-chart-4/10 text-chart-4",
    transactions: 6,
  },
  {
    id: 5,
    category: "Bills & Utilities",
    budgetAmount: 1200,
    spentAmount: 1150,
    icon: Home,
    color: "bg-chart-5/10 text-chart-5",
    transactions: 5,
  },
]

export function BudgetList() {
  const getProgressPercentage = (spent: number, budget: number) => {
    return (spent / budget) * 100
  }

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = getProgressPercentage(spent, budget)
    if (percentage > 100)
      return {
        status: "over",
        color: "text-red-700 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-800",
      }
    if (percentage > 80)
      return {
        status: "warning",
        color: "text-orange-700 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
      }
    return { status: "good", color: "text-primary", bg: "bg-primary/20 border-primary/30" }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Category Budgets</h2>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const progress = getProgressPercentage(budget.spentAmount, budget.budgetAmount)
          const status = getBudgetStatus(budget.spentAmount, budget.budgetAmount)
          const remaining = budget.budgetAmount - budget.spentAmount

          return (
            <Card
              key={budget.id}
              className="backdrop-blur-sm bg-card/95 border-border/50 hover:bg-card/100 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={budget.color}>
                        <budget.icon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base text-card-foreground">{budget.category}</CardTitle>
                      <p className="text-xs text-muted-foreground">{budget.transactions} transactions</p>
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
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Budget
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <div className="flex items-center space-x-1">
                      {status.status === "over" && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(progress, 100)}
                    className={cn("h-2", progress > 100 && "[&>div]:bg-destructive")}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">${budget.spentAmount.toLocaleString()}</span>
                    <span className="text-muted-foreground">of ${budget.budgetAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={cn("text-xs", status.bg, status.color)}>
                    {status.status === "over" ? "Over Budget" : status.status === "warning" ? "Near Limit" : "On Track"}
                  </Badge>
                  <span className={cn("text-sm font-medium", remaining < 0 ? "text-destructive" : "text-accent")}>
                    {remaining < 0
                      ? `-$${Math.abs(remaining).toLocaleString()}`
                      : `$${remaining.toLocaleString()} left`}
                  </span>
                </div>

                {progress > 80 && (
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                    <p className="text-xs text-muted-foreground">
                      {progress > 100
                        ? `You've exceeded this budget by $${Math.abs(remaining).toLocaleString()}`
                        : `You're close to your limit. $${remaining.toLocaleString()} remaining.`}
                    </p>
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
