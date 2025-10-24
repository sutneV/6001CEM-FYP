"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Building,
  PawPrint,
  ClipboardList,
  TrendingUp,
  Activity,
  BarChart3,
  Search,
  ChevronRight,
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
  AreaChart,
  Area,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const COLORS = {
  primary: "#14b8a6",
  secondary: "#0ea5e9",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#a855f7",
  pink: "#ec4899",
  indigo: "#6366f1",
}

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple]

const categories = [
  { id: "users", name: "Users", icon: Users, description: "User analytics" },
  { id: "pets", name: "Pets", icon: PawPrint, description: "Pet analytics" },
  { id: "applications", name: "Applications", icon: ClipboardList, description: "Application funnel" },
  { id: "trends", name: "Trends", icon: TrendingUp, description: "Growth trends" },
  { id: "shelters", name: "Shelters", icon: Building, description: "Shelter performance" },
]

// Helper function to format status labels
const formatStatus = (status: string) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function AnalyticsPage() {
  const [overviewData, setOverviewData] = useState<any>(null)
  const [petData, setPetData] = useState<any>(null)
  const [applicationData, setApplicationData] = useState<any>(null)
  const [trendData, setTrendData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trendPeriod, setTrendPeriod] = useState("30")
  const [selectedCategory, setSelectedCategory] = useState("users")
  const [searchQuery, setSearchQuery] = useState("")

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
        setOverviewData(data)
      }
      if (petRes.ok) {
        const data = await petRes.json()
        setPetData(data)
      }
      if (applicationRes.ok) {
        const data = await applicationRes.json()
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

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden">
      {/* Sidebar - Categories */}
      <div className="hidden md:flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-80 min-w-[20rem] max-w-[20rem]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold mb-3">Analytics Dashboard</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredCategories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.id}
                  className={`p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md ${
                    selectedCategory === category.id
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          selectedCategory === category.id ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{category.name}</h3>
                        <p className="text-xs text-gray-500">{category.description}</p>
                      </div>
                    </div>
                    {selectedCategory === category.id && <ChevronRight className="h-4 w-4 text-teal-500" />}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">{overviewData?.users?.total || 0}</p>
              <p className="text-xs text-gray-600">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{overviewData?.pets?.total || 0}</p>
              <p className="text-xs text-gray-600">Total Pets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Users Section */}
          {selectedCategory === "users" && (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-2">User Analytics</h2>
                <p className="text-gray-600">Detailed user statistics and metrics</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-blue-100">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge className="bg-blue-500">Primary</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Adopters</p>
                    <p className="text-3xl font-bold text-blue-600">{overviewData?.users?.adopters || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">Users looking to adopt</p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-green-100">
                        <Building className="h-6 w-6 text-green-600" />
                      </div>
                      <Badge className="bg-green-500">Partners</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Shelters</p>
                    <p className="text-3xl font-bold text-green-600">{overviewData?.users?.shelters || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">Registered organizations</p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-purple-100">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <Badge className="bg-purple-500">Staff</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Admins</p>
                    <p className="text-3xl font-bold text-purple-600">{overviewData?.users?.admins || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">Platform administrators</p>
                  </CardContent>
                </Card>
              </div>

              {/* User Growth Chart */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Growth Trend</CardTitle>
                      <CardDescription>New user registrations over time</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={trendPeriod === "7" ? "default" : "outline"}
                        onClick={() => setTrendPeriod("7")}
                        className={trendPeriod === "7" ? "bg-teal-500 hover:bg-teal-600" : ""}
                      >
                        7d
                      </Button>
                      <Button
                        size="sm"
                        variant={trendPeriod === "30" ? "default" : "outline"}
                        onClick={() => setTrendPeriod("30")}
                        className={trendPeriod === "30" ? "bg-teal-500 hover:bg-teal-600" : ""}
                      >
                        30d
                      </Button>
                      <Button
                        size="sm"
                        variant={trendPeriod === "90" ? "default" : "outline"}
                        onClick={() => setTrendPeriod("90")}
                        className={trendPeriod === "90" ? "bg-teal-500 hover:bg-teal-600" : ""}
                      >
                        90d
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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
                        stroke={COLORS.primary}
                        fill={COLORS.primary}
                        fillOpacity={0.6}
                        name="New Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Stats Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Breakdown by role</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Adopters", value: overviewData?.users?.adopters || 0 },
                            { name: "Shelters", value: overviewData?.users?.shelters || 0 },
                            { name: "Admins", value: overviewData?.users?.admins || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: "Adopters", value: overviewData?.users?.adopters || 0 },
                            { name: "Shelters", value: overviewData?.users?.shelters || 0 },
                            { name: "Admins", value: overviewData?.users?.admins || 0 },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>User engagement metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-500">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">New Users (30d)</p>
                            <p className="text-xs text-gray-600">Recent registrations</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-blue-600">+{overviewData?.users?.newLast30Days || 0}</p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-500">
                            <Activity className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Active Shelters</p>
                            <p className="text-xs text-gray-600">Currently operating</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-green-600">{overviewData?.shelters?.active || 0}</p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-purple-500">
                            <TrendingUp className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Total Users</p>
                            <p className="text-xs text-gray-600">Platform-wide</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-purple-600">{overviewData?.users?.total || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Pets Section */}
          {selectedCategory === "pets" && (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-2">Pet Analytics</h2>
                <p className="text-gray-600">Comprehensive pet statistics</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Pet Distribution by Type</CardTitle>
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
                      <div className="h-[300px] flex items-center justify-center text-gray-400">
                        <PawPrint className="h-12 w-12 mb-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Health Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: "Vaccinated", value: petData?.health?.percentages?.vaccinated || 0, color: COLORS.success },
                        { label: "Neutered/Spayed", value: petData?.health?.percentages?.neutered || 0, color: COLORS.primary },
                        { label: "Microchipped", value: petData?.health?.percentages?.microchipped || 0, color: COLORS.secondary },
                        { label: "House Trained", value: petData?.health?.percentages?.houseTrained || 0, color: COLORS.purple },
                      ].map((stat, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{stat.label}</span>
                            <span className="text-sm font-bold" style={{ color: stat.color }}>
                              {stat.value}%
                            </span>
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
              </div>

              <Card className="border-2">
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

              {/* Additional Pet Stats */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Pet Status Overview</CardTitle>
                    <CardDescription>Current status distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {petData?.distribution?.byStatus && petData.distribution.byStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={petData.distribution.byStatus.map((item: any) => ({
                          ...item,
                          formattedStatus: formatStatus(item.status)
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="formattedStatus" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill={COLORS.primary} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-gray-400">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Behavioral Traits</CardTitle>
                    <CardDescription>Compatibility metrics</CardDescription>
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
              </div>

              {/* Top Breeds */}
              {petData?.topBreeds && petData.topBreeds.length > 0 && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Most Popular Breeds</CardTitle>
                    <CardDescription>Top breeds in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {petData.topBreeds.slice(0, 10).map((breed: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:border-teal-500 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                              {index + 1}
                            </div>
                            <span className="font-medium text-sm">{breed.breed}</span>
                          </div>
                          <Badge variant="outline">{breed.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Applications Section */}
          {selectedCategory === "applications" && (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-2">Application Analytics</h2>
                <p className="text-gray-600">Track application progression and success rates</p>
              </div>

              <Card className="border-2">
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
                        <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                          <p className="text-2xl font-bold text-green-600">{applicationData.funnel.approvalRate || 0}%</p>
                          <p className="text-sm text-gray-600">Approval Rate</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                          <p className="text-2xl font-bold text-red-600">{applicationData.funnel.rejectionRate || 0}%</p>
                          <p className="text-sm text-gray-600">Rejection Rate</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <ClipboardList className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">Loading application data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Shelter Success Rates</CardTitle>
                  <CardDescription>Application approval by shelter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(applicationData?.byShelter || []).slice(0, 5).map((shelter: any) => (
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

              {/* Additional Application Stats */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Applications by Pet Type</CardTitle>
                    <CardDescription>Distribution by animal type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {applicationData?.byPetType && applicationData.byPetType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={applicationData.byPetType}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.petType}: ${entry.count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {applicationData.byPetType.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-gray-400">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Application Status Distribution</CardTitle>
                    <CardDescription>Current status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {applicationData?.byStatus && applicationData.byStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={applicationData.byStatus.map((item: any) => ({
                            ...item,
                            formattedStatus: formatStatus(item.status)
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="formattedStatus"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill={COLORS.secondary} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[350px] flex items-center justify-center text-gray-400">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Top Applicants */}
              {applicationData?.topApplicants && applicationData.topApplicants.length > 0 && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Top Applicants</CardTitle>
                    <CardDescription>Most active users in the adoption process</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {applicationData.topApplicants.slice(0, 5).map((applicant: any, index: number) => (
                        <div
                          key={applicant.userId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:border-teal-500 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{applicant.userName}</p>
                              <p className="text-xs text-gray-500">{applicant.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-teal-600">{applicant.applicationCount} apps</p>
                            <p className="text-xs text-green-600">{applicant.approved} approved</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Trends Section */}
          {selectedCategory === "trends" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Growth Trends</h2>
                  <p className="text-gray-600">Track platform growth over time</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={trendPeriod === "7" ? "default" : "outline"}
                    onClick={() => setTrendPeriod("7")}
                    className={trendPeriod === "7" ? "bg-teal-500 hover:bg-teal-600" : ""}
                  >
                    7 Days
                  </Button>
                  <Button
                    size="sm"
                    variant={trendPeriod === "30" ? "default" : "outline"}
                    onClick={() => setTrendPeriod("30")}
                    className={trendPeriod === "30" ? "bg-teal-500 hover:bg-teal-600" : ""}
                  >
                    30 Days
                  </Button>
                  <Button
                    size="sm"
                    variant={trendPeriod === "90" ? "default" : "outline"}
                    onClick={() => setTrendPeriod("90")}
                    className={trendPeriod === "90" ? "bg-teal-500 hover:bg-teal-600" : ""}
                  >
                    90 Days
                  </Button>
                </div>
              </div>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>User Registrations</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Application Trends</CardTitle>
                  <CardDescription>Daily application submissions and outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData?.applications || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke={COLORS.primary} name="Total" strokeWidth={2} />
                      <Line type="monotone" dataKey="approved" stroke={COLORS.success} name="Approved" strokeWidth={2} />
                      <Line type="monotone" dataKey="rejected" stroke={COLORS.danger} name="Rejected" strokeWidth={2} />
                      <Line type="monotone" dataKey="pending" stroke={COLORS.warning} name="Pending" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Pet Listings Trend</CardTitle>
                  <CardDescription>New pets added to the platform</CardDescription>
                </CardHeader>
                <CardContent>
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
                        fillOpacity={0.6}
                        name="Available"
                      />
                      <Area
                        type="monotone"
                        dataKey="adopted"
                        stackId="2"
                        stroke={COLORS.primary}
                        fill={COLORS.primary}
                        fillOpacity={0.6}
                        name="Adopted"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Trend Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-blue-100">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">User Growth</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {trendData?.users?.reduce((sum: number, day: any) => sum + (day.count || 0), 0) || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Last {trendPeriod} days</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-green-100">
                        <ClipboardList className="h-6 w-6 text-green-600" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Applications</p>
                    <p className="text-3xl font-bold text-green-600">
                      {trendData?.applications?.reduce((sum: number, day: any) => sum + (day.total || 0), 0) || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Last {trendPeriod} days</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-purple-100">
                        <PawPrint className="h-6 w-6 text-purple-600" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Pets Listed</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {trendData?.pets?.reduce((sum: number, day: any) => sum + (day.count || 0), 0) || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Last {trendPeriod} days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Comparative Analysis */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Platform Activity Overview</CardTitle>
                  <CardDescription>Combined growth metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData?.users?.map((userDay: any, index: number) => ({
                      date: userDay.date,
                      users: userDay.count || 0,
                      applications: trendData?.applications?.[index]?.total || 0,
                      pets: trendData?.pets?.[index]?.count || 0,
                    })) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke={COLORS.primary} name="Users" strokeWidth={2} />
                      <Line type="monotone" dataKey="applications" stroke={COLORS.success} name="Applications" strokeWidth={2} />
                      <Line type="monotone" dataKey="pets" stroke={COLORS.purple} name="Pets" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {/* Shelters Section */}
          {selectedCategory === "shelters" && (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-2">Shelter Performance</h2>
                <p className="text-gray-600">Detailed shelter analytics and metrics</p>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-green-100">
                        <Building className="h-6 w-6 text-green-600" />
                      </div>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Total Shelters</p>
                    <p className="text-3xl font-bold text-green-600">{overviewData?.shelters?.active || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">Registered organizations</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-purple-100">
                        <PawPrint className="h-6 w-6 text-purple-600" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Total Pets</p>
                    <p className="text-3xl font-bold text-purple-600">{overviewData?.pets?.total || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">Across all shelters</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-blue-100">
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge className="bg-blue-500">Avg</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Pets per Shelter</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {overviewData?.shelters?.active > 0
                        ? Math.round((overviewData?.pets?.total || 0) / (overviewData?.shelters?.active || 1))
                        : 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Average capacity</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Top Performing Shelters</CardTitle>
                    <CardDescription>By pet listings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(petData?.topShelters || []).slice(0, 10).map((shelter: any, index: number) => (
                        <div
                          key={shelter.shelterId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:border-teal-500 transition-colors"
                        >
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

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Success Rates</CardTitle>
                    <CardDescription>Application approval rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(applicationData?.byShelter || []).slice(0, 10).map((shelter: any) => (
                        <div key={shelter.shelterId}>
                          <div className="flex items-center justify-between mb-2">
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
              </div>

              {/* Shelter Performance Charts */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Shelter Pet Distribution</CardTitle>
                  <CardDescription>Number of pets per shelter</CardDescription>
                </CardHeader>
                <CardContent>
                  {petData?.topShelters && petData.topShelters.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={petData.topShelters.slice(0, 10)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 100 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="shelterName"
                          angle={-45}
                          textAnchor="end"
                          height={120}
                          interval={0}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="petCount" fill={COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-gray-400">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Combined Metrics */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Shelter Performance Comparison</CardTitle>
                  <CardDescription>Applications vs Success Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  {applicationData?.byShelter && applicationData.byShelter.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={applicationData.byShelter.slice(0, 10)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 100 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="shelterName"
                          angle={-45}
                          textAnchor="end"
                          height={120}
                          interval={0}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" fill={COLORS.secondary} name="Applications" />
                        <Bar yAxisId="right" dataKey="approved" fill={COLORS.success} name="Approved" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-gray-400">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
