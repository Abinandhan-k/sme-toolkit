import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Modal from "../components/Modal";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);

  const [open, setOpen] = useState(false);

  // Create Invoice State
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([]);

  useEffect(() => {
    loadInvoices();
    loadCustomers();
    loadItems();
  }, []);

  async function loadInvoices() {
    const { data, error } = await supabase
      .from("invoices")
      .select("*, customers(name)")
      .order("id", { ascending: false });

    if (!error) setInvoices(data);
  }

  async function loadCustomers() {
    const { data } = await supabase.from("customers").select("*");
    setCustomers(data || []);
  }

  async function loadItems() {
    const { data } = await supabase.from("items").select("*");
    setItems(data || []);
  }

  function addInvoiceRow() {
    setInvoiceItems([
      ...invoiceItems,
      { item_id: "", qty: 1, price: 0, total: 0 },
    ]);
  }

  function updateRow(index, field, value) {
    const updated = [...invoiceItems];

    if (field === "item_id") {
      const item = items.find((it) => it.id == value);
      updated[index].item_id = value;
      updated[index].price = item?.price || 0;
      updated[index].total = updated[index].qty * updated[index].price;
    } else if (field === "qty") {
      updated[index].qty = Number(value);
      updated[index].total = updated[index].qty * updated[index].price;
    }

    setInvoiceItems(updated);
  }

  async function saveInvoice() {
    if (!selectedCustomer || invoiceItems.length === 0) {
      alert("Select customer and add items");
      return;
    }

    const invoiceTotal = invoiceItems.reduce((sum, r) => sum + r.total, 0);

    // 1️⃣ Insert invoice
    const { data: invoiceRes, error: invoiceErr } = await supabase
      .from("invoices")
      .insert([{ customer_id: selectedCustomer, total: invoiceTotal }])
      .select()
      .single();

    if (invoiceErr) {
      alert(invoiceErr.message);
      return;
    }

    const invoiceId = invoiceRes.id;

    // 2️⃣ Insert each row into invoice_items
    const rows = invoiceItems.map((row) => ({
      invoice_id: invoiceId,
      item_id: Number(row.item_id),
      quantity: row.qty,
      total: row.total,
    }));

    const { error: itemsErr } = await supabase
      .from("invoice_items")
      .insert(rows);

    if (itemsErr) {
      alert(itemsErr.message);
      return;
    }

    // 3️⃣ Reduce stock from items table
    for (let row of invoiceItems) {
      const item = items.find((i) => i.id == row.item_id);
      const newStock = item.stock - row.qty;

      await supabase
        .from("items")
        .update({ stock: newStock })
        .eq("id", row.item_id);
    }

    setOpen(false);
    setInvoiceItems([]);
    setSelectedCustomer("");

    loadInvoices();
    loadItems();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Invoices</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          + Create Invoice
        </button>
      </div>

      {/* Invoice Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="py-3 text-left">ID</th>
              <th className="py-3 text-left">Customer</th>
              <th className="py-3 text-left">Total</th>
              <th className="py-3 text-left">View</th>
            </tr>
          </thead>

          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">INV-{inv.id}</td>
                  <td className="py-3">{inv.customers?.name}</td>
                  <td className="py-3 font-semibold">₹{inv.total}</td>
                  <td className="py-3">
                    <a
                      href={`/invoices/${inv.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Create Invoice">
        <div className="space-y-4">

          {/* Customer */}
          <select
            className="w-full p-3 border rounded"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Items Section */}
          <div className="space-y-3">
            {invoiceItems.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-3 items-center border-b pb-3"
              >
                {/* Item Select */}
                <select
                  className="p-2 border rounded"
                  value={row.item_id}
                  onChange={(e) =>
                    updateRow(index, "item_id", e.target.value)
                  }
                >
                  <option value="">Select Item</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name}
                    </option>
                  ))}
                </select>

                {/* Qty */}
                <input
                  type="number"
                  min="1"
                  value={row.qty}
                  className="p-2 border rounded"
                  onChange={(e) => updateRow(index, "qty", e.target.value)}
                />

                {/* Price */}
                <div>₹{row.price}</div>

                {/* Total */}
                <div className="font-semibold">₹{row.total}</div>
              </div>
            ))}

            <button
              onClick={addInvoiceRow}
              className="bg-gray-200 w-full py-2 rounded hover:bg-gray-300"
            >
              + Add Item
            </button>
          </div>

          {/* Save Invoice */}
          <button
            onClick={saveInvoice}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Save Invoice
          </button>
        </div>
      </Modal>
    </div>
  );
}