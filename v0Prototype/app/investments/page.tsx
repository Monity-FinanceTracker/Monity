import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Target, Plus, Eye, MoreHorizontal } from "lucide-react"

const portfolioData = [
  { date: "2024-01", value: 45000 },
  { date: "2024-02", value: 47200 },
  { date: "2024-03", value: 46800 },
  { date: "2024-04", value: 49100 },
  { date: "2024-05", value: 51300 },
  { date: "2024-06", value: 53600 },
]

const allocationData = [
  { name: "Stocks", value: 65, amount: 34840, color: "#10b981" },
  { name: "Bonds", value: 20, amount: 10720, color: "#3b82f6" },
  { name: "ETFs", value: 10, amount: 5360, color: "#8b5cf6" },
  { name: "Crypto", value: 3, amount: 1608, color: "#f59e0b" },
  { name: "Cash", value: 2, amount: 1072, color: "#6b7280" },
]

const holdings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 25,
    avgPrice: 180.5,
    currentPrice: 195.3,
    value: 4882.5,
    change: 8.2,
    allocation: 9.1,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    shares: 15,
    avgPrice: 340.2,
    currentPrice: 358.75,
    value: 5381.25,
    change: 5.5,
    allocation: 10.0,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 12,
    avgPrice: 142.8,
    currentPrice: 151.2,
    value: 1814.4,
    change: 5.9,
    allocation: 3.4,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    shares: 8,
    avgPrice: 220.15,
    currentPrice: 198.5,
    value: 1588.0,
    change: -9.8,
    allocation: 3.0,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    shares: 6,
    avgPrice: 450.3,
    currentPrice: 512.8,
    value: 3076.8,
    change: 13.9,
    allocation: 5.7,
  },
]

export default function InvestmentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Investment Portfolio</h1>
          <p className="text-muted-foreground mt-2">Track and manage your investment performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Investment
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$53,600</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-primary" />
              +19.1% all time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">+$342</div>
            <p className="text-xs text-muted-foreground">+0.64% today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+4.5%</div>
            <p className="text-xs text-muted-foreground">+$2,300 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dividend Yield</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.8%</div>
            <p className="text-xs text-muted-foreground">$125/month estimated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>6-month portfolio value trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Portfolio distribution by asset class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {allocationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${item.amount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{item.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Top Holdings</CardTitle>
          <CardDescription>Your largest investment positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {holdings.map((holding, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{holding.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{holding.symbol}</h4>
                    <p className="text-sm text-muted-foreground">{holding.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {holding.shares} shares • Avg: ${holding.avgPrice}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${holding.value.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">${holding.currentPrice}</div>
                  <div className={`text-xs flex items-center ${holding.change >= 0 ? "text-primary" : "text-red-500"}`}>
                    {holding.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {holding.change >= 0 ? "+" : ""}
                    {holding.change}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{holding.allocation}%</div>
                  <Progress value={holding.allocation} className="w-16 h-2 mt-1" />
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Goals */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Investment Goals
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Premium
            </Badge>
          </CardTitle>
          <CardDescription>Track progress towards your investment objectives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Retirement Fund</h4>
              <span className="text-sm text-muted-foreground">68% complete</span>
            </div>
            <Progress value={68} className="mb-2" />
            <p className="text-sm text-muted-foreground">$53,600 of $80,000 target by 2025</p>
          </div>
          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-600">House Down Payment</h4>
              <span className="text-sm text-muted-foreground">32% complete</span>
            </div>
            <Progress value={32} className="mb-2" />
            <p className="text-sm text-muted-foreground">$16,000 of $50,000 target by 2026</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
