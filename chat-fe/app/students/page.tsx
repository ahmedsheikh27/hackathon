"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Mail, Phone, MapPin, Calendar, GraduationCap, Filter } from "lucide-react"
import axios from "axios"

interface Student {
  id: string
  name: string
  email: string
  phone?: string
  department?: string
  year?: number
  address?: string
  created_at?: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [error, setError] = useState<string | null>(null)

  const departments = ["all", "Computer Science", "Engineering", "Business", "Arts", "Science"]

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, selectedDepartment])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("http://localhost:8000/analytics")
      setStudents(response.data)
      setError(null)
    } catch (error) {
      console.error("Error fetching students:", error)
      setError("Failed to fetch students. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.department && student.department.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((student) => student.department === selectedDepartment)
    }

    setFilteredStudents(filtered)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="h-full bg-background flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">All Students</h1>
              <p className="text-muted-foreground">Loading student data...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Loading students...</span>
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
              <Users className="w-5 h-5 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">All Students</h1>
              <p className="text-muted-foreground">Error loading students</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-6 max-w-md text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchStudents}>Try Again</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">All Students</h1>
              <p className="text-muted-foreground">
                {filteredStudents.length} of {students.length} students
              </p>
            </div>
          </div>
          <Button onClick={fetchStudents} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-border bg-card/30 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "all" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <main className="flex-1 overflow-y-auto p-6">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground mb-2">No students found</h2>
              <p className="text-muted-foreground max-w-md">
                {searchTerm || selectedDepartment !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No students have been added yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{student.name}</h3>
                      {student.department && (
                        <Badge variant="secondary" className="text-xs">
                          {student.department}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{student.email}</span>
                  </div>

                  {student.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{student.phone}</span>
                    </div>
                  )}

                  {student.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{student.address}</span>
                    </div>
                  )}

                  {student.created_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Joined {formatDate(student.created_at)}</span>
                    </div>
                  )}

                  {student.year && (
                    <div className="pt-2">
                      <Badge variant="outline">Year {student.year}</Badge>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
