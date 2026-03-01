import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Modal from "../components/Modal";
import ItemForm from "../components/ItemForm";

export default function Items() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  async function loadItems() {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setItems(data);
  }

  async function deleteItem(id) {
    if (!confirm("Are you sure?")) return;

    const { error } = await supabase.from("items").delete().eq("id", id);

    if (!error) loadItems();
    else alert("Delete failed");
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Items / Inventory</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          + Add Item
        </button>
      </div>

      {/* Items Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="py-3 text-left">ID</th>
              <th className="py-3 text-left">Name</th>
              <th className="py-3 text-left">Price</th>
              <th className="py-3 text-left">Stock</th>
              <th className="py-3 text-left">Value</th>
              <th className="py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No items found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">#{item.id}</td>
                  <td className="py-3">{item.name}</td>
                  <td className="py-3">₹{item.price}</td>
                  <td className="py-3">{item.stock}</td>
                  <td className="py-3 font-semibold">₹{item.price * item.stock}</td>

                  <td className="py-3">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Item">
        <ItemForm
          onSuccess={() => {
            setOpen(false);
            loadItems();
          }}
        />
      </Modal>
    </div>
  );
}