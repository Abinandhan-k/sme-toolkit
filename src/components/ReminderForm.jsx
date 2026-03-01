import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ReminderForm({ onDone }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  async function submit(e) {
    e.preventDefault();

    const { error } = await supabase.from("reminders").insert([
      { title, remind_on: date }
    ]);

    if (!error) onDone();
    else alert(error.message);
  }

  return (
    <form onSubmit={submit} className="space-y-4">

      <input 
        className="w-full p-3 border rounded"
        placeholder="Reminder Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input 
        type="date"
        className="w-full p-3 border rounded"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
        Set Reminder
      </button>

    </form>
  );
}