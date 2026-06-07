import { supabase } from "@/lib/supabase/client";

export default async function TestPage() {
  const { data, error } = await supabase.from("hospitals").select("*");
  
  return (
    <div className="p-8">
      <h1>Database Test</h1>
      <p>Hospitals found: {data?.length || 0}</p>
      {error && <p className="text-red-500">Error: {error.message}</p>}
    </div>
  );
}
