import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Modal from '@/components/Modal'
import { Badge } from '@/components/ui/Badge'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

type Item = {
  id: string
  name?: string
  price?: number
  stock?: number
  category?: string
  barcode?: string
  image_url?: string
}

export default function ItemsPage() {
  const [q, setQ] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)

  const subRef = useRef<any>(null)

  useEffect(() => {
    fetchItems()

    try {
      subRef.current = supabase
        .channel('public-items')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => fetchItems())
        .subscribe()
    } catch (e) {
      // ignore
    }

    return () => { try { subRef.current?.unsubscribe() } catch {} }
  }, [q, categoryFilter, page])

  async function fetchItems() {
    setLoading(true)
    try {
      let query = supabase.from('items').select('id,name,price,stock,category,barcode,image_url').order('name')
      if (q) query = query.ilike('name', `%${q}%`)
      if (categoryFilter) query = query.eq('category', categoryFilter)

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      const { data, error } = await query.range(from, to)
      if (error) throw error
      setItems(data || [])

      const { count } = await supabase.from('items').select('id', { count: 'exact', head: false })
      setTotal(count || 0)
    } catch (e) {
      setItems([])
      setTotal(0)
    } finally { setLoading(false) }
  }

  function openCreate() { setEditing(null); setOpenModal(true) }
  function openEdit(it: Item) { setEditing(it); setOpenModal(true) }

  async function removeItem(id: string) {
    if (!confirm('Delete item?')) return
    await supabase.from('items').delete().eq('id', id)
    fetchItems()
  }

  // CSV import (simple)
  async function importCSV(file: File) {
    const txt = await file.text()
    const lines = txt.split(/\r?\n/).filter(Boolean)
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const rows = lines.slice(1).map((ln) => ln.split(',').map((c) => c.trim()))
    const payload = rows.map((r) => {
      const obj: any = {}
      headers.forEach((h, i) => { obj[h] = r[i] })
      return { name: obj.name, price: Number(obj.price || 0), stock: Number(obj.stock || 0), category: obj.category || null, barcode: obj.barcode || null }
    })
    await supabase.from('items').insert(payload)
    fetchItems()
  }

  const categories = useMemo(() => ['All', 'Raw', 'Finished', 'Service'], [])

  const stockDonut = useMemo(() => items.map((it) => ({ name: it.name || '', value: Math.max(0, it.stock || 0) })), [items])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Items</h2>
        <div className="flex gap-2">
          <Button onClick={openCreate}>Add Item</Button>
          <label className="btn btn-ghost">
            Import CSV
            <input className="hidden" type="file" accept=".csv" onChange={(e) => e.target.files && importCSV(e.target.files[0])} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Search, filter and manage stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <input className="input" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
                <select className="input" value={categoryFilter || ''} onChange={(e) => setCategoryFilter(e.target.value || null)}>
                  {categories.map((c) => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Low</th>
                      <th>Total Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={it.id}>
                        <td>{i + 1 + (page - 1) * pageSize}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {it.image_url && <img src={it.image_url} alt="" className="w-10 h-10 object-cover rounded" />}
                            <div>
                              <div className="font-medium">{it.name}</div>
                              <div className="text-xs text-white/60">Barcode: {it.barcode || '—'}</div>
                              <div className="text-xs"><a href={`/invoices?item=${encodeURIComponent(it.id)}`} className="text-blue-400">View invoices</a> · <a href={`/vendors?item=${encodeURIComponent(it.id)}`} className="text-blue-400">Vendors</a></div>
                            </div>
                          </div>
                        </td>
                        <td>₹{(it.price || 0).toLocaleString()}</td>
                        <td>{it.stock ?? 0}</td>
                        <td>{(it.stock ?? 0) < 10 ? <Badge variant="destructive">Low</Badge> : <Badge variant="outline">OK</Badge>}</td>
                        <td>₹{(((it.price || 0) * (it.stock || 0)) || 0).toLocaleString()}</td>
                        <td className="flex gap-2">
                          <Button size="sm" onClick={() => openEdit(it)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => removeItem(it.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-white/60">No items</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-white/60">{total} items</div>
                <div className="flex gap-2">
                  <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                  <div className="px-3 py-2 bg-muted rounded">{page}</div>
                  <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels</CardTitle>
              <CardDescription>Donut chart of stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={stockDonut} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={4}>
                      {stockDonut.map((entry, idx) => <Cell key={idx} fill={[ '#60A5FA', '#A78BFA', '#F472B6', '#34D399', '#F59E0B' ][idx % 5]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div className="p-4 max-w-2xl">
          <h3 className="text-lg font-medium mb-2">{editing ? 'Edit Item' : 'Add Item'}</h3>
          <ItemForm item={editing} onClose={() => { setOpenModal(false); fetchItems() }} categories={categories} />
        </div>
      </Modal>
    </div>
  )
}

function ItemForm({ item, onClose, categories }: { item?: Item | null; onClose: () => void; categories: string[] }) {
  const [name, setName] = useState(item?.name || '')
  const [price, setPrice] = useState(item?.price || 0)
  const [stock, setStock] = useState(item?.stock || 0)
  const [category, setCategory] = useState(item?.category || categories[1] || '')
  const [barcode, setBarcode] = useState(item?.barcode || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState(item?.image_url || '')
  const [saving, setSaving] = useState(false)

  async function uploadImage(file: File) {
    const id = `${Date.now()}-${file.name.replaceAll(' ', '_')}`
    const path = `${id}`
    const { data, error } = await supabase.storage.from('items').upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data: urlData } = supabase.storage.from('items').getPublicUrl(path)
    return urlData.publicUrl
  }

  async function save() {
    setSaving(true)
    try {
      let finalUrl = imageUrl
      if (imageFile) {
        finalUrl = await uploadImage(imageFile)
      }

      const payload = { name, price, stock, category, barcode, image_url: finalUrl }
      if (item) await supabase.from('items').update(payload).eq('id', item.id)
      else await supabase.from('items').insert(payload)

      onClose()
    } catch (e) {
      alert('Upload/save error')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm">Name</label>
        <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-sm">Price</label>
          <input type="number" className="input w-full" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm">Stock</label>
          <input type="number" className="input w-28" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
        </div>
      </div>

      <div className="flex gap-2">
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input className="input" placeholder="Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
      </div>

      <div>
        <label className="text-sm">Image</label>
        <input type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} />
        {imageUrl && <img src={imageUrl} className="w-24 h-24 object-cover mt-2" />}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </div>
  )
}

import { useTranslation } from 'react-i18next'
