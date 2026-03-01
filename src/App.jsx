import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout
import Layout from "./layout/Layout";

// Pages
import { modules } from "./modulesConfig";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {modules.map((mod) => (
            <Route
              key={mod.path}
              path={mod.path}
              element={mod.element ? <mod.element /> : null}
            />
          ))}
        </Routes>
      </Layout>
    </Router>
  );
}