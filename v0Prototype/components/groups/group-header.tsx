"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Home, MoreHorizontal, Receipt, UserPlus, Settings, Crown, ArrowLeft } from "lucide-react"

interface GroupHeaderProps {
  groupId: string
}

export function GroupHeader({ groupId }: GroupHeaderProps) {
  // Mock data - in real app, fetch based on groupId
  const group = {
    name: "Roommates",
    description: "Shared apartment expenses",
    memberCount: 4,
    totalExpenses: 1240.5,
    isPremium: true,
    icon: Home,
    color: "bg-primary/10 text-primary",
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Groups
      </Button>

      <Card className="backdrop-blur-sm bg-card/95 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className={group.color}>
                  <group.icon className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
                  {group.isPremium && (
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">{group.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-muted-foreground">{group.memberCount} members</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium text-foreground">${group.totalExpenses.toLocaleString()} total</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Receipt className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
              <Button variant="outline" className="bg-input border-border/50">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Group Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Leave Group</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
