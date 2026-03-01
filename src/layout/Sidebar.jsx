import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { modules } from "../modulesConfig";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  // build navigation from module configuration; additional logic (permissions,
  // feature flags) can be added here later.
  const links = modules
    .filter((m) => !m.hideFromNav)
    .map((m) => ({ to: m.path, label: m.label }));

  return (
    <div className={`bg-white shadow-lg h-screen p-5 border-r transition-all duration-300 
      ${open ? "w-64" : "w-16"}`}>

      {/* Toggle Button */}
      <button 
        onClick={() => setOpen(!open)} 
        className="mb-6 p-2 rounded hover:bg-gray-100"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Nav Links */}
      <nav className="space-y-3">
        {links.map((nav) => (
          <NavLink
            key={nav.to}
            to={nav.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition 
              ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}`
            }
          >
            {nav.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}