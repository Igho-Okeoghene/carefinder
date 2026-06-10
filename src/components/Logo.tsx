import { Building2, Compass } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Hospital Building */}
        <div className="bg-blue-600 p-2 rounded-xl shadow-md">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        {/* Compass needle overlay */}
        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-sm">
          <Compass className="w-3 h-3 text-white" />
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-800 leading-tight">
          Carefinder
        </h1>
        <p className="text-xs text-gray-500 leading-tight">
          Find Healthcare Facilities
        </p>
      </div>
    </div>
  );
}