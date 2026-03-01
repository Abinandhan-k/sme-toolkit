export default function InvoiceItemRow({ item, qty, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-3 items-center border-b py-3">
      <div>{item.name}</div>

      <input
        type="number"
        min="1"
        value={qty}
        className="p-2 border rounded"
        onChange={(e) => onChange(Number(e.target.value))}
      />

      <div>₹{item.price}</div>

      <div className="font-semibold">₹{item.price * qty}</div>
    </div>
  );
}