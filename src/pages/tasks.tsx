import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Modal from '@/components/Modal'
import { format } from 'date-fns'

type Task = {
  id: string
  title?: string
  description?: string
  status?: 'todo' | 'in_progress' | 'done'
  assignee?: string
  due_date?: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const subRef = useRef<any>(null)

  const columns = useMemo(() => [
    { key: 'todo', title: 'To Do' },
    { key: 'in_progress', title: 'In Progress' },
    { key: 'done', title: 'Done' },
  ], [])

  useEffect(() => {
    fetchTasks()
    try {
      subRef.current = supabase
        .channel('public-tasks')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchTasks())
        .subscribe()
    } catch (e) {}
    return () => { try { subRef.current?.unsubscribe() } catch {} }
  }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('id,title,description,status,assignee,due_date').order('due_date', { ascending: true })
    setTasks(data || [])
  }

  function onDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer!.setData('text/plain', taskId)
  }

  async function onDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault()
    const id = e.dataTransfer!.getData('text/plain')
    if (!id) return
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    fetchTasks()
  }

  async function deleteTask(id: string) {
    if (!confirm('Delete task?')) return
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  function openCreate() { setEditing(null); setOpenModal(true) }
  function openEdit(task: Task) { setEditing(task); setOpenModal(true) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button onClick={openCreate}>New Task</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Board</CardTitle>
          <CardDescription>Drag tasks between columns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.map((col) => (
              <div
                key={col.key}
                className="w-80 bg-slate-800 rounded-lg p-4 min-h-96"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, col.key)}
              >
                <h3 className="font-semibold mb-4">{col.title}</h3>
                <div className="space-y-3">
                  {tasks.filter((t) => (t.status || 'todo') === col.key).map((task) => (
                    <div key={task.id} draggable onDragStart={(e) => onDragStart(e as any, task.id)} className="bg-slate-700 p-3 rounded-lg cursor-move hover:bg-slate-600">
                      <div className="font-medium">{task.title}</div>
                      {task.description && <div className="text-xs text-white/60 mt-1">{task.description}</div>}
                      <div className="flex items-center justify-between mt-2 text-xs text-white/60">
                        <span>{task.assignee || 'Unassigned'}</span>
                        {task.due_date && <span>{format(new Date(task.due_date), 'MMM dd')}</span>}
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(task)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTask(task.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <div className="p-4 max-w-md">
          <h3 className="text-lg font-medium mb-2">{editing ? 'Edit Task' : 'Create Task'}</h3>
          <TaskForm task={editing} onClose={() => { setOpenModal(false); fetchTasks() }} />
        </div>
      </Modal>
    </div>
  )
}

function TaskForm({ task, onClose }: { task?: Task | null; onClose: () => void }) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [assignee, setAssignee] = useState(task?.assignee || '')
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.slice(0, 10) : '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const payload = { title, description, assignee, due_date: dueDate, status: 'todo' }
      if (task) await supabase.from('tasks').update(payload).eq('id', task.id)
      else await supabase.from('tasks').insert(payload)
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3">
      <input className="input w-full" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="input w-full h-20" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="input w-full" placeholder="Assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
      <input type="date" className="input w-full" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </div>
  )
}
