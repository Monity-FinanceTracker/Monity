import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { PremiumFeatures } from "@/components/premium/premium-features"
import { PremiumPricing } from "@/components/premium/premium-pricing"

export default function PremiumPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground text-balance">Unlock Premium Features</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Take your financial management to the next level with AI-powered insights and advanced tools
              </p>
            </div>

            <PremiumFeatures />
            <PremiumPricing />
          </div>
        </main>
      </div>
    </div>
  )
}
