export default function SearchPage({
  searchParams,
}: {
  searchParams: {
    city?: string;
    specialty?: string;
  };
}) {

  return (
    <div>
      <h1>Search Results</h1>

      <p>City: {searchParams.city}</p>

      <p>
        Specialty: {searchParams.specialty}
      </p>
    </div>
  );
}