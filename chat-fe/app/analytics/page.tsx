"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, TrendingUp, Calendar, GraduationCap, RefreshCw, Building2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import axios from "axios"

interface Student {
  id: string
  name: string
  email: string
  department: string
  created_at: string
}

interface DepartmentData {
  department: string
  count: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AnalyticsPage() {
  const [totalStudents, setTotalStudents] = useState(0)
  const [recentStudents, setRecentStudents] = useState<Student[]>([])
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [totalResponse, recentResponse, departmentResponse] = await Promise.all([
        axios.get("http://localhost:8000/analytics/total"),
        axios.get("http://localhost:8000/analytics/recent"),
        axios.get("http://localhost:8000/analytics/by-department"),
      ])

      setTotalStudents(totalResponse.data.total_students)
      setRecentStudents(recentResponse.data.recent_students)
      setDepartmentData(departmentResponse.data.by_department)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError("Failed to fetch analytics data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="h-full bg-background flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Loading analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-background flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Error loading analytics</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-6 max-w-md text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchAnalytics}>Try Again</Button>
          </Card>
        </div>
      </div>
    )
  }

  const totalDepartments = departmentData.length

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Student insights and statistics</p>
            </div>
          </div>
          <Button onClick={fetchAnalytics} variant="outline" size="sm" className="gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </header>

      {/* Analytics Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">Active enrollment</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Departments</p>
                  <p className="text-3xl font-bold text-foreground">{totalDepartments}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <span className="text-sm text-muted-foreground">Academic divisions</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Onboarded</p>
                  <p className="text-3xl font-bold text-foreground">{recentStudents.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                <span className="text-sm text-muted-foreground">Last 5 additions</span>
              </div>
            </Card>
          </div>

          {/* Charts and Recent Students */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Students by Department</h2>
              </div>

              {departmentData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No department data available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar Chart */}
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={departmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} fontSize={12} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0088FE" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Chart */}
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ department, count }) => `${department}: ${count}`}
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-foreground">Recently Added Students</h2>
                <Badge variant="outline" className="ml-auto">
                  Latest {recentStudents.length}
                </Badge>
              </div>

              {recentStudents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No recent students available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">#</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Department</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentStudents.map((student, index) => (
                        <tr key={student.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3">
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              #{index + 1}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant="secondary" className="text-xs">
                              {student.department}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-muted-foreground">{formatDate(student.created_at)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
