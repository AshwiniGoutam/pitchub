"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, Building2, Calendar, ExternalLink } from "lucide-react"

export function PortfolioView() {
  const portfolioCompanies = [
    {
      id: 1,
      company: "DataFlow Systems",
      sector: "Enterprise SaaS",
      investmentDate: "Jan 2023",
      investmentAmount: "$500K",
      currentValuation: "$15M",
      ownership: "3.3%",
      stage: "Series A",
      status: "Growing",
      growth: "+45%",
      lastUpdate: "2 weeks ago",
      metrics: {
        revenue: "$2.1M ARR",
        customers: "150+ Enterprise",
        team: "45 employees",
      },
    },
    {
      id: 2,
      company: "MedTech Innovations",
      sector: "HealthTech",
      investmentDate: "Mar 2023",
      investmentAmount: "$750K",
      currentValuation: "$12M",
      ownership: "6.25%",
      stage: "Series A",
      status: "Stable",
      growth: "+12%",
      lastUpdate: "1 week ago",
      metrics: {
        revenue: "$1.8M ARR",
        customers: "25 Hospitals",
        team: "32 employees",
      },
    },
    {
      id: 3,
      company: "GreenTech Solutions",
      sector: "CleanTech",
      investmentDate: "Jun 2023",
      investmentAmount: "$300K",
      currentValuation: "$8M",
      ownership: "3.75%",
      stage: "Seed",
      status: "Scaling",
      growth: "+78%",
      lastUpdate: "3 days ago",
      metrics: {
        revenue: "$800K ARR",
        customers: "50+ SMBs",
        team: "18 employees",
      },
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Growing":
        return "bg-green-100 text-green-800"
      case "Scaling":
        return "bg-blue-100 text-blue-800"
      case "Stable":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGrowthIcon = (growth: string) => {
    return growth.startsWith("+") ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Portfolio Management</h1>
          <p className="text-muted-foreground">Track your investments and portfolio performance</p>
        </div>
        <Button>Generate LP Report</Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold">$1.55M</p>
            </div>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
              <p className="text-2xl font-bold">$35M</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Companies</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Growth</p>
              <p className="text-2xl font-bold">+45%</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio Companies */}
      <div className="space-y-4">
        <h2 className="font-heading font-semibold text-xl">Portfolio Companies</h2>
        {portfolioCompanies.map((company) => (
          <Card key={company.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-heading font-semibold text-lg">{company.company}</h3>
                  <Badge variant="outline">{company.sector}</Badge>
                  <Badge variant="outline">{company.stage}</Badge>
                  <Badge className={getStatusColor(company.status)}>{company.status}</Badge>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Investment Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Investment:</span>
                        <span className="font-medium">{company.investmentAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{company.investmentDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ownership:</span>
                        <span className="font-medium">{company.ownership}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Current Performance</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Valuation:</span>
                        <span className="font-medium">{company.currentValuation}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Growth:</span>
                        <div className="flex items-center gap-1">
                          {getGrowthIcon(company.growth)}
                          <span className="font-medium">{company.growth}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Update:</span>
                        <span>{company.lastUpdate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Key Metrics</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-medium">{company.metrics.revenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customers:</span>
                        <span>{company.metrics.customers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Team Size:</span>
                        <span>{company.metrics.team}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule Update
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
