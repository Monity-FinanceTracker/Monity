"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserPlus, MoreHorizontal, Crown, Shield } from "lucide-react"

interface GroupMembersProps {
  groupId: string
}

const members = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatar1.png",
    initials: "JD",
    role: "admin",
    joinedDate: "2023-12-01",
    totalPaid: 245.75,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "/avatar2.png",
    initials: "JS",
    role: "member",
    joinedDate: "2023-12-01",
    totalPaid: 180.5,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    avatar: "/avatar3.png",
    initials: "MJ",
    role: "member",
    joinedDate: "2023-12-15",
    totalPaid: 125.25,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    avatar: "/avatar4.png",
    initials: "SW",
    role: "member",
    joinedDate: "2024-01-01",
    totalPaid: 89.0,
  },
]

export function GroupMembers({ groupId }: GroupMembersProps) {
  return (
    <Card className="backdrop-blur-sm bg-card/95 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground">Members</CardTitle>
          <Button size="sm" variant="outline" className="bg-input border-border/50">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="bg-muted text-muted-foreground">{member.initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-card-foreground">{member.name}</p>
                  {member.role === "admin" && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{member.email}</span>
                  <span>•</span>
                  <span>Paid ${member.totalPaid.toFixed(2)}</span>
                </div>
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
                  <Shield className="mr-2 h-4 w-4" />
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Remove from Group</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
