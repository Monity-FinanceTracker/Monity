"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "./profile-settings"
import { SecuritySettings } from "./security-settings"
import { SubscriptionSettings } from "./subscription-settings"
import { PreferencesSettings } from "./preferences-settings"
import { AccountSettings } from "./account-settings"
import { User, Shield, Crown, Settings, Database } from "lucide-react"

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 bg-card border border-border/50">
        <TabsTrigger value="profile" className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Security</span>
        </TabsTrigger>
        <TabsTrigger value="subscription" className="flex items-center space-x-2">
          <Crown className="w-4 h-4" />
          <span className="hidden sm:inline">Subscription</span>
        </TabsTrigger>
        <TabsTrigger value="preferences" className="flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Preferences</span>
        </TabsTrigger>
        <TabsTrigger value="account" className="flex items-center space-x-2">
          <Database className="w-4 h-4" />
          <span className="hidden sm:inline">Account</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>
      <TabsContent value="subscription">
        <SubscriptionSettings />
      </TabsContent>
      <TabsContent value="preferences">
        <PreferencesSettings />
      </TabsContent>
      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>
    </Tabs>
  )
}
