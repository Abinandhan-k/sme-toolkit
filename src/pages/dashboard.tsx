import { useTranslation } from 'react-i18next'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

const SAMPLE = {
  sales: [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 2000 },
    { month: 'Apr', revenue: 2780 },
    { month: 'May', revenue: 1890 },
    { month: 'Jun', revenue: 2390 },
  ],
  topCustomers: [
    { name: 'Acme Co', value: 4000 },
    { name: 'Beta Ltd', value: 3000 },
    { name: 'Gamma LLC', value: 2000 },
  ],
  itemsStock: [
    { name: 'Item A', stock: 120 },
    { name: 'Item B', stock: 90 },
    { name: 'Item C', stock: 45 },
  ],
}

const COLORS = ['#60A5FA', '#A78BFA', '#F472B6', '#34D399', '#F59E0B']

function AnimatedNumber({ value, prefix = '', className = '' }: { value: number; prefix?: string; className?: string }) {
  const motionVal = useMotionValue(value)
  const spring = useSpring(motionVal, { damping: 20, stiffness: 120 })
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    motionVal.set(value)
    const unsub = spring.on('change', (v) => setDisplay(Math.round(v)))
    return () => unsub()
  }, [value])

  return <div className={className}>{prefix}{display.toLocaleString()}</div>
}

export default function Dashboard() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  // KPI states
  const [revenue, setRevenue] = useState(0)
  const [pendingInvoices, setPendingInvoices] = useState(0)
  const [lowStock, setLowStock] = useState(0)
  const [activeTasks, setActiveTasks] = useState(0)
  const [newLeads, setNewLeads] = useState(0)
  const [employees, setEmployees] = useState(0)

  // Charts
  const [salesTrend, setSalesTrend] = useState(SAMPLE.sales)
  const [topCustomers, setTopCustomers] = useState(SAMPLE.topCustomers)
  const [itemsStock, setItemsStock] = useState(SAMPLE.itemsStock)

  // Recent activity
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    let invoiceSub: any = null
    let itemsSub: any = null
    let tasksSub: any = null

    async function fetchData() {
      try {
        // Invoices
        const { data: invoices } = await supabase.from('invoices').select('id,amount,status,created_at,customer_name').order('created_at', { ascending: false }).limit(50)

        // Items
        const { data: items } = await supabase.from('items').select('id,name,stock').order('stock', { ascending: false }).limit(100)

        // Tasks
        const { data: tasks } = await supabase.from('tasks').select('id,title,status,created_at').order('created_at', { ascending: false }).limit(50)

        // Leads
        const { data: leads } = await supabase.from('leads').select('id,source,created_at').order('created_at', { ascending: false }).limit(50)

        // Employees
        const { data: emps } = await supabase.from('employees').select('id').limit(1000)

        // Compute KPIs or fallback to sample
        if (invoices && invoices.length) {
          const totalRev = invoices.reduce((s: number, inv: any) => s + Number(inv.amount || 0), 0)
          setRevenue(totalRev)
          setPendingInvoices(invoices.filter((i: any) => i.status === 'pending').length)
        } else {
          setRevenue(12450)
          setPendingInvoices(8)
        }

        if (items && items.length) {
          setLowStock(items.filter((it: any) => Number(it.stock) < 20).length)
          setItemsStock(items.slice(0, 6).map((it: any) => ({ name: it.name, stock: Number(it.stock) })))
        } else {
          setLowStock(5)
          setItemsStock(SAMPLE.itemsStock)
        }

        if (tasks && tasks.length) {
          setActiveTasks(tasks.filter((t: any) => t.status !== 'done').length)
          setRecent((prev) => [...tasks.slice(0, 5).map((t: any) => ({ type: 'task', title: t.title, date: t.created_at })), ...prev])
        } else {
          setActiveTasks(12)
        }

        if (leads && leads.length) setNewLeads(leads.length)
        else setNewLeads(4)

        if (emps && emps.length) setEmployees(emps.length)
        else setEmployees(18)

        // Sales trend aggregation (group by month)
        if (invoices && invoices.length) {
          const months: Record<string, number> = {}
          invoices.forEach((inv: any) => {
            const d = new Date(inv.created_at)
            const key = d.toLocaleString('en-US', { month: 'short' })
            months[key] = (months[key] || 0) + Number(inv.amount || 0)
          })
          const arr = Object.entries(months).map(([month, revenue]) => ({ month, revenue }))
          setSalesTrend(arr.length ? arr : SAMPLE.sales)
        } else {
          setSalesTrend(SAMPLE.sales)
        }

        // Top customers (sample from invoices)
        if (invoices && invoices.length) {
          const byCustomer: Record<string, number> = {}
          invoices.forEach((inv: any) => {
            const name = inv.customer_name || 'Unknown'
            byCustomer[name] = (byCustomer[name] || 0) + Number(inv.amount || 0)
          })
          const arr = Object.entries(byCustomer).map(([name, value]) => ({ name, value }))
          arr.sort((a, b) => b.value - a.value)
          setTopCustomers(arr.slice(0, 6))
        } else setTopCustomers(SAMPLE.topCustomers)

        setLoading(false)
      } catch (err) {
        // fallback sample
        setSalesTrend(SAMPLE.sales)
        setTopCustomers(SAMPLE.topCustomers)
        setItemsStock(SAMPLE.itemsStock)
        setRevenue(12450)
        setPendingInvoices(8)
        setLowStock(5)
        setActiveTasks(12)
        setNewLeads(4)
        setEmployees(18)
        setLoading(false)
      }
    }

    fetchData()

    // Realtime subscriptions
    try {
      invoiceSub = supabase.channel('schema-public-invoices').on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, (payload) => {
        // simple refetch on change
        fetchData()
      }).subscribe()

      itemsSub = supabase.channel('schema-public-items').on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => fetchData()).subscribe()
      tasksSub = supabase.channel('schema-public-tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchData()).subscribe()
    } catch (e) {
      // ignore realtime errors in environments without DB
    }

    return () => {
      try { invoiceSub?.unsubscribe() } catch {}
      try { itemsSub?.unsubscribe() } catch {}
      try { tasksSub?.unsubscribe() } catch {}
    }
  }, [])

  // recent activity compose
  const activity = useMemo(() => recent.slice(0, 8), [recent])

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title') || 'Dashboard'}</h1>
          <p className="text-sm text-white/70">Overview of business metrics</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => window.location.assign('/invoices/new')}>New Invoice</Button>
          <Button variant="outline" onClick={() => window.location.assign('/customers/new')}>New Customer</Button>
        </div>
      </div>

      {/* KPI Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Revenue</CardTitle>
            <Badge>Last 30d</Badge>
          </CardHeader>
          <CardContent>
            <AnimatedNumber value={revenue} prefix={'₹'} className="text-3xl font-bold" />
            <p className="text-xs text-white/60 mt-2">Total sales in the selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Pending Invoices</CardTitle>
            <Badge variant="warning">Needs attention</Badge>
          </CardHeader>
          <CardContent>
            <AnimatedNumber value={pendingInvoices} className="text-3xl font-bold" />
            <p className="text-xs text-white/60 mt-2">Unpaid or awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Low Stock</CardTitle>
            <Badge variant="destructive">Alert</Badge>
          </CardHeader>
          <CardContent>
            <AnimatedNumber value={lowStock} className="text-3xl font-bold" />
            <p className="text-xs text-white/60 mt-2">Products below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Active Tasks</CardTitle>
            <Badge variant="secondary">Team</Badge>
          </CardHeader>
          <CardContent>
            <AnimatedNumber value={activeTasks} className="text-3xl font-bold" />
            <p className="text-xs text-white/60 mt-2">Open tasks assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>New Leads</CardTitle>
            <Badge variant="success">This period</Badge>
          </CardHeader>
          <CardContent>
            <AnimatedNumber value={newLeads} className="text-3xl font-bold" />
            <p className="text-xs text-white/60 mt-2">Potential customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Employees</CardTitle>
            <Badge variant="outline">Active</Badge>
          </CardHeader>
          <CardContent>
            <AnimatedNumber value={employees} className="text-3xl font-bold" />
            <p className="text-xs text-white/60 mt-2">Staff count</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items Stock</CardTitle>
              <CardDescription>Top stocked items</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={itemsStock} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.6)" />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', borderRadius: 8 }} />
                  <Bar dataKey="stock" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>By revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={topCustomers} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={4}>
                    {topCustomers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest invoices & tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {activity.length === 0 && <li className="text-white/60">No recent activity</li>}
                {activity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                    <div>
                      <div className="text-sm text-white">{a.title || a.type}</div>
                      <div className="text-xs text-white/60">{new Date(a.date || Date.now()).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
