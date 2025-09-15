import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BudgetOverview } from "@/components/budgets/budget-overview"
import { BudgetList } from "@/components/budgets/budget-list"

export default function BudgetsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground text-balance">Budgets</h1>
                <p className="text-muted-foreground">Set spending limits and track your expenses</p>
              </div>
            </div>

            <BudgetOverview />
            <BudgetList />
          </div>
        </main>
      </div>
    </div>
  )
}
