import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function TaskForm({ onDone }) {
  const [title, setTitle] = useState("");

  async function submit(e) {
    e.preventDefault();

    const { error } = await supabase.from("tasks").insert([{ title }]);

    if (!error) onDone();
    else alert(error.message);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input 
        className="w-full p-3 border rounded"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
        Add Task
      </button>
    </form>
  );
}