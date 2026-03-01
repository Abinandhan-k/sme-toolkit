import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import Card from "../components/Card"
import Chart from "../components/Chart"

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    items: 0,
    invoices: 0,
    revenue: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)

    const [{ count: customerCount }, { count: itemCount }, { count: invoiceCount }, revenueRes] =
      await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("items").select("*", { count: "exact", head: true }),
        supabase.from("invoices").select("*", { count: "exact", head: true }),
        supabase.from("invoices").select("total"),
      ])

    const revenue = revenueRes?.data?.reduce((sum, i) => sum + (i.total || 0), 0) || 0

    setStats({
      customers: customerCount || 0,
      items: itemCount || 0,
      invoices: invoiceCount || 0,
      revenue,
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 text-lg">
        Loading Dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Total Customers" value={stats.customers} />
        <Card title="Items Listed" value={stats.items} />
        <Card title="Invoices Generated" value={stats.invoices} />
        <Card title="Revenue" value={`₹ ${stats.revenue}`} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Invoice Chart</h2>
        <Chart />
      </div>
    </div>
  )
}