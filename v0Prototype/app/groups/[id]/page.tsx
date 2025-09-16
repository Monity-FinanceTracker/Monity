import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { GroupHeader } from "@/components/groups/group-header"
import { GroupExpenses } from "@/components/groups/group-expenses"
import { GroupMembers } from "@/components/groups/group-members"
import { GroupBalances } from "@/components/groups/group-balances"

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <GroupHeader groupId={params.id} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <GroupExpenses groupId={params.id} />
              </div>
              <div className="space-y-6">
                <GroupBalances groupId={params.id} />
                <GroupMembers groupId={params.id} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
