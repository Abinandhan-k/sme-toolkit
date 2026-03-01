export default function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
      <div className="flex justify-between items-center">
        <h3 className="text-gray-600 font-medium">{title}</h3>
        {icon && <span className="text-2xl text-blue-600">{icon}</span>}
      </div>

      <p className="text-3xl font-bold mt-3">{value}</p>
    </div>
  );
}