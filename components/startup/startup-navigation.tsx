import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, User, LogOut, BarChart3 } from "lucide-react"
import Link from "next/link"

export function StartupNavigation() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="font-heading font-bold text-xl text-foreground">PITCHUB</span>
            </Link>
            <Badge variant="secondary" className="ml-4">
              Dashboard Flow
            </Badge>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/startup"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/matching"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Matching
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Analytics
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/analytics">
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Link href='/' className="flex">  <LogOut className="h-4 w-4 mr-2" />
                Sign Out</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
