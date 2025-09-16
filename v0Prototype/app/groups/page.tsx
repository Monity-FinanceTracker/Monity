import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { GroupsList } from "@/components/groups/groups-list"
import { GroupsOverview } from "@/components/groups/groups-overview"

export default function GroupsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground text-balance">Groups</h1>
                <p className="text-muted-foreground">Share expenses and split costs with friends and family</p>
              </div>
            </div>

            <GroupsOverview />
            <GroupsList />
          </div>
        </main>
      </div>
    </div>
  )
}
