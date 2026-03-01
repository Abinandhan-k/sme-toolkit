import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Modal from '@/components/Modal'
import { Badge } from '@/components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Employee = {
  id: string
  name?: string
  email?: string
  role?: string
  status?: string
  created_at?: string
}

type Attendance = {
  id: string
  employee_id?: string
  punch_in?: string
  punch_out?: string
  date?: string
}

export default function HRPage() {
  const [tab, setTab] = useState('list')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const subRef = useRef<any>(null)

  useEffect(() => {
    fetchEmployees()
    try {
      subRef.current = supabase
        .channel('public-employees')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => fetchEmployees())
        .subscribe()
    } catch (e) {}
    return () => { try { subRef.current?.unsubscribe() } catch {} }
  }, [])

  async function fetchEmployees() {
    const { data } = await supabase.from('employees').select('id,name,email,role,status,created_at')
    setEmployees(data || [])
  }

  async function fetchAttendance(empId: string) {
    const { data } = await supabase.from('attendance').select('id,employee_id,punch_in,punch_out,date').eq('employee_id', empId).order('date', { ascending: false })
    setAttendance(data || [])
  }

  // Punch in/out for today
  async function punchInOut(empId: string, action: 'in' | 'out') {
    const now = new Date().toISOString()
    const today = now.split('T')[0]
    const { data: existing } = await supabase.from('attendance').select('id').eq('employee_id', empId).eq('date', today).single()

    if (action === 'in') {
      if (!existing) {
        await supabase.from('attendance').insert({ employee_id: empId, punch_in: now, date: today })
      }
    } else {
      if (existing) {
        await supabase.from('attendance').update({ punch_out: now }).eq('id', existing.id)
      }
    }
    fetchEmployees() // refresh
  }

  async function deleteEmployee(id: string) {
    if (!confirm('Delete employee?')) return
    await supabase.from('employees').delete().eq('id', id)
    fetchEmployees()
  }

  function openCreate() { setEditing(null); setOpenModal(true) }
  function openEdit(e: Employee) { setEditing(e); setOpenModal(true) }
  function viewAttendance(e: Employee) { setSelectedEmployee(e); fetchAttendance(e.id); setTab('attendance') }

  // Attendance heatmap data (simplified: count by week)
  const heatmapData = useMemo(() => {
    const weeks: Record<string, number> = {}
    attendance.forEach((a) => {
      if (a.date) {
        const d = new Date(a.date)
        const week = `W${Math.ceil(d.getDate() / 7)}`
        weeks[week] = (weeks[week] || 0) + 1
      }
    })
    return Object.entries(weeks).map(([week, count]) => ({ week, count }))
  }, [attendance])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">HR Management</h2>
        <Button onClick={openCreate}>Add Employee</Button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>Employees</button>
        <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
      </div>

      {tab === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>Timeclock and attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e, i) => (
                    <tr key={e.id}>
                      <td>{i + 1}</td>
                      <td>{e.name}</td>
                      <td>{e.email}</td>
                      <td>{e.role}</td>
                      <td><Badge variant={e.status === 'active' ? 'success' : 'secondary'}>{e.status}</Badge></td>
                      <td className="flex gap-2">
                        <Button size="sm" onClick={() => punchInOut(e.id, 'in')}>Punch In</Button>
                        <Button size="sm" onClick={() => punchInOut(e.id, 'out')}>Punch Out</Button>
                        <Button size="sm" onClick={() => viewAttendance(e)}>View</Button>
                        <Button size="sm" onClick={() => openEdit(e)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteEmployee(e.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'attendance' && selectedEmployee && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance - {selectedEmployee.name}</CardTitle>
              <CardDescription>Recent logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Punch In</th>
                      <th>Punch Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a) => (
                      <tr key={a.id}>
                        <td>{a.date}</td>
                        <td>{a.punch_in ? new Date(a.punch_in).toLocaleTimeString() : '—'}</td>
                        <td>{a.punch_out ? new Date(a.punch_out).toLocaleTimeString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Heatmap</CardTitle>
              <CardDescription>Weekly attendance chart</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={heatmapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div className="p-4 max-w-md">
          <h3 className="text-lg font-medium mb-2">{editing ? 'Edit Employee' : 'Add Employee'}</h3>
          <EmployeeForm employee={editing} onClose={() => { setOpenModal(false); fetchEmployees() }} />
        </div>
      </Modal>
    </div>
  )
}

function EmployeeForm({ employee, onClose }: { employee?: Employee | null; onClose: () => void }) {
  const [name, setName] = useState(employee?.name || '')
  const [email, setEmail] = useState(employee?.email || '')
  const [role, setRole] = useState(employee?.role || '')
  const [status, setStatus] = useState(employee?.status || 'active')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const payload = { name, email, role, status }
      if (employee) await supabase.from('employees').update(payload).eq('id', employee.id)
      else await supabase.from('employees').insert(payload)
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3">
      <input className="input w-full" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="input w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input w-full" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
      <select className="input w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </div>
  )
}
