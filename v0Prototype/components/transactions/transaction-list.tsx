"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal, Grid3X3, List, Edit, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const transactions = [
  {
    id: 1,
    description: "Starbucks Coffee",
    category: "Food & Dining",
    amount: -4.95,
    date: "2024-01-15",
    time: "08:30 AM",
    type: "expense" as const,
    status: "completed",
  },
  {
    id: 2,
    description: "Salary Deposit",
    category: "Income",
    amount: 3500.0,
    date: "2024-01-14",
    time: "09:00 AM",
    type: "income" as const,
    status: "completed",
  },
  {
    id: 3,
    description: "Uber Ride",
    category: "Transportation",
    amount: -12.5,
    date: "2024-01-14",
    time: "06:45 PM",
    type: "expense" as const,
    status: "completed",
  },
  {
    id: 4,
    description: "Amazon Purchase",
    category: "Shopping",
    amount: -89.99,
    date: "2024-01-13",
    time: "02:15 PM",
    type: "expense" as const,
    status: "pending",
  },
  {
    id: 5,
    description: "Netflix Subscription",
    category: "Entertainment",
    amount: -15.99,
    date: "2024-01-12",
    time: "12:00 PM",
    type: "expense" as const,
    status: "completed",
  },
]

export function TransactionList() {
  const [viewMode, setViewMode] = useState<"card" | "table">("card")
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([])

  const toggleTransaction = (id: number) => {
    setSelectedTransactions((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    setSelectedTransactions(selectedTransactions.length === transactions.length ? [] : transactions.map((t) => t.id))
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">{transactions.length} transactions found</p>
          {selectedTransactions.length > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {selectedTransactions.length} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-input border-border/50">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>

          <div className="flex border border-border/50 rounded-lg bg-input">
            <Button
              variant={viewMode === "card" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("card")}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <Card className="backdrop-blur-sm bg-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedTransactions.length} transaction(s) selected</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Category
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction List */}
      {viewMode === "card" ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card
              key={transaction.id}
              className="backdrop-blur-sm bg-card/95 border-border/50 hover:bg-card/100 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedTransactions.includes(transaction.id)}
                      onCheckedChange={() => toggleTransaction(transaction.id)}
                    />

                    <Avatar className="h-12 w-12">
                      <AvatarFallback
                        className={cn(
                          "text-sm font-medium",
                          transaction.type === "income"
                            ? "bg-primary/20 text-primary"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
                        )}
                      >
                        {transaction.type === "income" ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-card-foreground">{transaction.description}</h3>
                        <Badge
                          variant={transaction.status === "completed" ? "secondary" : "outline"}
                          className={cn(
                            "text-xs",
                            transaction.status === "pending" &&
                              "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
                          )}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category}
                        </Badge>
                        <span>{transaction.date}</span>
                        <span>{transaction.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={cn(
                        "text-lg font-semibold",
                        transaction.type === "income" ? "text-primary" : "text-foreground",
                      )}
                    >
                      {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="backdrop-blur-sm bg-card/95 border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={selectedTransactions.length === transactions.length} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTransactions.includes(transaction.id)}
                      onCheckedChange={() => toggleTransaction(transaction.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={transaction.status === "completed" ? "secondary" : "outline"}
                      className={cn(
                        "text-xs",
                        transaction.status === "pending" &&
                          "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
                      )}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-semibold",
                        transaction.type === "income" ? "text-primary" : "text-foreground",
                      )}
                    >
                      {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
