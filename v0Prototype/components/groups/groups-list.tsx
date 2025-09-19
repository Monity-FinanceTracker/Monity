"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Users, Home, Plane, Utensils, MoreHorizontal, Settings, UserPlus, Receipt, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

const groups = [
  {
    id: 1,
    name: "Roommates",
    description: "Shared apartment expenses",
    memberCount: 4,
    totalExpenses: 1240.5,
    yourBalance: -85.25,
    icon: Home,
    color: "bg-primary/10 text-primary",
    isPremium: true,
    members: [
      { id: 1, name: "John Doe", avatar: "/avatar1.png", initials: "JD" },
      { id: 2, name: "Jane Smith", avatar: "/avatar2.png", initials: "JS" },
      { id: 3, name: "Mike Johnson", avatar: "/avatar3.png", initials: "MJ" },
      { id: 4, name: "Sarah Wilson", avatar: "/avatar4.png", initials: "SW" },
    ],
    recentActivity: "Electricity bill added by Jane",
  },
  {
    id: 2,
    name: "Europe Trip 2024",
    description: "Vacation expenses with friends",
    memberCount: 6,
    totalExpenses: 3240.0,
    yourBalance: 125.75,
    icon: Plane,
    color: "bg-chart-4/10 text-chart-4",
    isPremium: false,
    members: [
      { id: 1, name: "John Doe", avatar: "/avatar1.png", initials: "JD" },
      { id: 5, name: "Alex Brown", avatar: "/avatar5.png", initials: "AB" },
      { id: 6, name: "Emma Davis", avatar: "/avatar6.png", initials: "ED" },
    ],
    recentActivity: "Hotel booking settled",
  },
  {
    id: 3,
    name: "Weekly Dinners",
    description: "Restaurant expenses with colleagues",
    memberCount: 8,
    totalExpenses: 680.25,
    yourBalance: -42.5,
    icon: Utensils,
    color: "bg-chart-1/10 text-chart-1",
    isPremium: true,
    members: [
      { id: 1, name: "John Doe", avatar: "/avatar1.png", initials: "JD" },
      { id: 7, name: "Chris Lee", avatar: "/avatar7.png", initials: "CL" },
      { id: 8, name: "Lisa Wang", avatar: "/avatar8.png", initials: "LW" },
    ],
    recentActivity: "Dinner at Italian place added",
  },
  {
    id: 4,
    name: "Family Expenses",
    description: "Shared family costs",
    memberCount: 5,
    totalExpenses: 2150.0,
    yourBalance: 0,
    icon: Users,
    color: "bg-accent/10 text-accent",
    isPremium: false,
    members: [
      { id: 1, name: "John Doe", avatar: "/avatar1.png", initials: "JD" },
      { id: 9, name: "Mom", avatar: "/avatar9.png", initials: "M" },
      { id: 10, name: "Dad", avatar: "/avatar10.png", initials: "D" },
    ],
    recentActivity: "All expenses settled",
  },
]

export function GroupsList() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-accent"
    if (balance < 0) return "text-chart-2"
    return "text-muted-foreground"
  }

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `You're owed $${balance.toFixed(2)}`
    if (balance < 0) return `You owe $${Math.abs(balance).toFixed(2)}`
    return "All settled up"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Your Groups</h2>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map((group) => (
          <Card
            key={group.id}
            className={cn(
              "backdrop-blur-sm bg-card/95 border-border/50 hover:bg-card/100 transition-all duration-200 cursor-pointer",
              selectedGroup === group.id && "ring-2 ring-primary/20 border-primary/30",
            )}
            onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={group.color}>
                      <group.icon className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg text-card-foreground">{group.name}</CardTitle>
                      {group.isPremium && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
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
                      <Receipt className="mr-2 h-4 w-4" />
                      Add Expense
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Member
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Group Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="font-semibold text-foreground">{group.memberCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total Expenses</p>
                    <p className="font-semibold text-foreground">${group.totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Your Balance</p>
                  <p className={cn("font-semibold", getBalanceColor(group.yourBalance))}>
                    {getBalanceText(group.yourBalance)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 4).map((member) => (
                    <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback className="text-xs bg-muted">{member.initials}</AvatarFallback>
                    </Avatar>
                  ))}
                  {group.memberCount > 4 && (
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarFallback className="text-xs bg-muted">+{group.memberCount - 4}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{group.recentActivity}</p>
              </div>

              {selectedGroup === group.id && (
                <div className="pt-4 border-t border-border/50 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="bg-input border-border/50">
                      <Receipt className="w-4 h-4 mr-2" />
                      Add Expense
                    </Button>
                    <Button variant="outline" size="sm" className="bg-input border-border/50">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary hover:text-primary/80 hover:bg-primary/5"
                  >
                    View Group Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
