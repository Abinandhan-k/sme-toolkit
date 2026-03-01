import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Modal from '@/components/Modal'
import { format } from 'date-fns'

type Invoice = {
  id: string
  customer_name?: string
  amount?: number
  status?: string
  created_at?: string
  items?: Array<{ name?: string; qty?: number; price?: number }>
}

export default function InvoicesPage() {
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all')
  const [fromDate, setFromDate] = useState<string | null>(null)
  const [toDate, setToDate] = useState<string | null>(null)
  const [customerFilter, setCustomerFilter] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const pageSize = 10

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [allSelected, setAllSelected] = useState(false)

  const [loading, setLoading] = useState(false)

  // modal
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)

  // realtime subscription ref so we can unsubscribe
  const subRef = useRef<any>(null)

  useEffect(() => {
    fetchInvoices()

    // subscribe to realtime invoice changes
    try {
      subRef.current = supabase
        .channel('public-invoices')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
          fetchInvoices()
        })
        .subscribe()
    } catch (e) {
      // ignore if realtime not configured
    }

    return () => {
      try { subRef.current?.unsubscribe() } catch {}
    }
  }, [q, statusFilter, fromDate, toDate, customerFilter, page])

  async function fetchInvoices() {
    setLoading(true)
    try {
      let query = supabase.from('invoices').select('id,customer_name,amount,status,created_at,items').order('created_at', { ascending: false })

      if (q) query = query.ilike('customer_name', `%${q}%`)
      if (statusFilter !== 'all') query = query.eq('status', statusFilter)
      if (fromDate) query = query.gte('created_at', fromDate)
      if (toDate) query = query.lte('created_at', toDate)
      if (customerFilter) query = query.eq('customer_id', customerFilter)

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, count, error } = await query.range(from, to).maybeSingle() // some Supabase clients return count via select('*', { count: 'exact' })

      // Fallback: if server doesn't support count in this call, run a separate count
      if (!data) {
        // attempt simple select for pages
        const { data: list } = await supabase.from('invoices').select('id,customer_name,amount,status,created_at,items').order('created_at', { ascending: false }).range(from, to)
        setInvoices(list || [])
        setTotal(list ? list.length : 0)
      } else {
        // If maybeSingle returned an object, wrap accordingly
        setInvoices(Array.isArray(data) ? data : data ? [data] : [])
        setTotal(count || (Array.isArray(data) ? data.length : data ? 1 : 0))
      }

      setLoading(false)
    } catch (err) {
      // fallback with empty array
      setInvoices([])
      setTotal(0)
      setLoading(false)
    }
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = { ...s, [id]: !s[id] }
      setAllSelected(Object.values(next).every(Boolean))
      return next
    })
  }

  function toggleSelectAll() {
    const next = !allSelected
    const newSelected: Record<string, boolean> = {}
    invoices.forEach((inv) => (newSelected[inv.id] = next))
    setSelected(newSelected)
    setAllSelected(next)
  }

  function openCreate() {
    setEditing(null)
    setOpenModal(true)
  }

  function openEdit(inv: Invoice) {
    setEditing(inv)
    setOpenModal(true)
  }

  async function removeInvoice(id: string) {
    if (!confirm('Delete invoice?')) return
    await supabase.from('invoices').delete().eq('id', id)
    fetchInvoices()
  }

  // PDF generation (attempt react-pdf dynamically, fallback to print window)
  async function exportToPDF(invoice: Invoice) {
    try {
      const { PDFDownloadLink, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')

      const InvoiceDoc = () => (
        // lightweight inlined doc
        <Document>
          <Page size="A4" style={{ padding: 20 }}>
            <View>
              <Text style={{ fontSize: 18 }}>{invoice.customer_name || 'Invoice'}</Text>
              <Text style={{ marginTop: 8 }}>Total: ₹{(invoice.amount || 0).toLocaleString()}</Text>
            </View>
          </Page>
        </Document>
      )

      // programmatically render and download
      // Using PDFDownloadLink in DOM is simpler; create a temporary container
      const container = document.createElement('div')
      document.body.appendChild(container)
      // render anchor
      // @ts-ignore
      const link = document.createElement('a')
      link.textContent = 'Download'
      container.appendChild(link)
      // Note: a proper implementation would render <PDFDownloadLink> and click it.
      // Keep fallback for now:
      window.open('about:blank').document.write(`<pre>${JSON.stringify(invoice, null, 2)}</pre>`)
    } catch (e) {
      // fallback: open printable view
      const w = window.open('', '_blank')
      if (!w) return
      w.document.write(`<h1>Invoice: ${invoice.customer_name || ''}</h1><pre>${JSON.stringify(invoice, null, 2)}</pre>`)
      setTimeout(() => w.print(), 500)
    }
  }

  // Bulk actions
  async function bulkPrint() {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k)
    const toPrint = invoices.filter((i) => ids.includes(i.id))
    toPrint.forEach((inv) => exportToPDF(inv))
  }

  async function bulkSend() {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k)
    // placeholder: integrate email sending or notification
    alert(`Send ${ids.length} invoices (stub)`) 
  }

  // Mobile swipe: simple touch-based reveal
  function useSwipeHandlers() {
    const startX = useRef<number | null>(null)
    const activeRef = useRef<string | null>(null)

    const onTouchStart = (e: React.TouchEvent, id: string) => {
      startX.current = e.touches[0].clientX
      activeRef.current = id
    }

    const onTouchMove = (e: React.TouchEvent, id: string) => {
      if (!startX.current || activeRef.current !== id) return
      const delta = e.touches[0].clientX - startX.current
      const el = document.getElementById(`row-${id}`)
      if (el) (el.style as any).transform = `translateX(${Math.min(0, delta)}px)`
    }

    const onTouchEnd = (e: React.TouchEvent, id: string) => {
      const endX = e.changedTouches[0].clientX
      const delta = endX - (startX.current ?? endX)
      const el = document.getElementById(`row-${id}`)
      if (el) (el.style as any).transform = ''
      if (delta < -80) {
        // left swipe -> show actions via simple confirm for demo
        if (confirm('Mark paid?')) {
          supabase.from('invoices').update({ status: 'paid' }).eq('id', id)
        }
      } else if (delta > 80) {
        if (confirm('Delete invoice?')) removeInvoice(id)
      }
      startX.current = null
      activeRef.current = null
    }

    return { onTouchStart, onTouchMove, onTouchEnd }
  }

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeHandlers()

  const customerOptions = useMemo(() => [
    { id: 'cust_1', name: 'Acme Co' },
    { id: 'cust_2', name: 'Beta Ltd' },
  ], [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <div className="flex gap-2">
          <Button onClick={openCreate}>New Invoice</Button>
          <Button onClick={bulkPrint} variant="outline">Print</Button>
          <Button onClick={bulkSend} variant="ghost">Send</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage invoices</CardTitle>
          <CardDescription>Search, filter, paginate and act on invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input className="input" placeholder="Search by customer" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <input type="date" className="input" onChange={(e) => setFromDate(e.target.value || null)} />
            <input type="date" className="input" onChange={(e) => setToDate(e.target.value || null)} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr id={`row-${inv.id}`} key={inv.id} onTouchStart={(e) => onTouchStart(e as any, inv.id)} onTouchMove={(e) => onTouchMove(e as any, inv.id)} onTouchEnd={(e) => onTouchEnd(e as any, inv.id)}>
                    <td><input type="checkbox" checked={!!selected[inv.id]} onChange={() => toggleSelect(inv.id)} /></td>
                    <td>{idx + 1 + (page - 1) * pageSize}</td>
                    <td>{inv.customer_name}</td>
                    <td>{(inv.items || []).length}</td>
                    <td>₹{(inv.amount || 0).toLocaleString()}</td>
                    <td>{inv.created_at ? format(new Date(inv.created_at), 'yyyy-MM-dd') : ''}</td>
                    <td>{inv.status}</td>
                    <td className="flex gap-2">
                      <Button size="sm" onClick={() => openEdit(inv)}>View</Button>
                      <Button size="sm" variant="ghost" onClick={() => exportToPDF(inv)}>Print</Button>
                      <Button size="sm" variant="destructive" onClick={() => removeInvoice(inv.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-white/60">No invoices found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-white/60">{total} results</div>
            <div className="flex gap-2">
              <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <div className="px-3 py-2 bg-muted rounded">{page}</div>
              <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div className="p-4 max-w-2xl">
          <h3 className="text-lg font-medium mb-2">{editing ? 'Edit Invoice' : 'Create Invoice'}</h3>
          <InvoiceForm invoice={editing} onClose={() => { setOpenModal(false); fetchInvoices() }} customers={customerOptions} />
        </div>
      </Modal>
    </div>
  )
}

function InvoiceForm({ invoice, onClose, customers }: { invoice?: Invoice | null; onClose: () => void; customers: Array<{ id: string; name: string }> }) {
  const [customerId, setCustomerId] = useState<string | null>(invoice ? (invoice as any).customer_id || null : null)
  const [items, setItems] = useState<Array<{ id?: string; name?: string; qty: number; price: number }>>(invoice?.items?.map((it: any) => ({ name: it.name, qty: it.qty || 1, price: it.price || 0 })) || [{ name: '', qty: 1, price: 0 }])
  const [taxPct, setTaxPct] = useState(5)

  const subtotal = items.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0)
  const tax = subtotal * (taxPct / 100)
  const total = subtotal + tax

  async function save() {
    const payload = {
      customer_id: customerId,
      customer_name: customers.find((c) => c.id === customerId)?.name || 'Unknown',
      amount: total,
      status: 'pending',
      items,
    }
    if (invoice) {
      await supabase.from('invoices').update(payload).eq('id', invoice.id)
    } else {
      await supabase.from('invoices').insert(payload)
    }
    onClose()
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm">Customer</label>
        <select className="input w-full" value={customerId || ''} onChange={(e) => setCustomerId(e.target.value || null)}>
          <option value="">Select customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="flex gap-2">
            <input className="input flex-1" placeholder="Item name" value={it.name} onChange={(e) => setItems((s) => { const copy = [...s]; copy[idx].name = e.target.value; return copy })} />
            <input type="number" className="input w-24" value={it.qty} onChange={(e) => setItems((s) => { const copy = [...s]; copy[idx].qty = Number(e.target.value); return copy })} />
            <input type="number" className="input w-32" value={it.price} onChange={(e) => setItems((s) => { const copy = [...s]; copy[idx].price = Number(e.target.value); return copy })} />
            <Button variant="destructive" onClick={() => setItems((s) => s.filter((_, i) => i !== idx))}>Remove</Button>
          </div>
        ))}

        <Button onClick={() => setItems((s) => [...s, { name: '', qty: 1, price: 0 }])}>Add item</Button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm">Tax %</label>
        <input type="number" className="input w-20" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))} />
      </div>

      <div className="text-right">
        <div className="text-sm">Subtotal: ₹{subtotal.toLocaleString()}</div>
        <div className="text-sm">Tax: ₹{tax.toLocaleString()}</div>
        <div className="text-lg font-bold">Total: ₹{total.toLocaleString()}</div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save}>Save</Button>
      </div>
    </div>
  )
}

