import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { SavingsGoalsList } from "@/components/savings/savings-goals-list"
import { SavingsOverview } from "@/components/savings/savings-overview"

export default function SavingsGoalsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground text-balance">Savings Goals</h1>
                <p className="text-muted-foreground">Track and achieve your financial objectives</p>
              </div>
            </div>

            <SavingsOverview />
            <SavingsGoalsList />
          </div>
        </main>
      </div>
    </div>
  )
}
