import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Modal from '@/components/Modal'
import ReminderForm from '@/components/ReminderForm'

export default function Customers() {
  const [tab, setTab] = useState('list') // list | activity | notes | crm

  const [customers, setCustomers] = useState([])
  const [leads, setLeads] = useState([])
  const [reminders, setReminders] = useState([])
  const [notes, setNotes] = useState({})

  const [loading, setLoading] = useState(false)

  const subRef = useRef(null)
  const leadsSubRef = useRef(null)

  useEffect(() => {
    fetchAll()

    try {
      subRef.current = supabase
        .channel('public-customers')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchCustomers())
        .subscribe()

      leadsSubRef.current = supabase
        .channel('public-leads')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchLeads())
        .subscribe()

      supabase
        .channel('public-reminders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, () => fetchReminders())
        .subscribe()
    } catch (e) {
      // ignore if realtime not configured
    }

    return () => {
      try { subRef.current?.unsubscribe() } catch {}
      try { leadsSubRef.current?.unsubscribe() } catch {}
    }
  }, [])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchCustomers(), fetchLeads(), fetchReminders()])
    setLoading(false)
  }

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('id,name,phone,email,created_at,company')
    setCustomers(data || [])
  }

  async function fetchLeads() {
    const { data } = await supabase.from('leads').select('id,name,company,email,phone,status,owner,due_date').order('due_date', { ascending: true })
    setLeads(data || [])
  }

  async function fetchReminders() {
    const { data } = await supabase.from('reminders').select('id,customer_id,title,due_date,notes').order('due_date', { ascending: true })
    setReminders(data || [])
  }

  const columns = useMemo(() => [
    { key: 'new', title: 'New' },
    { key: 'contacted', title: 'Contacted' },
    { key: 'qualified', title: 'Qualified' },
    { key: 'won', title: 'Won' },
    { key: 'lost', title: 'Lost' },
  ], [])

  function onDragStart(e, leadId) {
    e.dataTransfer.setData('text/plain', leadId)
  }

  async function onDrop(e, newStatus) {
    const id = e.dataTransfer.getData('text/plain')
    if (!id) return
    await supabase.from('leads').update({ status: newStatus }).eq('id', id)
    fetchLeads()
  }

  async function convertLeadToCustomer(lead) {
    const payload = { name: lead.name || lead.company || 'Unnamed', phone: lead.phone || null, email: lead.email || null, company: lead.company || null }
    const { data } = await supabase.from('customers').insert(payload).select().single()
    if (data) {
      await supabase.from('leads').delete().eq('id', lead.id)
      fetchCustomers()
      fetchLeads()
      alert('Lead converted to customer')
    }
  }

  function saveNote(customerId, txt) {
    setNotes((n) => ({ ...n, [customerId]: txt }))
  }

  const activity = useMemo(() => {
    const acts = []
    leads.forEach((l) => acts.push({ type: 'lead', text: `${l.name || l.company} (${l.status})`, date: l.due_date }))
    reminders.forEach((r) => acts.push({ type: 'reminder', text: r.title, date: r.due_date }))
    customers.forEach((c) => acts.push({ type: 'customer', text: c.name, date: c.created_at }))
    return acts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 50)
  }, [leads, reminders, customers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customers & CRM</h2>
        <div className="flex gap-2">
          <Button onClick={() => setTab('crm')}>Open CRM</Button>
          <Button onClick={() => setTab('list')}>Customers</Button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>List</button>
        <button className={`tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>Activity</button>
        <button className={`tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Notes</button>
        <button className={`tab ${tab === 'crm' ? 'active' : ''}`} onClick={() => setTab('crm')}>CRM</button>
      </div>

      {tab === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Searchable table with totals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Total Sales</th>
                    <th>Last Invoice</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td>{c.name}</td>
                      <td>{c.phone}</td>
                      <td>{c.email}</td>
                      <td><a href={`/invoices?customer=${encodeURIComponent(c.id)}`} className="text-blue-400">View</a></td>
                      <td>{/* optional: last invoice date */}</td>
                      <td className="flex gap-2"><Button size="sm" onClick={() => setTab('notes')}>Notes</Button><Button size="sm" onClick={() => setTab('activity')}>Activity</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Follow-ups and recent events</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {activity.map((a, i) => (
                <li key={i} className="flex justify-between">
                  <div>{a.text}</div>
                  <div className="text-xs text-white/60">{new Date(a.date || Date.now()).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {tab === 'notes' && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Customer notes</CardDescription>
          </CardHeader>
          <CardContent>
            {customers.map((c) => (
              <div key={c.id} className="mb-4">
                <h4 className="font-medium">{c.name}</h4>
                <textarea className="w-full input h-24" value={notes[c.id] || ''} onChange={(e) => saveNote(c.id, e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'crm' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Leads Pipeline</CardTitle>
                <CardDescription>Drag leads between stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto">
                  {columns.map((col) => (
                    <div key={col.key} className="w-64 bg-slate-800 rounded p-2" onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, col.key)}>
                      <h5 className="font-semibold mb-2">{col.title}</h5>
                      <div className="space-y-2">
                        {leads.filter((l) => (l.status || 'new') === col.key).map((l) => (
                          <div key={l.id} draggable onDragStart={(e) => onDragStart(e, l.id)} className="bg-slate-700 p-2 rounded">
                            <div className="font-medium">{l.name || l.company}</div>
                            <div className="text-xs text-white/60">{l.email}</div>
                            <div className="flex gap-1 mt-2">
                              <Button size="xs" onClick={() => convertLeadToCustomer(l)}>Convert</Button>
                              <Button size="xs" onClick={() => supabase.from('leads').update({ owner: 'me' }).eq('id', l.id).then(fetchLeads)}>Assign</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Reminders</CardTitle>
                <CardDescription>Upcoming follow-ups</CardDescription>
              </CardHeader>
              <CardContent>
                <ReminderForm onSaved={fetchReminders} />
                <ul className="mt-4 space-y-2">
                  {reminders.map((r) => (
                    <li key={r.id} className="flex justify-between">
                      <div>{r.title}</div>
                      <div className="text-xs text-white/60">{new Date(r.due_date).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
