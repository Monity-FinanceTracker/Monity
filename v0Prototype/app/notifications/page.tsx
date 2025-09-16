import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Settings, AlertTriangle, DollarSign, TrendingUp, CreditCard, Target } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "transaction",
    title: "New Transaction",
    message: "Purchase at Amazon for $89.99",
    time: "2 minutes ago",
    read: false,
    icon: DollarSign,
    color: "text-primary",
  },
  {
    id: 2,
    type: "alert",
    title: "Budget Alert",
    message: "You've spent 85% of your dining budget this month",
    time: "1 hour ago",
    read: false,
    icon: AlertTriangle,
    color: "text-orange-500",
  },
  {
    id: 3,
    type: "goal",
    title: "Savings Goal Update",
    message: "You're $200 closer to your vacation fund goal!",
    time: "3 hours ago",
    read: true,
    icon: Target,
    color: "text-blue-500",
  },
  {
    id: 4,
    type: "investment",
    title: "Portfolio Update",
    message: "Your portfolio gained 2.3% today (+$1,240)",
    time: "5 hours ago",
    read: true,
    icon: TrendingUp,
    color: "text-primary",
  },
  {
    id: 5,
    type: "card",
    title: "Card Payment Due",
    message: "Premium Card payment of $75 is due in 3 days",
    time: "1 day ago",
    read: true,
    icon: CreditCard,
    color: "text-purple-500",
  },
  {
    id: 6,
    type: "security",
    title: "Security Alert",
    message: "New device login detected from Chrome on Windows",
    time: "2 days ago",
    read: true,
    icon: AlertTriangle,
    color: "text-red-500",
  },
]

const notificationSettings = [
  {
    category: "Transactions",
    description: "Get notified about all account activity",
    settings: [
      { name: "All Transactions", enabled: true },
      { name: "Large Purchases (>$500)", enabled: true },
      { name: "International Transactions", enabled: true },
      { name: "Failed Transactions", enabled: true },
    ],
  },
  {
    category: "Budgets & Goals",
    description: "Stay on track with your financial goals",
    settings: [
      { name: "Budget Warnings (80% spent)", enabled: true },
      { name: "Budget Exceeded", enabled: true },
      { name: "Goal Milestones", enabled: true },
      { name: "Monthly Summaries", enabled: false },
    ],
  },
  {
    category: "Investments",
    description: "Track your portfolio performance",
    settings: [
      { name: "Daily Performance", enabled: false },
      { name: "Significant Changes (>5%)", enabled: true },
      { name: "Dividend Payments", enabled: true },
      { name: "Market News", enabled: false },
    ],
  },
  {
    category: "Security",
    description: "Important security and account alerts",
    settings: [
      { name: "Login Attempts", enabled: true },
      { name: "Password Changes", enabled: true },
      { name: "New Device Access", enabled: true },
      { name: "Suspicious Activity", enabled: true },
    ],
  },
]

export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Notifications</h1>
          <p className="text-muted-foreground mt-2">Stay updated with your financial activity</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {unreadCount} unread
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="transaction">Transactions</TabsTrigger>
          <TabsTrigger value="alert">Alerts</TabsTrigger>
          <TabsTrigger value="goal">Goals</TabsTrigger>
          <TabsTrigger value="investment">Investments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => {
            const IconComponent = notification.icon
            return (
              <Card key={notification.id} className={`${!notification.read ? "border-primary/20 bg-primary/5" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full bg-muted ${notification.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="transaction" className="space-y-4">
          {notifications
            .filter((n) => n.type === "transaction")
            .map((notification) => {
              const IconComponent = notification.icon
              return (
                <Card key={notification.id} className={`${!notification.read ? "border-primary/20 bg-primary/5" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-muted ${notification.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </TabsContent>

        <TabsContent value="alert" className="space-y-4">
          {notifications
            .filter((n) => n.type === "alert" || n.type === "security")
            .map((notification) => {
              const IconComponent = notification.icon
              return (
                <Card key={notification.id} className={`${!notification.read ? "border-primary/20 bg-primary/5" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-muted ${notification.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </TabsContent>

        <TabsContent value="goal" className="space-y-4">
          {notifications
            .filter((n) => n.type === "goal")
            .map((notification) => {
              const IconComponent = notification.icon
              return (
                <Card key={notification.id} className={`${!notification.read ? "border-primary/20 bg-primary/5" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-muted ${notification.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </TabsContent>

        <TabsContent value="investment" className="space-y-4">
          {notifications
            .filter((n) => n.type === "investment")
            .map((notification) => {
              const IconComponent = notification.icon
              return (
                <Card key={notification.id} className={`${!notification.read ? "border-primary/20 bg-primary/5" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-muted ${notification.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Customize when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationSettings.map((category, index) => (
                <div key={index} className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{category.category}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="space-y-3 pl-4">
                    {category.settings.map((setting, settingIndex) => (
                      <div key={settingIndex} className="flex items-center justify-between">
                        <span className="text-sm">{setting.name}</span>
                        <Switch defaultChecked={setting.enabled} />
                      </div>
                    ))}
                  </div>
                  {index < notificationSettings.length - 1 && <div className="border-t" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Methods</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications in the app</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">SMS Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
