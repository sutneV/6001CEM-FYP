"use client"

import React, { useState, useEffect } from "react"
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
  Building2,
  Save,
  Upload,
  Shield,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe,
  PawPrint,
  ClipboardList,
  MessageSquare,
  Lock,
  EyeOff,
  Eye as EyeIcon
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { TwoFactorSettings } from "@/components/TwoFactorSettings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ShelterProfilePage() {
  const { user, login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState("profile")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [stats, setStats] = useState({
    pets: 0,
    applications: 0,
    messages: 0,
  })

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

  // Use ref to store the latest avatar URL to avoid stale state issues
  const latestAvatarRef = React.useRef(profileData.avatar)
  const hasInitiallyFetchedRef = React.useRef(false)

  React.useEffect(() => {
    latestAvatarRef.current = profileData.avatar
  }, [profileData.avatar])

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      // Only fetch once on initial mount
      if (hasInitiallyFetchedRef.current) return
      hasInitiallyFetchedRef.current = true

      try {
        const profileResponse = await fetch('/api/profile', {
          headers: {
            'x-user-data': JSON.stringify(user),
          },
        })

        if (profileResponse.ok) {
          const data = await profileResponse.json()
          setProfileData({
            shelterName: user?.shelter?.name || "",
            email: data.profile.email || "",
            phone: data.profile.phone || "",
            address: "",
            city: data.profile.city || "",
            website: "",
            description: data.profile.bio || "",
            registrationNumber: "",
            avatar: data.profile.avatar || "",
          })

          // Update 2FA status
          setTwoFactorEnabled(data.profile.twoFactorEnabled || false)

          // Update user context with avatar if it exists
          if (user && data.profile.avatar) {
            login({
              ...user,
              avatar: data.profile.avatar,
              bio: data.profile.bio,
              twoFactorEnabled: data.profile.twoFactorEnabled || false,
            })
          }
        }

        // Fetch pets count (filter by shelter)
        if (user?.shelter?.id) {
          const petsResponse = await fetch('/api/pets', {
            headers: {
              'x-user-data': JSON.stringify(user),
            },
          })
          if (petsResponse.ok) {
            const petsData = await petsResponse.json()
            // Filter pets by this shelter's ID
            const shelterPets = Array.isArray(petsData)
              ? petsData.filter((pet: any) => pet.shelter?.id === user.shelter?.id)
              : []
            setStats(prev => ({ ...prev, pets: shelterPets.length }))
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
          setStats(prev => ({ ...prev, applications: Array.isArray(appsData) ? appsData.length : 0 }))
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

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-user-data': JSON.stringify(user),
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const { url } = await uploadResponse.json()

      // Update profile data state
      setProfileData(prevData => {
        const newData = { ...prevData, avatar: url }
        return newData
      })

      toast.success("Logo uploaded! Don't forget to save changes.")
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
      // Use the latest avatar from ref to avoid stale state
      const dataToSave = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: profileData.email,
        phone: profileData.phone,
        city: profileData.city,
        bio: profileData.description,
        avatar: latestAvatarRef.current
      }

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
      setProfileData(prev => ({
        ...prev,
        email: data.profile.email,
        phone: data.profile.phone || "",
        city: data.profile.city || "",
        description: data.profile.bio || "",
        avatar: data.profile.avatar || "",
      }))

      // Update the user context to reflect changes across the entire app
      if (user) {
        login({
          ...user,
          email: data.profile.email,
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

  const handlePasswordChange = async () => {
    if (!user) return

    const newErrors: Record<string, string> = {}

    // Validate current password
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    // Validate new password
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])/.test(passwordData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one lowercase letter"
    } else if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one uppercase letter"
    } else if (!/(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one number"
    } else if (!/(?=.*[@$!%*?&#])/.test(passwordData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one special character (@$!%*?&#)"
    }

    // Validate confirm password
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      toast.success("Password changed successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setPasswordErrors({})
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error(error.message || "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  const sections = [
    { id: "profile", label: "Profile", icon: Building2 },
    { id: "security", label: "Security", icon: Shield },
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
          <div className="p-6">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shelter Information</h2>
                  <p className="text-gray-600 mt-1">Update your shelter details and profile picture</p>
                </div>

                {/* Profile Header Card */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200 p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                        <AvatarImage src={profileData.avatar} />
                        <AvatarFallback className="text-2xl bg-teal-500 text-white">
                          {profileData.shelterName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        id="avatar-upload-shelter"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                        onClick={() => document.getElementById('avatar-upload-shelter')?.click()}
                        type="button"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {profileData.shelterName}
                      </h3>
                      <p className="text-gray-600 mt-1">Animal Shelter</p>
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
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Pets</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pets}</p>
                      </div>
                      <div className="h-12 w-12 bg-teal-50 rounded-lg flex items-center justify-center">
                        <PawPrint className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Applications</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.applications}</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <ClipboardList className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Messages</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.messages}</p>
                      </div>
                      <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Form */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                    <p className="text-sm text-gray-600 mt-1">Update your shelter information</p>
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

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                  <p className="text-gray-600 mt-1">Manage your shelter account security and authentication</p>
                </div>

                {/* Change Password */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                            setPasswordErrors({ ...passwordErrors, currentPassword: "" })
                          }}
                          className={passwordErrors.currentPassword ? "border-red-500" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                            setPasswordErrors({ ...passwordErrors, newPassword: "" })
                          }}
                          className={passwordErrors.newPassword ? "border-red-500" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&#)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                            setPasswordErrors({ ...passwordErrors, confirmPassword: "" })
                          }}
                          className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    <Button
                      onClick={handlePasswordChange}
                      disabled={isLoading}
                      className="bg-teal-500 hover:bg-teal-600"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Change Password
                    </Button>
                  </CardContent>
                </Card>

                <TwoFactorSettings user={user} twoFactorEnabled={twoFactorEnabled} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
