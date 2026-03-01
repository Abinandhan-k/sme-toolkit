import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Modal from "../components/Modal";
import ReminderForm from "../components/ReminderForm";

export default function CRM() {
  const [leads, setLeads] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [openReminder, setOpenReminder] = useState(false);
  const [openLead, setOpenLead] = useState(false);

  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  // Load data
  useEffect(() => {
    loadLeads();
    loadReminders();
  }, []);

  async function loadLeads() {
    const { data, error } = await supabase
      .from("crm_leads")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setLeads(data);
  }

  async function loadReminders() {
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setReminders(data);
  }

  // Add Lead
  async function addLead(e) {
    e.preventDefault();

    const { error } = await supabase.from("crm_leads").insert([
      { name: leadName, phone: leadPhone },
    ]);

    if (!error) {
      setLeadName("");
      setLeadPhone("");
      setOpenLead(false);
      loadLeads();
    } else {
      alert(error.message);
    }
  }

  // Delete Lead
  async function deleteLead(id) {
    if (!confirm("Delete this lead?")) return;

    const { error } = await supabase.from("crm_leads").delete().eq("id", id);
    if (!error) loadLeads();
  }

  // Delete Reminder
  async function deleteReminder(id) {
    if (!confirm("Delete reminder?")) return;

    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (!error) loadReminders();
  }

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-semibold">CRM & Follow-ups</h1>

      {/* LEADS SECTION */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Leads</h2>

          <button
            onClick={() => setOpenLead(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Lead
          </button>
        </div>

        {/* Leads Table */}
        <table className="w-full">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="py-3 text-left">Name</th>
              <th className="py-3 text-left">Phone</th>
              <th className="py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-500">
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{lead.name}</td>
                  <td className="py-3">{lead.phone}</td>
                  <td className="py-3">
                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REMINDERS SECTION */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Follow-up Reminders</h2>

          <button
            onClick={() => setOpenReminder(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Reminder
          </button>
        </div>

        {/* Reminder List */}
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reminders set</p>
          ) : (
            reminders.map((r) => (
              <div
                key={r.id}
                className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-gray-600 text-sm">
                    Remind on: {r.remind_on}
                  </p>
                </div>

                <button
                  onClick={() => deleteReminder(r.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* REMINDER MODAL */}
      <Modal
        open={openReminder}
        onClose={() => setOpenReminder(false)}
        title="Add Reminder"
      >
        <ReminderForm
          onDone={() => {
            setOpenReminder(false);
            loadReminders();
          }}
        />
      </Modal>

      {/* LEAD MODAL */}
      <Modal
        open={openLead}
        onClose={() => setOpenLead(false)}
        title="Add Lead"
      >
        <form onSubmit={addLead} className="space-y-4">

          <input
            className="w-full p-3 border rounded"
            placeholder="Lead Name"
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
          />

          <input
            className="w-full p-3 border rounded"
            placeholder="Phone Number"
            value={leadPhone}
            onChange={(e) => setLeadPhone(e.target.value)}
          />

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
            Save Lead
          </button>
        </form>
      </Modal>
    </div>
  );
}