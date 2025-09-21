"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, BarChart3, MessageCircle, Menu, X, GraduationCap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    name: "Chat",
    href: "/",
    icon: MessageCircle,
    description: "AI Chat Assistant",
  },
  {
    name: "All Students",
    href: "/students",
    icon: Users,
    description: "View all students",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Student analytics & insights",
  },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Campus Admin</h1>
                <p className="text-sm text-muted-foreground">Student Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                  <Card
                    className={`
                    p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50
                    ${isActive ? "bg-primary text-primary-foreground shadow-md" : "bg-transparent hover:bg-accent"}
                  `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                      />
                      <div>
                        <p className={`font-medium ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                          {item.name}
                        </p>
                        <p className={`text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">Campus Admin v1.0</p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
