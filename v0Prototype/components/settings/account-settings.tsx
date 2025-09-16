"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Download, Trash2, Calendar, Database, FileText, Shield } from "lucide-react"

export function AccountSettings() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: string) => {
    setIsExporting(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsExporting(false)
  }

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-card/95 border-border/50">
        <CardHeader>
          <CardTitle className="text-card-foreground">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border/50">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Member Since</span>
              </div>
              <p className="text-lg font-semibold text-foreground">December 1, 2023</p>
            </div>
            <div className="p-4 rounded-lg border border-border/50">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Data Usage</span>
              </div>
              <p className="text-lg font-semibold text-foreground">2.4 MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-card/95 border-border/50">
        <CardHeader>
          <CardTitle className="text-card-foreground">Data Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your financial data in various formats. This includes all your transactions, goals, budgets, and
            account information.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border/50">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">CSV Export</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Spreadsheet-friendly format for analysis</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-input border-border/50"
                onClick={() => handleExport("csv")}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-border/50">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-chart-2" />
                <span className="font-medium text-foreground">PDF Report</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Comprehensive financial report with charts</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-input border-border/50"
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {isExporting && (
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-sm text-accent">Preparing your data export... This may take a few moments.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-destructive/5 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-destructive mb-1">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data
                      from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>We take data privacy seriously. All deletions are permanent and irreversible.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
