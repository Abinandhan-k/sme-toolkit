import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function CustomerForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("customers").insert([{ name, phone }]);

    setLoading(false);
    if (!error) onSuccess();
    else alert(error.message);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        className="w-full p-3 border rounded"
        placeholder="Customer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full p-3 border rounded"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button 
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Saving..." : "Add Customer"}
      </button>

    </form>
  );
}