import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function InvoiceView() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadInvoice();
  }, []);

  async function loadInvoice() {
    // Fetch invoice
    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*, customers(*)")
      .eq("id", id)
      .single();

    setInvoice(invoiceData);
    setCustomer(invoiceData?.customers);

    // Fetch invoice_items with item details
    const { data: rowItems } = await supabase
      .from("invoice_items")
      .select("*, items(name, price)")
      .eq("invoice_id", id);

    setItems(rowItems || []);
  }

  if (!invoice) return <p>Loading invoice...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold">Invoice</h1>
        <span className="text-gray-600 text-lg">INV-{invoice.id}</span>
      </div>

      {/* Customer Info */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Customer</h2>
        <p className="text-gray-700"><strong>Name:</strong> {customer?.name}</p>
        <p className="text-gray-700"><strong>Phone:</strong> {customer?.phone}</p>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-2 text-left">Item</th>
            <th className="py-2 text-left">Qty</th>
            <th className="py-2 text-left">Price</th>
            <th className="py-2 text-left">Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="py-3">{row.items?.name}</td>
              <td className="py-3">{row.quantity}</td>
              <td className="py-3">₹{row.items?.price}</td>
              <td className="py-3 font-semibold">₹{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Amount */}
      <div className="text-right text-xl font-semibold">
        Grand Total: ₹{invoice.total}
      </div>
    </div>
  );
}