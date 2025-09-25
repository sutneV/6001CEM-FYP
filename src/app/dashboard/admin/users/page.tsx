"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, MoreVertical, ArrowLeft, Mail, Phone, Ban, CheckCircle, XCircle, User, Shield, Building } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  profile?: {
    phone?: string
    address?: string
  }
  shelter?: {
    id: string
    name: string
  }
}

export default function UsersPage() {
  const { user } = useAuth()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileUsers, setShowMobileUsers] = useState(false)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)
  const [userDetails, setUserDetails] = useState<UserData | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchUserDetails = useCallback(async (userId: string) => {
    if (!user) return

    try {
      setLoadingUserDetails(true)
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user details')
      }

      const data = await response.json()
      setUserDetails(data.user)
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('Failed to load user details')
    } finally {
      setLoadingUserDetails(false)
    }
  }, [user])

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId)
    fetchUserDetails(userId)
    setShowMobileUsers(false)
  }

  const handleUserAction = async (userId: string, action: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`)
      }

      toast.success(`User ${action}ed successfully`)
      fetchUsers()
      if (selectedUser === userId) {
        fetchUserDetails(userId)
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      toast.error(`Failed to ${action} user`)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'shelter':
        return <Building className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'suspended':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const filteredUsers = users.filter((user) => {
    return (
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const selectedUserData = users.find((user) => user.id === selectedUser) || userDetails

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Mobile Users Overlay */}
      {showMobileUsers && (
        <div className="absolute inset-0 z-50 bg-white md:hidden">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold">Users</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileUsers(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-1">
                {filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className={`mb-6 mx-1 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50 border-2 ${
                      selectedUser === user.id
                        ? "border-teal-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 shadow-sm"
                    }`}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex space-x-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${user.firstName[0]}${user.lastName[0]}`} />
                          <AvatarFallback>
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-medium text-sm truncate flex-1">{user.firstName} {user.lastName}</h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {getRoleIcon(user.role)}
                              <Badge className={`${getStatusColor(user.status)} text-white text-xs`}>
                                {user.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Desktop Users List */}
      <div className="hidden md:flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-96 min-w-[24rem] max-w-[24rem]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold mb-3">Users</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md ${
                    selectedUser === user.id
                      ? "border-teal-500 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                  }`}
                  onClick={() => handleUserSelect(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${user.firstName[0]}${user.lastName[0]}`} />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate max-w-[140px]">{user.firstName} {user.lastName}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getRoleIcon(user.role)}
                          {loadingUserDetails && selectedUser === user.id && (
                            <div className="animate-spin rounded-full h-3 w-3 border border-teal-500 border-t-transparent"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 truncate max-w-[180px]">{user.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        <Badge className={`${getStatusColor(user.status)} text-white text-xs h-4 w-auto px-2 flex items-center justify-center rounded-full flex-shrink-0`}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No users found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* User Details Area */}
      {selectedUserData ? (
        <div className="flex-1 flex flex-col">
          {/* User Details Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowMobileUsers(true)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/placeholder.svg?height=48&width=48&text=${selectedUserData.firstName[0]}${selectedUserData.lastName[0]}`} />
                  <AvatarFallback>
                    {selectedUserData.firstName[0]}{selectedUserData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-lg">{selectedUserData.firstName} {selectedUserData.lastName}</h2>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(selectedUserData.role)}
                    <p className="text-sm text-gray-600 capitalize">{selectedUserData.role}</p>
                    <Badge className={`${getStatusColor(selectedUserData.status)} text-white text-xs`}>
                      {selectedUserData.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* User Details Content */}
          <ScrollArea className="flex-1 p-6">
            {loadingUserDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading user details...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-sm">{selectedUserData.firstName} {selectedUserData.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm">{selectedUserData.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Role</label>
                        <p className="text-sm capitalize">{selectedUserData.role}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <p className="text-sm capitalize">{selectedUserData.status}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm">{selectedUserData.profile?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm">{selectedUserData.profile?.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Details */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created At</label>
                        <p className="text-sm">{formatTime(selectedUserData.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-sm">{formatTime(selectedUserData.updatedAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Login</label>
                        <p className="text-sm">{selectedUserData.lastLoginAt ? formatTime(selectedUserData.lastLoginAt) : 'Never'}</p>
                      </div>
                      {selectedUserData.shelter && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Associated Shelter</label>
                          <p className="text-sm">{selectedUserData.shelter.name}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedUserData.status === 'active' ? (
                        <Button
                          variant="outline"
                          onClick={() => handleUserAction(selectedUserData.id, 'suspend')}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend User
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleUserAction(selectedUserData.id, 'activate')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate User
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleUserAction(selectedUserData.id, 'reset-password')}
                      >
                        Reset Password
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUserAction(selectedUserData.id, 'send-email')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a user</h3>
            <p className="text-gray-600">Choose a user from the list to view their details</p>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mt-4"
              onClick={() => setShowMobileUsers(true)}
            >
              View Users
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}