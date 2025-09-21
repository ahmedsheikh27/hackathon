"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, TrendingUp, Calendar, GraduationCap, Mail, RefreshCw, Building2 } from "lucide-react"
import axios from "axios"

interface AnalyticsData {
  total_students: number
  recent_onboarded: Array<{
    id: string
    name: string
    email: string
  }>
}

interface DepartmentData {
  [department: string]: number
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [departmentData, setDepartmentData] = useState<DepartmentData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch analytics data
      const [analyticsResponse] = await Promise.all([
        axios.get("http://localhost:8000/analytics"),
      ])

      setAnalyticsData(analyticsResponse.data)
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

  const totalDepartments = Object.keys(departmentData).length
  const departmentEntries = Object.entries(departmentData).sort(([, a], [, b]) => b - a)

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
                  <p className="text-3xl font-bold text-foreground">{analyticsData?.total_students || 0}</p>
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
                  <p className="text-3xl font-bold text-foreground">{analyticsData?.recent_onboarded?.length || 0}</p>
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

          {/* Department Breakdown and Recent Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Students by Department</h2>
              </div>

              {departmentEntries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No department data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {departmentEntries.map(([department, count]) => {
                    const percentage = analyticsData?.total_students
                      ? Math.round((count / analyticsData.total_students) * 100)
                      : 0

                    return (
                      <div key={department} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{department}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{count} students</Badge>
                            <span className="text-xs text-muted-foreground">{percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-foreground">Recently Onboarded Students</h2>
                <Badge variant="outline" className="ml-auto">
                  Latest 5
                </Badge>
              </div>

              {!analyticsData?.recent_onboarded || analyticsData.recent_onboarded.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No recent onboarding data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData.recent_onboarded.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{student.name}</p>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          #{index + 1}
                        </Badge>
                        <span className="text-xs text-green-600 font-medium">New</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
