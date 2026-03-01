import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <div className="flex w-full h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Topbar />

        <main className="p-6 overflow-y-auto h-full">
          {children}
        </main>
      </div>
    </div>
  );
}