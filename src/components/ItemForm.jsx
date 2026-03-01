import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ItemForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  async function submitHandler(e) {
    e.preventDefault();

    const { error } = await supabase.from("items").insert([
      { name, price: Number(price), stock: Number(stock) }
    ]);

    if (!error) onSuccess();
    else alert(error.message);
  }

  return (
    <form onSubmit={submitHandler} className="space-y-4">

      <input 
        className="w-full p-3 border rounded"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input 
        className="w-full p-3 border rounded"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input 
        className="w-full p-3 border rounded"
        placeholder="Stock Qty"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />

      <button 
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        Save Item
      </button>

    </form>
  );
}