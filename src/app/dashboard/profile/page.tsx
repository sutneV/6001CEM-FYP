"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  User, 
  Bell, 
  Eye, 
  Heart, 
  Dog, 
  Cat, 
  Save, 
  Upload,
  Home,
  MessageSquare,
  Calendar,
  FileText,
  ClipboardList,
  Settings,
  LogOut,
  PawPrint,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Mei Ling",
    email: "meiling@example.com",
    phone: "+60 12-345 6789",
    location: "George Town, Penang",
    bio: "Animal lover and advocate for pet adoption. Looking to provide a loving home for a furry friend.",
    avatar: "/placeholder.svg?height=100&width=100",
  })

  const [preferences, setPreferences] = useState({
    petTypes: ["dogs", "cats"],
    sizes: ["medium", "large"],
    ages: ["adult"],
    specialNeeds: false,
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    newPets: true,
    applications: true,
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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "w-16" : "w-64"}`}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-teal-500" />
            {!sidebarCollapsed && <span className="text-xl font-bold">Penang Pet Pals</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto hidden h-8 w-8 lg:flex"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {[
              { name: "Dashboard", icon: Home, href: "/dashboard", active: false },
              { name: "My Applications", icon: ClipboardList, href: "/dashboard/applications" },
              { name: "Favorites", icon: Heart, href: "/dashboard/favorites" },
              { name: "Messages", icon: MessageSquare, href: "/dashboard/messages", badge: "3" },
              { name: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
              { name: "Resources", icon: FileText, href: "/dashboard/resources" },
            ].map((item) => (
              <motion.div key={item.name} whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <div className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      item.active ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`h-4 w-4 ${item.active ? "text-teal-700" : "text-gray-400"}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span>{item.name}</span>
                        {item.badge && <Badge className="ml-auto bg-teal-500">{item.badge}</Badge>}
                      </>
                    )}
                  </Link>
                  {sidebarCollapsed && item.badge && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-medium text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </nav>
          <div className="mt-6">
            {!sidebarCollapsed && (
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Account</div>
            )}
            <nav className={`grid gap-1 px-2 ${sidebarCollapsed ? "mt-2" : "mt-2"}`}>
              {[
                { name: "Profile", icon: User, href: "/dashboard/profile", active: true },
                { name: "Settings", icon: Settings, href: "/dashboard/settings" },
              ].map((item) => (
                <motion.div key={item.name} whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      item.active ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`h-4 w-4 ${item.active ? "text-teal-700" : "text-gray-400"}`} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </motion.div>
              ))}
              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <button 
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 ${
                    sidebarCollapsed ? "justify-center" : ""
                  }`}
                  title={sidebarCollapsed ? "Log Out" : undefined}
                >
                  <LogOut className="h-4 w-4 text-gray-400" />
                  {!sidebarCollapsed && <span>Log Out</span>}
                </button>
              </motion.div>
            </nav>
          </div>
        </div>
        <div className="border-t p-4">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>ML</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Mei Ling</span>
                  <span className="text-xs text-gray-500">mei.ling@example.com</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:px-6"
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Profile Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="relative h-8 w-8">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-medium text-white">
                    3
                  </span>
                </Button>
              </motion.div>
            </div>
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MessageSquare className="h-4 w-4" />
                  <span className="sr-only">Messages</span>
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-medium text-white">
                    2
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
            </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback className="text-lg">ML</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <Separator />

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself and what kind of pet you're looking for..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Pet Preferences
              </CardTitle>
              <CardDescription>Help us find the perfect pet match for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pet Types */}
              <div className="space-y-3">
                <Label>Preferred Pet Types</Label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: "dogs", label: "Dogs", icon: Dog },
                    { id: "cats", label: "Cats", icon: Cat },
                    { id: "rabbits", label: "Rabbits" },
                    { id: "birds", label: "Birds" },
                    { id: "others", label: "Others" },
                  ].map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={preferences.petTypes.includes(type.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences({
                              ...preferences,
                              petTypes: [...preferences.petTypes, type.id],
                            })
                          } else {
                            setPreferences({
                              ...preferences,
                              petTypes: preferences.petTypes.filter((t) => t !== type.id),
                            })
                          }
                        }}
                      />
                      <Label htmlFor={type.id} className="flex items-center gap-2">
                        {type.icon && <type.icon className="h-4 w-4" />}
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Size Preferences */}
              <div className="space-y-3">
                <Label>Preferred Sizes</Label>
                <div className="flex flex-wrap gap-3">
                  {["Small", "Medium", "Large"].map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={size}
                        checked={preferences.sizes.includes(size)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences({
                              ...preferences,
                              sizes: [...preferences.sizes, size],
                            })
                          } else {
                            setPreferences({
                              ...preferences,
                              sizes: preferences.sizes.filter((s) => s !== size),
                            })
                          }
                        }}
                      />
                      <Label htmlFor={size} className="capitalize">
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Age Preferences */}
              <div className="space-y-3">
                <Label>Preferred Ages</Label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: "puppy", label: "Puppy/Kitten (0-1 year)" },
                    { id: "adult", label: "Adult (1-7 years)" },
                    { id: "senior", label: "Senior (7+ years)" },
                  ].map((age) => (
                    <div key={age.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={age.id}
                        checked={preferences.ages.includes(age.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences({
                              ...preferences,
                              ages: [...preferences.ages, age.id],
                            })
                          } else {
                            setPreferences({
                              ...preferences,
                              ages: preferences.ages.filter((a) => a !== age.id),
                            })
                          }
                        }}
                      />
                      <Label htmlFor={age.id}>{age.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Special Needs */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Special Needs Pets</Label>
                  <p className="text-sm text-gray-500">
                    Open to adopting pets with special medical or behavioral needs
                  </p>
                </div>
                <Switch
                  checked={preferences.specialNeeds}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, specialNeeds: checked })}
                />
              </div>

              <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Choose how you want to be notified about updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      <Label>New Pet Matches</Label>
                      <p className="text-sm text-gray-500">When pets matching your preferences are available</p>
                    </div>
                    <Switch
                      checked={notifications.newPets}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, newPets: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Application Updates</Label>
                      <p className="text-sm text-gray-500">Status changes on your adoption applications</p>
                    </div>
                    <Switch
                      checked={notifications.applications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, applications: checked })}
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
                      <p className="text-sm text-gray-500">New messages from shelters</p>
                    </div>
                    <Switch
                      checked={notifications.messages}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save Notifications"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-sm text-gray-500">Allow shelters to view your profile information</p>
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
                <h4 className="font-medium text-red-600">Danger Zone</h4>
                <div className="border border-red-200 rounded-lg p-4 space-y-3">
                  <div>
                    <Label className="text-red-600">Delete Account</Label>
                    <p className="text-sm text-gray-500">Permanently delete your account and all associated data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
