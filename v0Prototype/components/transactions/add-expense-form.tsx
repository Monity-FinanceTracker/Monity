"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sparkles, CalendarIcon, Loader2, Check, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Education",
  "Personal Care",
  "Other",
]

export function AddExpenseForm() {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date(),
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  const handleDescriptionChange = async (description: string) => {
    setFormData((prev) => ({ ...prev, description }))

    if (description.length > 3) {
      setIsLoadingAI(true)
      // Simulate AI categorization
      setTimeout(() => {
        const suggestions = {
          starbucks: "Food & Dining",
          uber: "Transportation",
          amazon: "Shopping",
          netflix: "Entertainment",
          electricity: "Bills & Utilities",
        }

        const suggestion = Object.entries(suggestions).find(([key]) => description.toLowerCase().includes(key))?.[1]

        setAiSuggestion(suggestion || null)
        setIsLoadingAI(false)
      }, 1000)
    } else {
      setAiSuggestion(null)
    }
  }

  const acceptAISuggestion = () => {
    if (aiSuggestion) {
      setFormData((prev) => ({ ...prev, category: aiSuggestion }))
      setAiSuggestion(null)
    }
  }

  const rejectAISuggestion = () => {
    setAiSuggestion(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    // Reset form or redirect
  }

  return (
    <Card className="backdrop-blur-sm bg-card/95 border-border/50">
      <CardHeader>
        <CardTitle className="text-card-foreground">Expense Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What did you spend on?"
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="bg-input border-border/50 focus:border-primary"
              required
            />
          </div>

          {/* AI Category Suggestion */}
          {(isLoadingAI || aiSuggestion) && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">AI Suggestion</span>
                  </div>
                  {isLoadingAI ? (
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  ) : aiSuggestion ? (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-accent/10 text-accent">{aiSuggestion}</Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={acceptAISuggestion}
                        className="h-6 w-6 p-0 text-accent hover:bg-accent/10"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={rejectAISuggestion}
                        className="h-6 w-6 p-0 text-muted-foreground hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null}
                </div>
                {isLoadingAI && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Analyzing transaction for smart categorization...
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="pl-8 bg-input border-border/50 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-input border-border/50 focus:border-primary">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border/50",
                    !formData.date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData((prev) => ({ ...prev, date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="bg-input border-border/50 focus:border-primary resize-none"
              rows={3}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Expense...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
            <Button type="button" variant="outline" className="bg-input border-border/50 hover:bg-muted">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
