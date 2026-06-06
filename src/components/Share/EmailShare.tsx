"use client";

import { useState } from "react";
import { Mail, Send, X } from "lucide-react";
import { Hospital } from "@/types";

interface EmailShareProps {
  hospitals: Hospital[];
}

export default function EmailShare({ hospitals }: EmailShareProps) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSend = async () => {
    if (!email || selectedHospitals.length === 0) {
      setMessage({
        type: "error",
        text: "Please enter an email and select at least one hospital",
      });
      return;
    }

    setIsSending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/share/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          hospitals: hospitals.filter((h) => selectedHospitals.includes(h.id)),
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Email sent successfully!" });
        setTimeout(() => {
          setShowModal(false);
          setEmail("");
          setSelectedHospitals([]);
          setMessage(null);
        }, 2000);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to send email. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const toggleHospital = (hospitalId: string) => {
    setSelectedHospitals((prev) =>
      prev.includes(hospitalId)
        ? prev.filter((id) => id !== hospitalId)
        : [...prev, hospitalId],
    );
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Mail className="w-4 h-4" />
        Share via Email
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-semibold">
                  Share Hospitals via Email
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Hospitals to Share ({selectedHospitals.length})
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {hospitals.map((hospital) => (
                    <label
                      key={hospital.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedHospitals.includes(hospital.id)}
                        onChange={() => toggleHospital(hospital.id)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <div>
                        <div className="font-medium">{hospital.name}</div>
                        <div className="text-sm text-gray-500">
                          {hospital.city}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
