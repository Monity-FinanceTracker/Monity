"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Receipt, MoreHorizontal, Check, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface GroupExpensesProps {
  groupId: string
}

const expenses = [
  {
    id: 1,
    description: "Electricity Bill - January",
    amount: 120.5,
    paidBy: { name: "Jane Smith", initials: "JS", avatar: "/avatar2.png" },
    splitBetween: 4,
    yourShare: 30.13,
    status: "pending",
    date: "2024-01-15",
    category: "Utilities",
  },
  {
    id: 2,
    description: "Grocery Shopping",
    amount: 85.25,
    paidBy: { name: "John Doe", initials: "JD", avatar: "/avatar1.png" },
    splitBetween: 4,
    yourShare: 21.31,
    status: "settled",
    date: "2024-01-14",
    category: "Food",
  },
  {
    id: 3,
    description: "Internet Bill",
    amount: 65.0,
    paidBy: { name: "Mike Johnson", initials: "MJ", avatar: "/avatar3.png" },
    splitBetween: 4,
    yourShare: 16.25,
    status: "pending",
    date: "2024-01-12",
    category: "Utilities",
  },
  {
    id: 4,
    description: "Cleaning Supplies",
    amount: 42.75,
    paidBy: { name: "Sarah Wilson", initials: "SW", avatar: "/avatar4.png" },
    splitBetween: 4,
    yourShare: 10.69,
    status: "settled",
    date: "2024-01-10",
    category: "Household",
  },
]

export function GroupExpenses({ groupId }: GroupExpensesProps) {
  return (
    <Card className="backdrop-blur-sm bg-card/95 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground">Recent Expenses</CardTitle>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Receipt className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={expense.paidBy.avatar || "/placeholder.svg"} alt={expense.paidBy.name} />
                <AvatarFallback className="bg-muted text-muted-foreground">{expense.paidBy.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-card-foreground">{expense.description}</h4>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Paid by {expense.paidBy.name}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {expense.category}
                  </Badge>
                  <span>•</span>
                  <span>{expense.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-foreground">${expense.amount.toFixed(2)}</p>
                <div className="flex items-center space-x-1 text-sm">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Your share: ${expense.yourShare.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={expense.status === "settled" ? "secondary" : "outline"}
                  className={cn(
                    "text-xs",
                    expense.status === "settled" ? "bg-accent/10 text-accent" : "border-chart-2 text-chart-2",
                  )}
                >
                  {expense.status === "settled" ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Settled
                    </>
                  ) : (
                    "Pending"
                  )}
                </Badge>

                {expense.status === "pending" && (
                  <Button size="sm" variant="outline" className="bg-accent/5 border-accent/20 text-accent">
                    Settle
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Expense</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete Expense</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
