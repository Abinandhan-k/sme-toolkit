import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Modal from "../components/Modal";
import TaskForm from "../components/TaskForm";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setTasks(data);
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) loadTasks();
  }

  async function toggleStatus(task) {
    const newStatus = task.status === "done" ? "pending" : "done";

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id);

    if (!error) loadTasks();
  }

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Task Manager</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          + Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="bg-white p-6 rounded-xl shadow space-y-3">

        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No tasks added yet</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50"
            >
              {/* Left Side */}
              <div>
                <p className={`text-lg font-medium ${task.status === "done" ? "line-through text-gray-500" : ""}`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-500">
                  Status: {task.status === "done" ? "Completed" : "Pending"}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => toggleStatus(task)}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {task.status === "done" ? "Undo" : "Complete"}
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Task">
        <TaskForm
          onDone={() => {
            setOpen(false);
            loadTasks();
          }}
        />
      </Modal>
    </div>
  );
}