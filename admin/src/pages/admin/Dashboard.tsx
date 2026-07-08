import React, { useState, useMemo } from "react"
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  TrendingUp,
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// --- Mock Telemetry Data ---
const CHART_DATA = {
  daily: {
    line: [
      { name: "00:00", value: 1200 },
      { name: "04:00", value: 800 },
      { name: "08:00", value: 2100 },
      { name: "12:00", value: 3400 },
      { name: "16:00", value: 2900 },
      { name: "20:00", value: 4100 },
      { name: "24:00", value: 3200 },
    ],
    bar: [
      { name: "00:00", sales: 12 },
      { name: "04:00", sales: 8 },
      { name: "08:00", sales: 24 },
      { name: "12:00", sales: 38 },
      { name: "16:00", sales: 31 },
      { name: "20:00", sales: 45 },
      { name: "24:00", sales: 29 },
    ],
  },
  weekly: {
    line: [
      { name: "Mon", value: 12000 },
      { name: "Tue", value: 15000 },
      { name: "Wed", value: 18000 },
      { name: "Thu", value: 14000 },
      { name: "Fri", value: 22000 },
      { name: "Sat", value: 26000 },
      { name: "Sun", value: 21000 },
    ],
    bar: [
      { name: "Mon", sales: 120 },
      { name: "Tue", sales: 145 },
      { name: "Wed", sales: 180 },
      { name: "Thu", sales: 130 },
      { name: "Fri", sales: 210 },
      { name: "Sat", sales: 250 },
      { name: "Sun", sales: 195 },
    ],
  },
  monthly: {
    line: [
      { name: "Jan", value: 45000 },
      { name: "Feb", value: 52000 },
      { name: "Mar", value: 49000 },
      { name: "Apr", value: 63000 },
      { name: "May", value: 58000 },
      { name: "Jun", value: 71000 },
      { name: "Jul", value: 85000 },
    ],
    bar: [
      { name: "Jan", sales: 450 },
      { name: "Feb", sales: 510 },
      { name: "Mar", sales: 480 },
      { name: "Apr", sales: 620 },
      { name: "May", sales: 570 },
      { name: "Jun", sales: 690 },
      { name: "Jul", sales: 810 },
    ],
  },
}

const DEVICE_DATA = [
  { name: "Desktop", value: 65, color: "var(--primary)" },
  { name: "Mobile", value: 25, color: "#10B981" },
  { name: "Tablet", value: 10, color: "#F59E0B" },
]

interface ActivityItem {
  id: string
  user: string
  email: string
  amount: number
  status: "Success" | "Pending" | "Failed"
  date: string
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: "TX1001", user: "Setu Lal", email: "setu@example.com", amount: 250.0, status: "Success", date: "2026-07-07" },
  { id: "TX1002", user: "John Doe", email: "john@example.com", amount: 120.5, status: "Pending", date: "2026-07-08" },
  { id: "TX1003", user: "Alice Smith", email: "alice@example.com", amount: 850.0, status: "Success", date: "2026-07-06" },
  { id: "TX1004", user: "Bob Johnson", email: "bob@example.com", amount: 45.0, status: "Failed", date: "2026-07-05" },
  { id: "TX1005", user: "Emily Davis", email: "emily@example.com", amount: 150.0, status: "Success", date: "2026-07-07" },
  { id: "TX1006", user: "Michael Wilson", email: "mike@example.com", amount: 320.0, status: "Success", date: "2026-07-04" },
  { id: "TX1007", user: "Sarah Miller", email: "sarah@example.com", amount: 95.0, status: "Pending", date: "2026-07-08" },
  { id: "TX1008", user: "David Taylor", email: "david@example.com", amount: 430.0, status: "Failed", date: "2026-07-03" },
]

const Dashboard: React.FC = () => {
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("weekly")
  
  // Table state
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortField, setSortField] = useState<"amount" | "date" | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const itemsPerPage = 4

  // Stats Card data mapping
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      trend: "+20.1% from last month",
      isPositive: true,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Subscriptions",
      value: "+2,350",
      trend: "+180.1% from last month",
      isPositive: true,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Sales Completed",
      value: "+12,234",
      trend: "+19.0% from last week",
      isPositive: true,
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Active Users",
      value: "+573",
      trend: "-4.2% from last hour",
      isPositive: false,
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
    },
  ]

  // Sorting Handler
  const handleSort = (field: "amount" | "date") => {
    const order = sortField === field && sortOrder === "desc" ? "asc" : "desc"
    setSortField(field)
    setSortOrder(order)
    
    const sorted = [...activities].sort((a, b) => {
      let comparison = 0
      if (field === "amount") {
        comparison = a.amount - b.amount
      } else if (field === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return order === "desc" ? -comparison : comparison
    })
    setActivities(sorted)
  }

  // Row selection handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paginatedItems.map((item) => item.id)
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentPageIds])))
    } else {
      const currentPageIds = paginatedItems.map((item) => item.id)
      setSelectedIds(selectedIds.filter((id) => !currentPageIds.includes(id)))
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  // Pagination calculation
  const totalPages = Math.ceil(activities.length / itemsPerPage)
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return activities.slice(start, start + itemsPerPage)
  }, [activities, page])

  const isAllSelectedOnPage = useMemo(() => {
    if (paginatedItems.length === 0) return false
    return paginatedItems.every((item) => selectedIds.includes(item.id))
  }, [paginatedItems, selectedIds])

  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operational review, charts telemetry, and activity checklists.
          </p>
        </div>

        {/* Compact Tabs configuration */}
        <div className="flex items-center gap-2">
          <Tabs value={range} onValueChange={(val: any) => { setRange(val); setPage(1); }} className="w-auto">
            <TabsList className="bg-muted p-1 rounded-lg h-9">
              <TabsTrigger value="daily" className="text-xs h-7 px-3 py-1 font-medium cursor-pointer">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs h-7 px-3 py-1 font-medium cursor-pointer">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs h-7 px-3 py-1 font-medium cursor-pointer">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-border/70 hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </span>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1 text-xs">
                {stat.isPositive ? (
                  <span className="flex items-center text-emerald-600 font-medium">
                    <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
                    {stat.trend.split(" ")[0]}
                  </span>
                ) : (
                  <span className="flex items-center text-rose-600 font-medium">
                    <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />
                    {stat.trend.split(" ")[0]}
                  </span>
                )}
                <span className="text-muted-foreground">
                  {stat.trend.substring(stat.trend.indexOf(" "))}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Line Chart */}
        <Card className="md:col-span-2 border border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Revenue Projections
                </CardTitle>
                <CardDescription className="text-xs">
                  Financial trends compiled for {range} cycles.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART_DATA[range].line} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #E5E7EB" }} />
                  <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Device Segments</CardTitle>
            <CardDescription className="text-xs">Traffic origins breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col justify-center items-center h-full max-h-[300px]">
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DEVICE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {DEVICE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-foreground">100%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Share</span>
              </div>
            </div>
            
            {/* Custom Legend */}
            <div className="flex justify-center gap-4 mt-2 w-full text-xs">
              {DEVICE_DATA.map((d, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground font-medium">{d.name}</span>
                  <span className="font-bold text-foreground">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart section */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Bar Chart */}
        <Card className="md:col-span-3 border border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Acquisitions & Sales</CardTitle>
            <CardDescription className="text-xs">Product completions count.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA[range].bar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                  <Bar dataKey="sales" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table section */}
      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="pb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-bold">Recent Transactions</CardTitle>
            <CardDescription className="text-xs">
              List of transactions. Selected {selectedIds.length} of {activities.length} entries.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelectedOnPage}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-1.5">
                    Date
                    <ChevronDown className={`h-3 w-3 transition-transform ${sortField === "date" && sortOrder === "asc" ? "rotate-180" : ""}`} />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => handleSort("amount")}>
                  <div className="flex items-center gap-1.5">
                    Amount
                    <ChevronDown className={`h-3 w-3 transition-transform ${sortField === "amount" && sortOrder === "asc" ? "rotate-180" : ""}`} />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={item.id} data-state={selectedIds.includes(item.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                      aria-label={`Select row ${item.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">{item.user}</TableCell>
                  <TableCell className="text-muted-foreground">{item.email}</TableCell>
                  <TableCell className="text-muted-foreground">{item.date}</TableCell>
                  <TableCell className="font-semibold text-foreground">${item.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "Success"
                          ? "default"
                          : item.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        item.status === "Success"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                          : item.status === "Pending"
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200"
                          : "bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold cursor-pointer"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold cursor-pointer"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
