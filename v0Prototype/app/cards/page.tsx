import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Eye, Lock, Unlock, Plus, Settings, TrendingUp, AlertTriangle } from "lucide-react"

const cards = [
  {
    id: 1,
    name: "Monity Premium Card",
    type: "Credit",
    number: "**** **** **** 4829",
    balance: 2340.5,
    limit: 15000,
    available: 12659.5,
    dueDate: "2024-07-15",
    minPayment: 75.0,
    status: "active",
    color: "from-primary to-primary/80",
  },
  {
    id: 2,
    name: "Everyday Debit",
    type: "Debit",
    number: "**** **** **** 7392",
    balance: 8450.25,
    limit: null,
    available: 8450.25,
    dueDate: null,
    minPayment: null,
    status: "active",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 3,
    name: "Travel Rewards Card",
    type: "Credit",
    number: "**** **** **** 1847",
    balance: 890.75,
    limit: 8000,
    available: 7109.25,
    dueDate: "2024-07-22",
    minPayment: 35.0,
    status: "frozen",
    color: "from-purple-500 to-purple-600",
  },
]

const recentTransactions = [
  {
    merchant: "Amazon",
    amount: -89.99,
    date: "2024-06-15",
    card: "Premium Card",
    category: "Shopping",
  },
  {
    merchant: "Starbucks",
    amount: -12.45,
    date: "2024-06-15",
    card: "Everyday Debit",
    category: "Food & Dining",
  },
  {
    merchant: "Shell Gas Station",
    amount: -45.2,
    date: "2024-06-14",
    card: "Premium Card",
    category: "Transportation",
  },
  {
    merchant: "Netflix",
    amount: -15.99,
    date: "2024-06-14",
    card: "Premium Card",
    category: "Entertainment",
  },
]

const rewards = [
  {
    program: "Cash Back",
    earned: 245.5,
    available: 245.5,
    rate: "2% on all purchases",
  },
  {
    program: "Travel Points",
    earned: 12450,
    available: 8200,
    rate: "3x on travel & dining",
  },
]

export default function CardsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Cards & Payments</h1>
          <p className="text-muted-foreground mt-2">Manage your credit and debit cards</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Card Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      {/* Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card key={card.id} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10`} />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                </div>
                <Badge variant={card.status === "active" ? "default" : "secondary"}>
                  {card.status === "active" ? "Active" : "Frozen"}
                </Badge>
              </div>
              <CardDescription>{card.type} Card</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="text-2xl font-mono tracking-wider">{card.number}</div>

              {card.type === "Credit" ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Balance</span>
                    <span className="font-semibold">${card.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available</span>
                    <span className="font-semibold text-primary">${card.available.toLocaleString()}</span>
                  </div>
                  <Progress value={(card.balance / card.limit) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    ${card.balance.toLocaleString()} of ${card.limit.toLocaleString()} limit used
                  </div>
                  {card.dueDate && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Due Date</span>
                        <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Min Payment</span>
                        <span className="font-semibold">${card.minPayment}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available Balance</span>
                    <span className="font-semibold text-primary">${card.balance.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  {card.status === "active" ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                  {card.status === "active" ? "Freeze" : "Unfreeze"}
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/40 transition-colors">
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Pay Bills</h3>
            <p className="text-sm text-muted-foreground">Make card payments</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold">Increase Limit</h3>
            <p className="text-sm text-muted-foreground">Request credit increase</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors">
          <CardContent className="p-4 text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-semibent">Card Controls</h3>
            <p className="text-sm text-muted-foreground">Manage spending limits</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <h3 className="font-semibold">Report Issue</h3>
            <p className="text-sm text-muted-foreground">Lost or stolen card</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Card Transactions</CardTitle>
            <CardDescription>Latest activity across all your cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{transaction.merchant}</h4>
                      <p className="text-sm text-muted-foreground">
                        {transaction.card} • {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${Math.abs(transaction.amount).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards & Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards & Benefits</CardTitle>
            <CardDescription>Your earned rewards and available benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {rewards.map((reward, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{reward.program}</h4>
                    <Badge variant="outline">{reward.rate}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Earned</p>
                      <p className="font-semibold">
                        {typeof reward.earned === "number" && reward.earned < 1000
                          ? `$${reward.earned}`
                          : reward.earned.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="font-semibold text-primary">
                        {typeof reward.available === "number" && reward.available < 1000
                          ? `$${reward.available}`
                          : reward.available.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {index < rewards.length - 1 && <div className="border-t" />}
                </div>
              ))}
              <Button className="w-full">Redeem Rewards</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Security */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Security & Controls
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Enhanced
            </Badge>
          </CardTitle>
          <CardDescription>Advanced security features for your cards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Transaction Alerts</h4>
                  <p className="text-sm text-muted-foreground">Get notified of all transactions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">International Purchases</h4>
                  <p className="text-sm text-muted-foreground">Allow foreign transactions</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Online Purchases</h4>
                  <p className="text-sm text-muted-foreground">Enable e-commerce transactions</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">ATM Withdrawals</h4>
                  <p className="text-sm text-muted-foreground">Allow cash withdrawals</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Contactless Payments</h4>
                  <p className="text-sm text-muted-foreground">Enable tap-to-pay</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Spending Limits</h4>
                  <p className="text-sm text-muted-foreground">Set daily/monthly limits</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
