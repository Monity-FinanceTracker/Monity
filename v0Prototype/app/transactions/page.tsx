import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { TransactionList } from "@/components/transactions/transaction-list"
import { TransactionFilters } from "@/components/transactions/transaction-filters"

export default function TransactionsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground text-balance">Transactions</h1>
                <p className="text-muted-foreground">Manage and track all your financial transactions</p>
              </div>
            </div>

            <TransactionFilters />
            <TransactionList />
          </div>
        </main>
      </div>
    </div>
  )
}
