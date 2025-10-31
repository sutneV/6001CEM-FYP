"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ChevronRight,
  PawPrint,
  FileText,
  CheckCircle2,
  ClipboardList,
  Users,
  Building,
  BarChart3,
  Settings,
  AlertTriangle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const popIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10,
    },
  },
}

interface DashboardStats {
  totalUsers: number
  userGrowth: number
  activeShelters: number
  availablePets: number
  adoptedPets: number
  pendingPets: number
  totalPets: number
  pendingApplications: number
  pendingShelterApps: number
  successRate: number
  todayNewUsers: number
}

interface Activity {
  type: string
  action: string
  details: string
  time: string
  icon: string
  color: string
}

interface Alert {
  title: string
  description: string
  priority: string
  icon: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [systemAlerts, setSystemAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats')
      const data = await response.json()

      if (response.ok && data.stats) {
        setStats(data.stats)
        setRecentActivity(data.recentActivity || [])
        setSystemAlerts(data.systemAlerts || [])
      } else {
        console.error('Failed to fetch dashboard stats:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
    const months = Math.floor(days / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Building,
      CheckCircle2,
      PawPrint,
      AlertTriangle,
      ClipboardList,
      Users,
      Settings,
    }
    return icons[iconName] || AlertTriangle
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6">
      {/* Welcome Section */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Welcome to Admin Dashboard</h2>
                <p className="text-gray-500">Manage the entire Penang Pet Adoption platform</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-teal-500 hover:bg-teal-600">
                  System Overview
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Admin Stats */}
      <motion.section variants={fadeIn}>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Total Users",
              value: stats?.totalUsers.toLocaleString() || "0",
              change: stats?.userGrowth ? `${stats.userGrowth > 0 ? '+' : ''}${stats.userGrowth}%` : "0%",
              icon: Users,
              color: "text-blue-600"
            },
            {
              label: "Active Shelters",
              value: stats?.activeShelters.toString() || "0",
              change: `${stats?.pendingShelterApps || 0} pending`,
              icon: Building,
              color: "text-green-600"
            },
            {
              label: "Available Pets",
              value: stats?.availablePets.toString() || "0",
              change: `${stats?.totalPets || 0} total`,
              icon: PawPrint,
              color: "text-purple-600"
            },
            {
              label: "Pending Applications",
              value: stats?.pendingApplications.toString() || "0",
              change: "Need review",
              icon: ClipboardList,
              color: "text-orange-600"
            },
          ].map((stat, index) => (
            <motion.div key={index} variants={popIn}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.change} from last month</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <stat.icon className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Recent Activity and Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <motion.section variants={fadeIn}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => {
                  const IconComponent = getIconComponent(activity.icon)
                  return (
                    <motion.div
                      key={index}
                      variants={popIn}
                      whileHover={{ y: -2 }}
                      className="flex gap-4 rounded-lg border p-3"
                    >
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${activity.color}`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.action}</h4>
                        <p className="text-sm text-gray-500">{activity.details}</p>
                        <p className="text-xs text-gray-400">{formatTimeAgo(activity.time)}</p>
                      </div>
                    </motion.div>
                  )
                }) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.section>

        {/* System Alerts */}
        <motion.section variants={fadeIn}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {systemAlerts.length > 0 ? systemAlerts.map((alert, index) => {
                  const IconComponent = getIconComponent(alert.icon)
                  return (
                    <motion.div
                      key={index}
                      variants={popIn}
                      whileHover={{ y: -2 }}
                      className="flex gap-4 rounded-lg border p-3"
                    >
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${
                          alert.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : alert.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : alert.priority === "low"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-gray-500">{alert.description}</p>
                      </div>
                      <Badge
                        variant={
                          alert.priority === "high"
                            ? "destructive"
                            : alert.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {alert.priority}
                      </Badge>
                    </motion.div>
                  )
                }) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No system alerts</p>
                  </div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Platform Overview */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Key metrics and performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="shelters">Shelters</TabsTrigger>
                <TabsTrigger value="adoptions">Adoptions</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="mt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">User Growth</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.userGrowth > 0 ? '+' : ''}{stats?.userGrowth}%</p>
                    <Progress value={Math.min(Math.abs(stats?.userGrowth || 0), 100)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.totalUsers.toLocaleString()}</p>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">New Today</p>
                    <p className="text-2xl font-bold text-purple-600">{stats?.todayNewUsers}</p>
                    <Progress value={Math.min((stats?.todayNewUsers || 0) * 5, 100)} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="shelters" className="mt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Active Shelters</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.activeShelters}</p>
                    <Progress value={Math.min((stats?.activeShelters || 0) * 4, 100)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats?.pendingShelterApps}</p>
                    <Progress value={Math.min((stats?.pendingShelterApps || 0) * 10, 100)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total Pets Managed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.totalPets}</p>
                    <Progress value={70} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="adoptions" className="mt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Successful Adoptions</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.adoptedPets}</p>
                    <Progress value={Math.min((stats?.adoptedPets || 0) / 5, 100)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pending Applications</p>
                    <p className="text-2xl font-bold text-orange-600">{stats?.pendingApplications}</p>
                    <Progress value={Math.min((stats?.pendingApplications || 0) * 2, 100)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Success Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.successRate}%</p>
                    <Progress value={stats?.successRate || 0} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="system" className="mt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">System Uptime</p>
                    <p className="text-2xl font-bold text-green-600">99.9%</p>
                    <Progress value={99} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Response Time</p>
                    <p className="text-2xl font-bold text-blue-600">120ms</p>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Error Rate</p>
                    <p className="text-2xl font-bold text-red-600">0.1%</p>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.section>

      {/* Quick Actions */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Link href="/dashboard/admin/users">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/dashboard/admin/shelters">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Building className="h-4 w-4" />
                  Approve Shelters
                </Button>
              </Link>
              <Link href="/dashboard/admin/applications">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Review Applications
                </Button>
              </Link>
              <Link href="/dashboard/admin/reports">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Generate Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  )
}