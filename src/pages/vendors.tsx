import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Modal from '@/components/Modal'
import { Badge } from '@/components/ui/Badge'

type Vendor = {
  id: string
  name?: string
  contact_person?: string
  email?: string
  phone?: string
  rating?: number
}

type PO = {
  id: string
  vendor_id?: string
  po_number?: string
  amount?: number
  status?: string
  created_at?: string
}

export default function VendorsPage() {
  const [tab, setTab] = useState('list')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [pos, setPOs] = useState<PO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  const subRef = useRef<any>(null)

  useEffect(() => {
    fetchVendors()
    try {
      subRef.current = supabase
        .channel('public-vendors')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, () => fetchVendors())
        .subscribe()
    } catch (e) {}
    return () => { try { subRef.current?.unsubscribe() } catch {} }
  }, [q, page])

  async function fetchVendors() {
    setLoading(true)
    try {
      let query = supabase.from('vendors').select('id,name,contact_person,email,phone,rating').order('name')
      if (q) query = query.ilike('name', `%${q}%`)
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      const { data, error } = await query.range(from, to)
      if (error) throw error
      setVendors(data || [])
      const { count } = await supabase.from('vendors').select('id', { count: 'exact', head: false })
      setTotal(count || 0)
    } catch (e) {
      setVendors([])
      setTotal(0)
    } finally { setLoading(false) }
  }

  async function fetchPOs(vendorId: string) {
    const { data } = await supabase.from('purchase_orders').select('id,vendor_id,po_number,amount,status,created_at').eq('vendor_id', vendorId)
    setPOs(data || [])
  }

  async function removeVendor(id: string) {
    if (!confirm('Delete vendor?')) return
    await supabase.from('vendors').delete().eq('id', id)
    fetchVendors()
  }

  function openCreate() { setEditing(null); setOpenModal(true) }
  function openEdit(v: Vendor) { setEditing(v); setOpenModal(true) }
  function viewPOs(v: Vendor) { setSelectedVendor(v); fetchPOs(v.id); setTab('pos') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vendors</h2>
        <Button onClick={openCreate}>Add Vendor</Button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>List</button>
        <button className={`tab ${tab === 'pos' ? 'active' : ''}`} onClick={() => setTab('pos')}>Purchase Orders</button>
      </div>

      {tab === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>Manage suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <input className="input mb-4" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, i) => (
                    <tr key={v.id}>
                      <td>{i + 1 + (page - 1) * pageSize}</td>
                      <td>{v.name}</td>
                      <td>{v.contact_person}</td>
                      <td>{v.email}</td>
                      <td>{v.phone}</td>
                      <td><Badge>{v.rating || 0}/5</Badge></td>
                      <td className="flex gap-2">
                        <Button size="sm" onClick={() => openEdit(v)}>Edit</Button>
                        <Button size="sm" onClick={() => viewPOs(v)}>POs</Button>
                        <Button size="sm" variant="destructive" onClick={() => removeVendor(v.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-white/60">{total} vendors</div>
              <div className="flex gap-2">
                <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <div className="px-3 py-2 bg-muted rounded">{page}</div>
                <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'pos' && selectedVendor && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders - {selectedVendor.name}</CardTitle>
            <CardDescription>POs linked to this vendor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>PO #</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.po_number}</td>
                      <td>₹{(p.amount || 0).toLocaleString()}</td>
                      <td><Badge variant={p.status === 'completed' ? 'success' : 'warning'}>{p.status}</Badge></td>
                      <td>{new Date(p.created_at || '').toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div className="p-4 max-w-md">
          <h3 className="text-lg font-medium mb-2">{editing ? 'Edit Vendor' : 'Add Vendor'}</h3>
          <VendorForm vendor={editing} onClose={() => { setOpenModal(false); fetchVendors() }} />
        </div>
      </Modal>
    </div>
  )
}

function VendorForm({ vendor, onClose }: { vendor?: Vendor | null; onClose: () => void }) {
  const [name, setName] = useState(vendor?.name || '')
  const [contact, setContact] = useState(vendor?.contact_person || '')
  const [email, setEmail] = useState(vendor?.email || '')
  const [phone, setPhone] = useState(vendor?.phone || '')
  const [rating, setRating] = useState(vendor?.rating || 0)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const payload = { name, contact_person: contact, email, phone, rating }
      if (vendor) await supabase.from('vendors').update(payload).eq('id', vendor.id)
      else await supabase.from('vendors').insert(payload)
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3">
      <input className="input w-full" placeholder="Vendor name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="input w-full" placeholder="Contact person" value={contact} onChange={(e) => setContact(e.target.value)} />
      <input className="input w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input w-full" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <div>
        <label className="text-sm">Rating</label>
        <input type="number" min="0" max="5" className="input w-full" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </div>
  )
}
