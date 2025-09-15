"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  CreditCard,
  Target,
  Users,
  PieChart,
  Settings,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, current: true },
  { name: "Transactions", href: "/transactions", icon: CreditCard, current: false },
  { name: "Savings Goals", href: "/savings-goals", icon: Target, current: false },
  { name: "Budgets", href: "/budgets", icon: PieChart, current: false },
  { name: "Groups", href: "/groups", icon: Users, current: false, premium: true },
  { name: "Analytics", href: "/analytics", icon: TrendingUp, current: false, premium: true },
]

const bottomNavigation = [{ name: "Settings", href: "/settings", icon: Settings }]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">Monity</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={item.current ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-medium transition-colors",
                item.current
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "justify-center px-2",
              )}
            >
              <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.premium && (
                    <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Pro
                    </Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-sidebar-border">
        {bottomNavigation.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed && "justify-center px-2",
            )}
          >
            <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && item.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
