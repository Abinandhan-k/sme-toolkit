export default function Topbar() {
  return (
    <div className="w-full bg-white p-4 shadow flex justify-between items-center">
      <h1 className="text-xl font-semibold">SME Toolkit</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">Welcome, User</span>
        <img 
          src="https://ui-avatars.com/api/?name=User" 
          alt="avatar" 
          className="w-10 h-10 rounded-full border"
        />
      </div>
    </div>
  );
}