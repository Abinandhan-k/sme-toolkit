import { useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"

export default function Assessment() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 1,
      question: "Does your SME currently use any digital tools for billing or inventory?",
    },
    {
      id: 2,
      question: "Do you have difficulty tracking customers, follow-ups, or sales?",
    },
    {
      id: 3,
      question: "Would automated invoicing help reduce manual workload?",
    },
    {
      id: 4,
      question: "Do you currently face challenges managing stock visibility?",
    },
    {
      id: 5,
      question: "Would you benefit from a simple, mobile-first digital toolkit?",
    }
  ];

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Digital Readiness Assessment</h1>
      <p className="text-gray-600 mb-6">
        Answer the following quick questions to evaluate where your SME currently stands.
      </p>

      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="p-4 bg-white rounded-lg shadow">
            <p className="font-medium">{q.question}</p>

            <div className="flex gap-6 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value="yes"
                  checked={answers[q.id] === "yes"}
                  onChange={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: "yes" }))
                  }
                />
                Yes
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value="no"
                  checked={answers[q.id] === "no"}
                  onChange={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: "no" }))
                  }
                />
                No
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Submit Assessment
      </button>

      {submitted && (
        <div className="mt-6 p-5 bg-green-50 border border-green-300 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Assessment Summary</h2>

          {Object.values(answers).filter((a) => a === "yes").length >= 3 ? (
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle />
              <p>Your SME is highly ready for digital transformation.</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-red-700">
              <XCircle />
              <p>Your SME can greatly benefit from digital tools like invoicing, CRM, and stock tracking.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}