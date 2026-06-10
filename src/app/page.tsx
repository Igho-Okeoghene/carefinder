"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import HospitalMap from "../components/Map/HospitalMap";
import SearchBar from "../components/Search/SearchBar";
import HospitalCard from "../components/Hospital/HospitalCard";
import CSVExport from "../components/Export/CSVExport";
import ShareLink from "../components/Share/ShareLink";
import EmailShare from "../components/Share/EmailShare";
import { Hospital, SearchFilters } from "@/types";
import Logo from "@/components/Logo";
import { useCallback } from 'react';


export default function Home() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLocating, setIsLocating] = useState(false);
  const supabase = createClient();

  const fetchHospitals = useCallback(async (searchFilters: SearchFilters) => {
    setLoading(true);
    let query = supabase.from("hospitals").select("*");

    // Apply filters
    if (searchFilters.query) {
      query = query.or(
        `name.ilike.%${searchFilters.query}%,city.ilike.%${searchFilters.query}%,lga.ilike.%${searchFilters.query}%`,
      );
    }
    if (searchFilters.city) {
      query = query.ilike("city", `%${searchFilters.city}%`);
    }
    if (searchFilters.lga) {
      query = query.ilike("lga", `%${searchFilters.lga}%`);
    }
    if (searchFilters.specialties?.length) {
      query = query.overlaps("specialties", searchFilters.specialties);
    }
    if (searchFilters.ownership_type) {
      query = query.eq("ownership_type", searchFilters.ownership_type);
    }

    // Radius search using PostGIS
    
if (searchFilters.radius && searchFilters.lat && searchFilters.lng) {
  // Call the RPC function with correct parameter names
  const { data: radiusData, error: radiusError } = await supabase
    .rpc('hospitals_within_radius', {
      center_lng: searchFilters.lng,  // Note: center_lng not lng
      center_lat: searchFilters.lat,  // Note: center_lat not lat
      radius_meters: searchFilters.radius * 1000  // Convert km to meters
    });
  
  if (radiusError) {
    console.error('Radius search error:', radiusError);
  } else {
    // Transform coordinates for radius results
    const transformedData = radiusData?.map((hospital: any) => ({
      ...hospital,
      coordinates: {
        lat: hospital.coordinates?.coordinates?.[1] || 0,
        lng: hospital.coordinates?.coordinates?.[0] || 0,
      },
    })) || [];
    setHospitals(transformedData);
    setLoading(false);
    return; // Exit early since we already set hospitals
  }
}

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching hospitals:", error);
    } else {
      // Transform coordinates from PostGIS format
      const transformedData =
        data?.map((hospital: any) => ({
          ...hospital,
          coordinates: {
            lat: hospital.coordinates?.coordinates?.[1] || 0,
            lng: hospital.coordinates?.coordinates?.[0] || 0,
          },
        })) || [];
      setHospitals(transformedData);
    }
    setLoading(false);
  }, [supabase]);

  const handleUseMyLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newFilters = {
            ...filters,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radius: filters.radius || 10,
          };
          setFilters(newFilters);
          fetchHospitals(newFilters);
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert(
            "Unable to get your location. Please check your browser permissions.",
          );
          setIsLocating(false);
        },
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

    useEffect(() => {
    fetchHospitals(filters);
  }, []);

  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex gap-3">
              <CSVExport
                hospitals={hospitals}
                searchQuery={filters.query || "all"}
              />
              <ShareLink filters={filters} />
              <EmailShare hospitals={hospitals} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchBar
            onSearch={(newFilters) => {
              setFilters(newFilters);
              fetchHospitals(newFilters);
            }}
            initialFilters={filters}
            onUseMyLocation={handleUseMyLocation}
            isLocating={isLocating}
          />
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found <span className="font-semibold">{hospitals.length}</span>{" "}
            hospitals
          </p>
        </div>

        {/* Map and Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="h-[600px] sticky top-4">
            <HospitalMap
              hospitals={hospitals}
              onHospitalClick={(hospital) => {
                // Scroll to hospital card or navigate
                const element = document.getElementById(
                  `hospital-${hospital.id}`,
                );
                element?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
            />
          </div>

          {/* Listings Section */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">
                  No hospitals found. Try adjusting your search filters.
                </p>
              </div>
            ) : (
              hospitals.map((hospital) => (
                <div key={hospital.id} id={`hospital-${hospital.id}`}>
                  <HospitalCard hospital={hospital} />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
