"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface GroupBalancesProps {
  groupId: string
}

const balances = [
  {
    id: 1,
    member: { name: "Jane Smith", initials: "JS", avatar: "/avatar2.png" },
    amount: 45.75,
    type: "owes_you" as const,
  },
  {
    id: 2,
    member: { name: "Mike Johnson", initials: "MJ", avatar: "/avatar3.png" },
    amount: 32.5,
    type: "you_owe" as const,
  },
  {
    id: 3,
    member: { name: "Sarah Wilson", initials: "SW", avatar: "/avatar4.png" },
    amount: 0,
    type: "settled" as const,
  },
]

export function GroupBalances({ groupId }: GroupBalancesProps) {
  const getBalanceColor = (type: string) => {
    switch (type) {
      case "owes_you":
        return "text-accent"
      case "you_owe":
        return "text-chart-2"
      default:
        return "text-muted-foreground"
    }
  }

  const getBalanceText = (amount: number, type: string) => {
    if (type === "settled") return "Settled up"
    if (type === "owes_you") return `Owes you $${amount.toFixed(2)}`
    return `You owe $${amount.toFixed(2)}`
  }

  return (
    <Card className="backdrop-blur-sm bg-card/95 border-border/50">
      <CardHeader>
        <CardTitle className="text-card-foreground">Balances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.map((balance) => (
          <div key={balance.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={balance.member.avatar || "/placeholder.svg"} alt={balance.member.name} />
                <AvatarFallback className="bg-muted text-muted-foreground">{balance.member.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-card-foreground">{balance.member.name}</p>
                <p className={cn("text-sm", getBalanceColor(balance.type))}>
                  {getBalanceText(balance.amount, balance.type)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {balance.type === "owes_you" && (
                <>
                  <ArrowDownLeft className="h-4 w-4 text-accent" />
                  <Button size="sm" variant="outline" className="bg-accent/5 border-accent/20 text-accent">
                    Remind
                  </Button>
                </>
              )}
              {balance.type === "you_owe" && (
                <>
                  <ArrowUpRight className="h-4 w-4 text-chart-2" />
                  <Button size="sm" className="bg-chart-2 hover:bg-chart-2/90 text-white">
                    Settle
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
