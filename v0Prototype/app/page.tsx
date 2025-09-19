import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { BalanceTrendChart } from "@/components/dashboard/balance-trend-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Wallet, TrendingDown, Target } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Welcome back, John</h1>
              <p className="text-muted-foreground text-lg">Here's your financial overview for today</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <BalanceCard
                title="Total Balance"
                amount="$12,450.00"
                change="+2.5%"
                trend="up"
                icon={<Wallet className="h-4 w-4 text-primary" />}
              />
              <BalanceCard
                title="Monthly Spending"
                amount="$3,240.00"
                change="-5.2%"
                trend="down"
                icon={<TrendingDown className="h-4 w-4 text-chart-2" />}
              />
              <BalanceCard
                title="Savings Goals"
                amount="$8,750.00"
                change="+12.8%"
                trend="up"
                icon={<Target className="h-4 w-4 text-accent" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BalanceTrendChart />
              <ExpenseChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentTransactions />
              </div>
              <div className="space-y-6">
                <QuickActions />
                <AIInsights />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
