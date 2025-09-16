"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const transactions = [
  {
    id: 1,
    description: "Starbucks Coffee",
    category: "Food & Dining",
    amount: -4.95,
    date: "Today",
    type: "expense" as const,
  },
  {
    id: 2,
    description: "Salary Deposit",
    category: "Income",
    amount: 3500.0,
    date: "Yesterday",
    type: "income" as const,
  },
  {
    id: 3,
    description: "Uber Ride",
    category: "Transportation",
    amount: -12.5,
    date: "Yesterday",
    type: "expense" as const,
  },
  {
    id: 4,
    description: "Amazon Purchase",
    category: "Shopping",
    amount: -89.99,
    date: "2 days ago",
    type: "expense" as const,
  },
  {
    id: 5,
    description: "Netflix Subscription",
    category: "Entertainment",
    amount: -15.99,
    date: "3 days ago",
    type: "expense" as const,
  },
]

export function RecentTransactions() {
  return (
    <Card className="backdrop-blur-sm bg-card/95 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback
                  className={cn(
                    "text-xs font-medium",
                    transaction.type === "income" ? "bg-accent/10 text-accent" : "bg-chart-2/10 text-chart-2",
                  )}
                >
                  {transaction.type === "income" ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-card-foreground">{transaction.description}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {transaction.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{transaction.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={cn("font-semibold", transaction.type === "income" ? "text-accent" : "text-foreground")}>
                {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
              </span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
