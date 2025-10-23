"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Building,
  PawPrint,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

const COLORS = {
  primary: "#14b8a6", // teal-500
  secondary: "#0ea5e9", // sky-500
  success: "#22c55e", // green-500
  warning: "#f59e0b", // amber-500
  danger: "#ef4444", // red-500
  purple: "#a855f7", // purple-500
  pink: "#ec4899", // pink-500
  indigo: "#6366f1", // indigo-500
}

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple]

export default function AnalyticsPage() {
  const [overviewData, setOverviewData] = useState<any>(null)
  const [petData, setPetData] = useState<any>(null)
  const [applicationData, setApplicationData] = useState<any>(null)
  const [trendData, setTrendData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trendPeriod, setTrendPeriod] = useState("30")

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  useEffect(() => {
    fetchTrendData()
  }, [trendPeriod])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      const [overviewRes, petRes, applicationRes] = await Promise.all([
        fetch('/api/admin/analytics/overview'),
        fetch('/api/admin/analytics/pets'),
        fetch('/api/admin/analytics/applications'),
      ])

      if (overviewRes.ok) {
        const data = await overviewRes.json()
        console.log('Overview Data:', data)
        setOverviewData(data)
      }
      if (petRes.ok) {
        const data = await petRes.json()
        console.log('Pet Data:', data)
        setPetData(data)
      }
      if (applicationRes.ok) {
        const data = await applicationRes.json()
        console.log('Application Data:', data)
        setApplicationData(data)
      } else {
        console.error('Application API failed:', applicationRes.status, await applicationRes.text())
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTrendData = async () => {
    try {
      const res = await fetch(`/api/admin/analytics/trends?period=${trendPeriod}`)
      if (res.ok) setTrendData(await res.json())
    } catch (error) {
      console.error('Error fetching trends:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: "Total Users",
      value: overviewData?.users?.total || 0,
      change: `+${overviewData?.users?.newLast30Days || 0} this month`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Active Shelters",
      value: overviewData?.shelters?.active || 0,
      change: "Active organizations",
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Available Pets",
      value: overviewData?.pets?.available || 0,
      change: `${overviewData?.pets?.total || 0} total pets`,
      icon: PawPrint,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Applications",
      value: overviewData?.applications?.total || 0,
      change: `${overviewData?.applications?.approvalRate || 0}% approval rate`,
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeIn}>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-2">Comprehensive insights into platform performance</p>
      </motion.div>

      {/* Overview Stats */}
      <motion.section variants={fadeIn}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Trends Section */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>Track platform growth over time</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={trendPeriod === "7" ? "default" : "outline"}
                  onClick={() => setTrendPeriod("7")}
                >
                  7 Days
                </Button>
                <Button
                  size="sm"
                  variant={trendPeriod === "30" ? "default" : "outline"}
                  onClick={() => setTrendPeriod("30")}
                >
                  30 Days
                </Button>
                <Button
                  size="sm"
                  variant={trendPeriod === "90" ? "default" : "outline"}
                  onClick={() => setTrendPeriod("90")}
                >
                  90 Days
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="pets">Pets</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData?.users || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      name="New Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="applications" className="pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData?.applications || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke={COLORS.primary} name="Total" />
                    <Line type="monotone" dataKey="approved" stroke={COLORS.success} name="Approved" />
                    <Line type="monotone" dataKey="rejected" stroke={COLORS.danger} name="Rejected" />
                    <Line type="monotone" dataKey="pending" stroke={COLORS.warning} name="Pending" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="pets" className="pt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData?.pets || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="available"
                      stackId="1"
                      stroke={COLORS.success}
                      fill={COLORS.success}
                      name="Available"
                    />
                    <Area
                      type="monotone"
                      dataKey="adopted"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      name="Adopted"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.section>

      {/* Pet Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.section variants={fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle>Pet Distribution by Type</CardTitle>
              <CardDescription>Breakdown of pets by animal type</CardDescription>
            </CardHeader>
            <CardContent>
              {petData?.distribution?.byType && petData.distribution.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={petData.distribution.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.type}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {petData.distribution.byType.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <PawPrint className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No pet data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle>Pet Distribution by Status</CardTitle>
              <CardDescription>Current status of all pets</CardDescription>
            </CardHeader>
            <CardContent>
              {petData?.distribution?.byStatus && petData.distribution.byStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={petData.distribution.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <PawPrint className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No pet data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Health & Behavioral Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.section variants={fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle>Health Statistics</CardTitle>
              <CardDescription>Pet health and care metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Vaccinated", value: petData?.health?.percentages?.vaccinated || 0, color: COLORS.success },
                  { label: "Neutered/Spayed", value: petData?.health?.percentages?.neutered || 0, color: COLORS.primary },
                  { label: "Microchipped", value: petData?.health?.percentages?.microchipped || 0, color: COLORS.secondary },
                  { label: "House Trained", value: petData?.health?.percentages?.houseTrained || 0, color: COLORS.purple },
                  { label: "Special Needs", value: petData?.health?.percentages?.specialNeeds || 0, color: COLORS.warning },
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{stat.label}</span>
                      <span className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${stat.value}%`,
                          backgroundColor: stat.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle>Behavioral Traits</CardTitle>
              <CardDescription>Compatibility with families</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    {
                      name: "Good with Kids",
                      percentage: parseFloat(petData?.behavioral?.percentages?.goodWithKids || 0),
                    },
                    {
                      name: "Good with Dogs",
                      percentage: parseFloat(petData?.behavioral?.percentages?.goodWithDogs || 0),
                    },
                    {
                      name: "Good with Cats",
                      percentage: parseFloat(petData?.behavioral?.percentages?.goodWithCats || 0),
                    },
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill={COLORS.success} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Application Analytics */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Application Funnel</CardTitle>
            <CardDescription>Track application progression through stages</CardDescription>
          </CardHeader>
          <CardContent>
            {applicationData?.funnel ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { stage: "Submitted", count: applicationData.funnel.submitted || 0 },
                      { stage: "Under Review", count: applicationData.funnel.underReview || 0 },
                      { stage: "Interview Stage", count: applicationData.funnel.interviewStage || 0 },
                      { stage: "Pending Approval", count: applicationData.funnel.pendingApproval || 0 },
                      { stage: "Approved", count: applicationData.funnel.approved || 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {applicationData.funnel.approvalRate || 0}%
                    </p>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {applicationData.funnel.rejectionRate || 0}%
                    </p>
                    <p className="text-sm text-gray-600">Rejection Rate</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Application Data...</h3>
                <p className="text-gray-500 text-center">
                  Please wait while we fetch application analytics.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* Top Performers */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.section variants={fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle>Top Shelters</CardTitle>
              <CardDescription>Shelters with most pets listed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(petData?.topShelters || []).slice(0, 5).map((shelter: any, index: number) => (
                  <div key={shelter.shelterId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{shelter.shelterName}</span>
                    </div>
                    <Badge variant="secondary">{shelter.petCount} pets</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle>Shelter Success Rates</CardTitle>
              <CardDescription>Application approval by shelter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(applicationData?.byShelter || []).slice(0, 5).map((shelter: any, index: number) => (
                  <div key={shelter.shelterId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{shelter.shelterName}</span>
                      <span className="text-sm font-bold text-green-600">{shelter.successRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500 transition-all"
                        style={{ width: `${shelter.successRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </motion.div>
  )
}
