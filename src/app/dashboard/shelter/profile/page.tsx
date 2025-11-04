"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Bell,
  Eye,
  Building2,
  Save,
  Upload,
  Shield,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export default function ShelterProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState("profile")

  const [profileData, setProfileData] = useState({
    shelterName: user?.shelter?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: user?.city || "",
    website: "",
    description: "",
    registrationNumber: "",
    avatar: "",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    newApplications: true,
    applicationUpdates: true,
    events: true,
    messages: true,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareData: false,
    marketing: true,
    analytics: true,
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
    }
    setIsLoading(false)
  }

  const sections = [
    { id: "profile", label: "Profile", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Eye },
  ]

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-64">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your shelter</p>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Profile Preview removed */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-3xl mx-auto">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shelter Information</h2>
                  <p className="text-gray-600 mt-1">Update your shelter details and contact information</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback className="text-lg">
                        {profileData.shelterName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </Button>
                      <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Shelter Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="shelterName">Shelter Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="shelterName"
                          className="pl-10"
                          value={profileData.shelterName}
                          onChange={(e) => setProfileData({ ...profileData, shelterName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          className="pl-10"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          className="pl-10"
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          placeholder="Street address"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="website"
                          type="url"
                          className="pl-10"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        value={profileData.registrationNumber}
                        onChange={(e) => setProfileData({ ...profileData, registrationNumber: e.target.value })}
                        placeholder="Official registration number (if applicable)"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">About Us</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell adopters about your shelter, mission, and values..."
                      value={profileData.description}
                      onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
                  <p className="text-gray-600 mt-1">Choose how you want to be notified about updates</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                  {/* Notification Methods */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Methods</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive updates via email</p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-gray-500">Browser and mobile notifications</p>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-gray-500">Text message alerts</p>
                        </div>
                        <Switch
                          checked={notifications.sms}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Notification Types */}
                  <div className="space-y-4">
                    <h4 className="font-medium">What to notify me about</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>New Applications</Label>
                          <p className="text-sm text-gray-500">When someone submits an adoption application</p>
                        </div>
                        <Switch
                          checked={notifications.newApplications}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, newApplications: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Application Updates</Label>
                          <p className="text-sm text-gray-500">When adopters update their applications</p>
                        </div>
                        <Switch
                          checked={notifications.applicationUpdates}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, applicationUpdates: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Community Events</Label>
                          <p className="text-sm text-gray-500">Upcoming events and meetups</p>
                        </div>
                        <Switch
                          checked={notifications.events}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, events: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Messages</Label>
                          <p className="text-sm text-gray-500">New messages from adopters</p>
                        </div>
                        <Switch
                          checked={notifications.messages}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isLoading ? "Saving..." : "Save Notifications"}
                  </Button>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>
                  <p className="text-gray-600 mt-1">Control your privacy and data sharing preferences</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Public Profile</Label>
                        <p className="text-sm text-gray-500">Allow your shelter to be discovered by adopters</p>
                      </div>
                      <Switch
                        checked={privacy.profileVisible}
                        onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Data Sharing</Label>
                        <p className="text-sm text-gray-500">Share anonymized data to improve our services</p>
                      </div>
                      <Switch
                        checked={privacy.shareData}
                        onCheckedChange={(checked) => setPrivacy({ ...privacy, shareData: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Marketing Communications</Label>
                        <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
                      </div>
                      <Switch
                        checked={privacy.marketing}
                        onCheckedChange={(checked) => setPrivacy({ ...privacy, marketing: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Analytics</Label>
                        <p className="text-sm text-gray-500">Help us improve by sharing usage analytics</p>
                      </div>
                      <Switch
                        checked={privacy.analytics}
                        onCheckedChange={(checked) => setPrivacy({ ...privacy, analytics: checked })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-red-600 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Danger Zone
                    </h4>
                    <div className="border border-red-200 rounded-lg p-4 space-y-3">
                      <div>
                        <Label className="text-red-600">Delete Shelter Account</Label>
                        <p className="text-sm text-gray-500">Permanently delete your shelter account and all associated data</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isLoading ? "Saving..." : "Save Privacy Settings"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
