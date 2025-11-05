"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Bell,
  Eye,
  Heart,
  Dog,
  Cat,
  Save,
  Upload,
  Shield,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { TwoFactorSettings } from "@/components/TwoFactorSettings"

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState("profile")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [stats, setStats] = useState({
    applications: 0,
    favorites: 0,
    messages: 0,
  })

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    bio: "",
    avatar: "",
  })

  // Use ref to store the latest avatar URL to avoid stale state issues
  const latestAvatarRef = React.useRef(profileData.avatar)
  const hasInitiallyFetchedRef = React.useRef(false)

  React.useEffect(() => {
    latestAvatarRef.current = profileData.avatar
  }, [profileData.avatar])

  // Fetch user profile and stats
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      // Only fetch once on initial mount to avoid refetching when user context updates
      if (hasInitiallyFetchedRef.current) return
      hasInitiallyFetchedRef.current = true

      try {
        // Fetch user profile
        const profileResponse = await fetch('/api/profile', {
          headers: {
            'x-user-data': JSON.stringify(user),
          },
        })
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setProfileData({
            firstName: profileData.profile.firstName || "",
            lastName: profileData.profile.lastName || "",
            email: profileData.profile.email || "",
            phone: profileData.profile.phone || "",
            city: profileData.profile.city || "",
            bio: profileData.profile.bio || "",
            avatar: profileData.profile.avatar || "",
          })

          // Update 2FA status
          setTwoFactorEnabled(profileData.profile.twoFactorEnabled || false)

          // Update user context with avatar and bio if they exist in the profile
          if (user && (profileData.profile.avatar || profileData.profile.bio)) {
            login({
              ...user,
              avatar: profileData.profile.avatar,
              bio: profileData.profile.bio,
              twoFactorEnabled: profileData.profile.twoFactorEnabled || false,
            })
          }
        }

        // Fetch applications count
        const appsResponse = await fetch('/api/applications', {
          headers: {
            'x-user-data': JSON.stringify(user),
          },
        })
        if (appsResponse.ok) {
          const appsData = await appsResponse.json()
          // API returns array directly
          setStats(prev => ({ ...prev, applications: Array.isArray(appsData) ? appsData.length : 0 }))
        }

        // Fetch favorites count
        const favsResponse = await fetch('/api/favorites', {
          headers: {
            'x-user-data': JSON.stringify(user),
          },
        })
        if (favsResponse.ok) {
          const favsData = await favsResponse.json()
          // Check if response has favorites array
          setStats(prev => ({ ...prev, favorites: favsData.favorites?.length || (Array.isArray(favsData) ? favsData.length : 0) }))
        }

        // Fetch messages count
        const msgsResponse = await fetch('/api/messages/conversations', {
          headers: {
            'x-user-data': JSON.stringify(user),
          },
        })
        if (msgsResponse.ok) {
          const msgsData = await msgsResponse.json()
          setStats(prev => ({ ...prev, messages: msgsData.conversations?.length || 0 }))
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [user])

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    setIsLoading(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', fileName)
      formData.append('bucket', 'avatars')

      console.log('Uploading file:', fileName)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-user-data': JSON.stringify(user),
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        console.error('Upload failed:', errorData)
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const { url } = await uploadResponse.json()
      console.log('Upload successful, URL:', url)

      // Update profile data state
      setProfileData(prevData => {
        const newData = { ...prevData, avatar: url }
        console.log('Updated profileData state with avatar:', url)
        return newData
      })

      toast.success("Profile picture uploaded! Don't forget to save changes.")
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      console.log('profileData.avatar from state:', profileData.avatar)
      console.log('latestAvatarRef.current:', latestAvatarRef.current)

      // Use the latest avatar from ref to avoid stale state
      const dataToSave = {
        ...profileData,
        avatar: latestAvatarRef.current
      }

      console.log('Saving profile data:', JSON.stringify(dataToSave, null, 2))
      console.log('Avatar URL being saved:', dataToSave.avatar)

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify(dataToSave),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const data = await response.json()
      toast.success("Profile updated successfully!")

      // Update local profile data with response
      setProfileData({
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        email: data.profile.email,
        phone: data.profile.phone || "",
        city: data.profile.city || "",
        bio: data.profile.bio || "",
        avatar: data.profile.avatar || "",
      })

      // Update the user context to reflect changes across the entire app
      if (user) {
        login({
          ...user,
          firstName: data.profile.firstName,
          lastName: data.profile.lastName,
          phone: data.profile.phone,
          city: data.profile.city,
          bio: data.profile.bio,
          avatar: data.profile.avatar,
        })
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || "Failed to update profile")
    }
    setIsLoading(false)
  }

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Heart },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-64">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account</p>
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
          <div className="p-6">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-gray-600 mt-1">Update your personal details and profile picture</p>
                </div>

                {/* Profile Header Card */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200 p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                        <AvatarImage src={profileData.avatar} />
                        <AvatarFallback className="text-2xl bg-teal-500 text-white">
                          {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        type="button"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {profileData.firstName} {profileData.lastName}
                      </h3>
                      <p className="text-gray-600 mt-1">Pet Adopter</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm">
                          <Mail className="h-3.5 w-3.5 text-teal-600" />
                          <span className="text-gray-700">{profileData.email}</span>
                        </div>
                        {profileData.phone && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm">
                            <Phone className="h-3.5 w-3.5 text-teal-600" />
                            <span className="text-gray-700">{profileData.phone}</span>
                          </div>
                        )}
                        {profileData.city && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm">
                            <MapPin className="h-3.5 w-3.5 text-teal-600" />
                            <span className="text-gray-700">{profileData.city}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                    {user?.emailVerified && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Verified</p>
                          <p className="text-xs text-green-700">Email verified</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Applications</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.applications}</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Heart className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Favorites</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.favorites}</p>
                      </div>
                      <div className="h-12 w-12 bg-pink-50 rounded-lg flex items-center justify-center">
                        <Heart className="h-6 w-6 text-pink-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Messages</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.messages}</p>
                      </div>
                      <div className="h-12 w-12 bg-teal-50 rounded-lg flex items-center justify-center">
                        <Mail className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Form */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                    <p className="text-sm text-gray-600 mt-1">Update your account information</p>
                  </div>

                  <Separator />

                  {/* Personal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          className="pl-10"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          className="pl-10"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
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
                      <Label htmlFor="city">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="city"
                          className="pl-10"
                          value={profileData.city}
                          onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">About Me</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself and what kind of pet you're looking for..."
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      {profileData.bio.length}/500 characters
                    </p>
                  </div>

                  <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Pet Preferences</h2>
                  <p className="text-gray-600 mt-1">Help us find the perfect pet match for you</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
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
                          <Label htmlFor={type.id} className="flex items-center gap-2 cursor-pointer">
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
                      {["small", "medium", "large"].map((size) => (
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
                          <Label htmlFor={size} className="capitalize cursor-pointer">
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
                          <Label htmlFor={age.id} className="cursor-pointer">{age.label}</Label>
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
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isLoading ? "Saving..." : "Save Preferences"}
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
                    <h4 className="font-medium text-red-600 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Danger Zone
                    </h4>
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
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isLoading ? "Saving..." : "Save Privacy Settings"}
                  </Button>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                  <p className="text-gray-600 mt-1">Manage your account security and authentication</p>
                </div>

                <TwoFactorSettings user={user} twoFactorEnabled={twoFactorEnabled} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
