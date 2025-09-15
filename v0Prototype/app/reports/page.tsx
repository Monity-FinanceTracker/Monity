"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, CalendarIcon, Filter, Clock, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

const reportTemplates = [
  {
    id: 1,
    name: "Monthly Financial Summary",
    description: "Comprehensive overview of income, expenses, and savings",
    type: "Summary",
    frequency: "Monthly",
    lastGenerated: "2024-06-01",
    status: "ready",
  },
  {
    id: 2,
    name: "Tax Preparation Report",
    description: "Categorized expenses and income for tax filing",
    type: "Tax",
    frequency: "Annual",
    lastGenerated: "2024-01-15",
    status: "ready",
  },
  {
    id: 3,
    name: "Investment Performance",
    description: "Portfolio analysis and performance metrics",
    type: "Investment",
    frequency: "Quarterly",
    lastGenerated: "2024-04-01",
    status: "generating",
  },
  {
    id: 4,
    name: "Expense Category Analysis",
    description: "Detailed breakdown of spending patterns by category",
    type: "Analysis",
    frequency: "Monthly",
    lastGenerated: "2024-06-01",
    status: "ready",
  },
  {
    id: 5,
    name: "Budget vs Actual Report",
    description: "Compare planned budget against actual spending",
    type: "Budget",
    frequency: "Monthly",
    lastGenerated: "2024-06-01",
    status: "ready",
  },
  {
    id: 6,
    name: "Cash Flow Statement",
    description: "Detailed cash inflows and outflows analysis",
    type: "Cash Flow",
    frequency: "Monthly",
    lastGenerated: "2024-05-28",
    status: "ready",
  },
]

const recentReports = [
  {
    name: "May 2024 Financial Summary",
    type: "PDF",
    size: "2.4 MB",
    generated: "2024-06-01",
    downloaded: true,
  },
  {
    name: "Q1 2024 Investment Report",
    type: "Excel",
    size: "1.8 MB",
    generated: "2024-04-01",
    downloaded: false,
  },
  {
    name: "Tax Report 2023",
    type: "PDF",
    size: "3.2 MB",
    generated: "2024-01-15",
    downloaded: true,
  },
]

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Financial Reports</h1>
          <p className="text-muted-foreground mt-2">Generate and download comprehensive financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {selectedDate ? format(selectedDate, "PPP") : "Select date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Summary</CardTitle>
            <CardDescription>Generate this month's financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Now
            </Button>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/20 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Tax Report</CardTitle>
            <CardDescription>Prepare tax-ready expense categorization</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/20 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Custom Report</CardTitle>
            <CardDescription>Build a report with specific parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Pre-configured reports for common financial analysis needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportTemplates.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Checkbox />
                  <div>
                    <h4 className="font-semibold">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{report.type}</Badge>
                      <Badge variant="secondary">{report.frequency}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Last: {format(new Date(report.lastGenerated), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.status === "generating" ? (
                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
                      <Clock className="h-3 w-3 mr-1" />
                      Generating
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports available for download</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.size} • Generated {format(new Date(report.generated), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.downloaded && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      Downloaded
                    </Badge>
                  )}
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Features */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Advanced Reporting
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Premium
            </Badge>
          </CardTitle>
          <CardDescription>Unlock advanced reporting features with premium subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2">Automated Scheduling</h4>
              <p className="text-sm text-muted-foreground">Set up automatic report generation and email delivery</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2">Custom Templates</h4>
              <p className="text-sm text-muted-foreground">Create and save your own report templates</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2">Multi-format Export</h4>
              <p className="text-sm text-muted-foreground">Export to Excel, CSV, JSON, and more formats</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2">Advanced Analytics</h4>
              <p className="text-sm text-muted-foreground">Include predictive analytics and trend forecasting</p>
            </div>
          </div>
          <Button className="w-full">Upgrade to Premium</Button>
        </CardContent>
      </Card>
    </div>
  )
}
