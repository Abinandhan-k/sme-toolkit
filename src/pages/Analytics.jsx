import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function Analytics() {
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [lowStockItems, setLowStockItems] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Customers
    const { data: customers } = await supabase
      .from("customers")
      .select("*")

    setTotalCustomers(customers?.length || 0)

    // Items
    const { data: items } = await supabase
      .from("items")
      .select("*")

    setTotalItems(items?.length || 0)

    const lowStock = items?.filter(item => item.stock < 5) || []
    setLowStockItems(lowStock)

    // Revenue
    const { data: invoices } = await supabase
      .from("invoices")
      .select("total")

    const revenue = invoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0
    setTotalRevenue(revenue)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Business Analytics</h1>

      <div className="grid grid-cols-2 gap-6 mb-6">

        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold">Total Customers</h2>
          <p className="text-3xl mt-2">{totalCustomers}</p>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold">Total Items</h2>
          <p className="text-3xl mt-2">{totalItems}</p>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold">Total Revenue</h2>
          <p className="text-3xl mt-2">₹ {totalRevenue}</p>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
          {lowStockItems.length === 0 ? (
            <p className="mt-2">No low stock items 🎉</p>
          ) : (
            lowStockItems.map(item => (
              <p key={item.id} className="mt-1 text-red-600">
                {item.name} (Stock: {item.stock})
              </p>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default Analytics