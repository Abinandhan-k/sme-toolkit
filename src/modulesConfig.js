// central configuration for modules/routes/navigation
// modules can be enabled/disabled dynamically (e.g. by feature flag, subscription tier,
// or user questionnaire) and the app will pick them up automatically.

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Items from "./pages/Items";
import Invoices from "./pages/Invoices";
import InvoiceView from "./pages/InvoiceView";
import CRM from "./pages/CRM";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Assessment from "./pages/Assessment";
import Settings from "./pages/Settings";

// Export component *references* rather than JSX so this file stays plain JS
// (esbuild / Vite will not need to parse JSX here).
export const modules = [
  { path: "/", label: "Dashboard", element: Dashboard, core: true },
  { path: "/customers", label: "Customers", element: Customers, core: true },
  { path: "/items", label: "Items", element: Items, core: true },
  { path: "/invoices", label: "Invoices", element: Invoices, core: true },
  { path: "/invoices/:id", element: InvoiceView, hideFromNav: true },

  // CRM & tasks module
  { path: "/crm", label: "CRM", element: CRM, core: false },
  { path: "/tasks", label: "Tasks", element: Tasks, core: false },

  // advanced / optional modules
  { path: "/analytics", label: "Analytics", element: Analytics, core: false },
  { path: "/assessment", label: "Assessment", element: Assessment, core: false },
  { path: "/settings", label: "Settings", element: Settings, core: true },
];

export function getEnabledModules(enabledMap = {}) {
  return modules.filter((m) => {
    if (m.hideFromNav) return false;
    return enabledMap[m.path] !== false;
  });
}
