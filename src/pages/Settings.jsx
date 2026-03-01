import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [appName, setAppName] = useState("SME Toolkit");
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [message, setMessage] = useState("");

  const saveSettings = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.from("settings").upsert(
        [
          {
            id: 1,
            app_name: appName,
            theme,
            language,
          },
        ],
        { onConflict: "id" }
      );

      if (error) throw error;

      setMessage("Settings saved successfully!");
    } catch (err) {
      setMessage("Error saving settings.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Settings</h1>

      {/* App Name */}
      <div className="bg-white rounded-xl p-5 shadow mb-5">
        <label className="text-gray-700 font-medium">Application Name</label>
        <input
          type="text"
          className="w-full mt-2 p-3 border rounded-lg"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />
      </div>

      {/* Theme */}
      <div className="bg-white rounded-xl p-5 shadow mb-5">
        <label className="text-gray-700 font-medium">Theme</label>
        <select
          className="w-full mt-2 p-3 border rounded-lg"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Language */}
      <div className="bg-white rounded-xl p-5 shadow mb-6">
        <label className="text-gray-700 font-medium">Language</label>
        <select
          className="w-full mt-2 p-3 border rounded-lg"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ta">Tamil</option>
          <option value="hi">Hindi</option>
        </select>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>

      {/* Message */}
      {message && (
        <p className="mt-4 text-green-600 font-medium">{message}</p>
      )}
    </div>
  );
}