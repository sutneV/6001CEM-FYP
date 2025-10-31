"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Bell,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Heart,
  Home,
  LogOut,
  MessageSquare,
  PawPrint,
  Settings,
  User,
  Users,
  FileText,
  ClipboardList,
  Menu,
  MapPin,
  Bot,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AuthGuard from "@/components/auth/AuthGuard"
import { useAuth } from "@/contexts/AuthContext"
import { useUnreadMessages } from "@/hooks/useUnreadMessages"
import { NotificationCenter } from "@/components/ui/notification-center"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { unreadCount, loading: loadingUnread } = useUnreadMessages()

  // Don't render this layout for admin or shelter routes - they have their own layouts
  if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/dashboard/shelter')) {
    return <>{children}</>
  }

  const navigationItems = [
    { name: "Dashboard", icon: Home, href: "/dashboard" },
    { name: "Browse Pets", icon: PawPrint, href: "/dashboard/pets" },
    { name: "My Applications", icon: ClipboardList, href: "/dashboard/applications" },
    { name: "Favorites", icon: Heart, href: "/dashboard/favorites" },
    { 
      name: "Messages", 
      icon: MessageSquare, 
      href: "/dashboard/messages", 
      badge: !loadingUnread && unreadCount > 0 ? unreadCount.toString() : undefined 
    },
    { name: "Communities", icon: Users, href: "/dashboard/communities" },
    { name: "Event Map", icon: MapPin, href: "/dashboard/event-map" },
    { name: "Calendar", icon: Calendar, href: "/dashboard/calendar" },
    { name: "Resources", icon: FileText, href: "/dashboard/resources" },
    { name: "AI Assistant", icon: Bot, href: "/dashboard/ai-assistant" },
  ]

  const secondaryNavItems = [
    { name: "Profile", icon: User, href: "/dashboard/profile" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ]

  return (
    <AuthGuard allowedRoles={['adopter']}>
      <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* User Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "w-16" : "w-64"}`}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-teal-500" />
            {!sidebarCollapsed && <span className="text-xl font-bold">Penang Pet Pals</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto hidden h-8 w-8 lg:flex"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <motion.div key={item.name} whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                  <div className="relative">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                        isActive ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      } ${sidebarCollapsed ? "justify-center" : ""}`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-teal-700" : "text-gray-400"}`} />
                      {!sidebarCollapsed && (
                        <>
                          <span>{item.name}</span>
                          {item.badge && <Badge className="ml-auto bg-teal-500">{item.badge}</Badge>}
                        </>
                      )}
                    </Link>
                    {sidebarCollapsed && item.badge && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-medium text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </nav>
          
          <div className="mt-6">
            {!sidebarCollapsed && (
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Account</div>
            )}
            <nav className={`grid gap-1 px-2 ${sidebarCollapsed ? "mt-2" : "mt-2"}`}>
              {secondaryNavItems.map((item) => (
                <motion.div key={item.name} whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 ${
                      sidebarCollapsed ? "justify-center" : ""
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-4 w-4 text-gray-400" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </motion.div>
              ))}
              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <button 
                  onClick={logout}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 ${
                    sidebarCollapsed ? "justify-center" : ""
                  }`}
                  title={sidebarCollapsed ? "Log Out" : undefined}
                >
                  <LogOut className="h-4 w-4 text-gray-400" />
                  {!sidebarCollapsed && <span>Log Out</span>}
                </button>
              </motion.div>
            </nav>
          </div>
        </div>
        
        <div className="border-t p-4">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:px-6"
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {pathname === "/dashboard" ? "Dashboard" : 
               pathname === "/dashboard/pets" ? "Browse Pets" :
               pathname === "/dashboard/applications" ? "My Applications" :
               pathname === "/dashboard/favorites" ? "Favorites" :
               pathname === "/dashboard/messages" ? "Messages" :
               pathname === "/dashboard/communities" ? "Communities" :
               pathname === "/dashboard/event-map" ? "Event Map" :
               pathname === "/dashboard/calendar" ? "Calendar" :
               pathname === "/dashboard/resources" ? "Resources" :
               pathname === "/dashboard/ai-assistant" ? "AI Assistant" :
               pathname === "/dashboard/profile" ? "Profile" :
               pathname === "/dashboard/settings" ? "Settings" :
               "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link href="/dashboard/messages">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">Messages</span>
                    {!loadingUnread && unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-medium text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
    </AuthGuard>
  )
}