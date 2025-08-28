"use client"

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

export default function AdminDashboardPage() {
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
            { label: "Total Users", value: "2,847", change: "+12%", icon: Users, color: "text-blue-600" },
            { label: "Active Shelters", value: "23", change: "+2", icon: Building, color: "text-green-600" },
            { label: "Available Pets", value: "156", change: "+8", icon: PawPrint, color: "text-purple-600" },
            {
              label: "Pending Applications",
              value: "47",
              change: "-3",
              icon: ClipboardList,
              color: "text-orange-600",
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
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {[
                  {
                    action: "New shelter registered",
                    details: "Penang Animal Welfare Society joined",
                    time: "2 hours ago",
                    icon: Building,
                    color: "bg-green-100 text-green-700",
                  },
                  {
                    action: "Application approved",
                    details: "Buddy adopted by Sarah Chen",
                    time: "4 hours ago",
                    icon: CheckCircle2,
                    color: "bg-blue-100 text-blue-700",
                  },
                  {
                    action: "New pet added",
                    details: "Luna (Ragdoll Cat) by SPCA Penang",
                    time: "6 hours ago",
                    icon: PawPrint,
                    color: "bg-purple-100 text-purple-700",
                  },
                  {
                    action: "User reported issue",
                    details: "Application form not loading",
                    time: "8 hours ago",
                    icon: AlertTriangle,
                    color: "bg-yellow-100 text-yellow-700",
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    variants={popIn}
                    whileHover={{ x: 5 }}
                    className="flex gap-4 rounded-lg border p-3"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${activity.color}`}
                    >
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.action}</h4>
                      <p className="mt-1 text-xs text-gray-500">{activity.details}</p>
                      <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.section>

        {/* System Alerts */}
        <motion.section variants={fadeIn}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {[
                  {
                    title: "High Application Volume",
                    description: "47 pending applications need review",
                    priority: "high",
                    icon: ClipboardList,
                  },
                  {
                    title: "Shelter Capacity Alert",
                    description: "3 shelters approaching capacity limits",
                    priority: "medium",
                    icon: Building,
                  },
                  {
                    title: "System Maintenance Due",
                    description: "Scheduled maintenance in 2 days",
                    priority: "low",
                    icon: Settings,
                  },
                  {
                    title: "New User Registrations",
                    description: "15 new users registered today",
                    priority: "info",
                    icon: Users,
                  },
                ].map((alert, index) => (
                  <motion.div
                    key={index}
                    variants={popIn}
                    whileHover={{ y: -2 }}
                    className="flex gap-4 rounded-lg border p-3"
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${
                        alert.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : alert.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : alert.priority === "low"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      <alert.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="mt-1 text-xs text-gray-500">{alert.description}</p>
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
                ))}
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
                    <p className="text-2xl font-bold text-blue-600">+12%</p>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-green-600">1,847</p>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">New Registrations</p>
                    <p className="text-2xl font-bold text-purple-600">156</p>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="shelters" className="mt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Active Shelters</p>
                    <p className="text-2xl font-bold text-green-600">23</p>
                    <Progress value={90} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-600">3</p>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total Capacity</p>
                    <p className="text-2xl font-bold text-blue-600">450</p>
                    <Progress value={70} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="adoptions" className="mt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Successful Adoptions</p>
                    <p className="text-2xl font-bold text-green-600">342</p>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pending Applications</p>
                    <p className="text-2xl font-bold text-orange-600">47</p>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Success Rate</p>
                    <p className="text-2xl font-bold text-blue-600">87%</p>
                    <Progress value={87} className="h-2" />
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