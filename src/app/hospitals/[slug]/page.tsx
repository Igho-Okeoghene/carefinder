"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Hospital, Review } from "@/types";
import RatingWidget from "../../../components/Rating/RatingWidget";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Building2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function HospitalDetail() {
  const params = useParams();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchHospital = async () => {
      // Ensure slug exists
      const slug = params.slug as string;
      if (!slug) {
        setLoading(false);
        return;
      }

      // Fetch hospital
      const { data: hospitalData } = await supabase
        .from("hospitals")
        .select("*")
        .eq("slug", slug)
        .single();

      if (hospitalData) {
        // Safely transform coordinates with type checking
        let lat = 0, lng = 0;
        if (hospitalData.coordinates && typeof hospitalData.coordinates === 'object') {
          if ('coordinates' in hospitalData.coordinates && Array.isArray(hospitalData.coordinates.coordinates)) {
            lng = hospitalData.coordinates.coordinates[0] || 0;
            lat = hospitalData.coordinates.coordinates[1] || 0;
          }
        }
        
        setHospital({
          ...hospitalData,
          coordinates: { lat, lng },
          // Ensure specialties is always an array
          specialties: hospitalData.specialties || [],
          // Ensure ratings have defaults
          rating_avg: hospitalData.rating_avg || 0,
          rating_count: hospitalData.rating_count || 0,
        } as Hospital);

        // Fetch reviews only if we have a hospital ID
        if (hospitalData.id) {
          const { data: reviewsData } = await supabase
            .from("reviews")
            .select("*")
            .eq("hospital_id", hospitalData.id)
            .eq("is_approved", true)
            .order("created_at", { ascending: false });

          if (reviewsData) {
            // Transform reviews to match Review type
            const transformedReviews = reviewsData.map((review: any) => ({
              ...review,
              hospital_id: review.hospital_id || '',
              user_id: review.user_id || '',
              rating: review.rating || 0,
              comment: review.review_text || review.comment || '',
              created_at: review.created_at || new Date().toISOString(),
              updated_at: review.updated_at || new Date().toISOString(),
            }));
            setReviews(transformedReviews);
          }
        }
      }

      setLoading(false);
    };

    fetchHospital();
  }, [params.slug, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Hospital not found</h1>
        <Link
          href="/"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-800">
                  {hospital.name}
                </h1>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">
                    {hospital.rating_avg?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-gray-500">
                    ({hospital.rating_count || 0} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-gray-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5" />
                  <div>
                    <p>{hospital.address}</p>
                    <p className="text-sm">
                      {hospital.city}, {hospital.lga} LGA
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  <a
                    href={`tel:${hospital.phone}`}
                    className="hover:text-blue-600"
                  >
                    {hospital.phone}
                  </a>
                </div>

                {hospital.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <a
                      href={`mailto:${hospital.email}`}
                      className="hover:text-blue-600"
                    >
                      {hospital.email}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5" />
                  <span className="capitalize">{hospital.ownership_type}</span>
                </div>

                {hospital.visiting_hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-semibold">Visiting Hours:</p>
                      <div className="prose max-w-none">
                        <ReactMarkdown>
                          {hospital.visiting_hours}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {hospital.specialties && hospital.specialties.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {hospital.description && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <div className="prose max-w-none">
                  <ReactMarkdown>{hospital.description}</ReactMarkdown>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-500">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b last:border-0 pb-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {(review as any).review_text && (
                        <p className="text-gray-700">{(review as any).review_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RatingWidget
              hospitalId={hospital.id}
              onRatingSubmitted={() => {
                window.location.reload();
              }}
            />

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold mb-2">Location</h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <img
                  src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+hospital+FF0000(${hospital.coordinates.lng},${hospital.coordinates.lat})/${hospital.coordinates.lng},${hospital.coordinates.lat},15/400x300?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                  alt="Hospital location"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Map+Unavailable';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}