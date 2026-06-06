"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { Hospital } from "@/types";

interface CSVExportProps {
  hospitals: Hospital[];
  searchQuery: string;
}

const AVAILABLE_COLUMNS = [
  { key: "name", label: "Hospital Name" },
  { key: "address", label: "Address" },
  { key: "phone", label: "Phone Number" },
  { key: "email", label: "Email" },
  { key: "specialties", label: "Specialties" },
  { key: "rating_avg", label: "Rating" },
  { key: "city", label: "City" },
  { key: "lga", label: "LGA" },
  { key: "ownership_type", label: "Ownership Type" },
];

export default function CSVExport({ hospitals, searchQuery }: CSVExportProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "name",
    "address",
    "phone",
    "specialties",
    "rating_avg",
  ]);
  const [showModal, setShowModal] = useState(false);

  const handleExport = () => {
    const filteredData = hospitals.map((hospital) => {
      const row: any = {};
      selectedColumns.forEach((col) => {
        if (col === "specialties") {
          row[col] = hospital.specialties.join(", ");
        } else if (col === "rating_avg") {
          row[col] =
            `${hospital.rating_avg.toFixed(1)} (${hospital.rating_count} reviews)`;
        } else {
          row[col] = hospital[col as keyof Hospital];
        }
      });
      return row;
    });

    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split("T")[0];
    const filename = `hospitals-${searchQuery || "all"}-${date}.csv`;

    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowModal(false);
  };

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((c) => c !== columnKey)
        : [...prev, columnKey],
    );
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold">Export Hospitals to CSV</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Select the columns you want to include in the export:
            </p>

            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {AVAILABLE_COLUMNS.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.key)}
                    onChange={() => toggleColumn(column.key)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{column.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Export {hospitals.length} Hospitals
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
      )}
    </>
  );
}
