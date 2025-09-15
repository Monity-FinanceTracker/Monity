import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Target, Download, Filter } from "lucide-react"

const monthlyData = [
  { month: "Jan", income: 8500, expenses: 6200, savings: 2300 },
  { month: "Feb", income: 9200, expenses: 6800, savings: 2400 },
  { month: "Mar", income: 8800, expenses: 7100, savings: 1700 },
  { month: "Apr", income: 9500, expenses: 6900, savings: 2600 },
  { month: "May", income: 10200, expenses: 7300, savings: 2900 },
  { month: "Jun", income: 9800, expenses: 7500, savings: 2300 },
]

const categoryData = [
  { name: "Food & Dining", value: 2400, color: "#10b981" },
  { name: "Transportation", value: 1200, color: "#3b82f6" },
  { name: "Shopping", value: 1800, color: "#8b5cf6" },
  { name: "Entertainment", value: 800, color: "#f59e0b" },
  { name: "Bills & Utilities", value: 1500, color: "#ef4444" },
  { name: "Healthcare", value: 600, color: "#06b6d4" },
]

const trendData = [
  { date: "2024-01", netWorth: 45000 },
  { date: "2024-02", netWorth: 47300 },
  { date: "2024-03", netWorth: 49100 },
  { date: "2024-04", netWorth: 51700 },
  { date: "2024-05", netWorth: 54600 },
  { date: "2024-06", netWorth: 56900 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Financial Analytics</h1>
          <p className="text-muted-foreground mt-2">Deep insights into your financial patterns and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="6months">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">+26.4%</div>
            <p className="text-xs text-muted-foreground">+$11,900 this period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.5%</div>
            <p className="text-xs text-muted-foreground">Above 20% target</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Variance</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-8.2%</div>
            <p className="text-xs text-muted-foreground">Lower than last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76.5%</div>
            <p className="text-xs text-muted-foreground">Of total income</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="income" fill="hsl(var(--primary))" radius={4} />
                <Bar dataKey="expenses" fill="hsl(var(--muted))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Spending by category this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Net Worth Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Net Worth Progression</CardTitle>
          <CardDescription>Your financial growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={trendData}>
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
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            AI Financial Insights
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Premium
            </Badge>
          </CardTitle>
          <CardDescription>Personalized recommendations based on your spending patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">Optimization Opportunity</h4>
            <p className="text-sm text-muted-foreground">
              You could save an additional $340/month by reducing dining out expenses by 25% and switching to a
              high-yield savings account.
            </p>
          </div>
          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <h4 className="font-semibold text-blue-600 mb-2">Investment Recommendation</h4>
            <p className="text-sm text-muted-foreground">
              Based on your risk profile and savings rate, consider allocating 15% more to growth investments to reach
              your retirement goal 3 years earlier.
            </p>
          </div>
          <div className="p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
            <h4 className="font-semibold text-orange-600 mb-2">Budget Alert</h4>
            <p className="text-sm text-muted-foreground">
              Your entertainment spending is trending 18% above your monthly budget. Consider setting up automatic
              alerts for this category.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
