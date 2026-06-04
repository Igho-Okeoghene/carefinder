import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase.from("hospitals").select("*");

  console.log(data, error);

  return <div>Test Page</div>;
}
