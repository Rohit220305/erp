export default function CompanyGridCard({ company }) {
  return (
    <div
      className="
      bg-white
      rounded-lg
      p-4
      shadow-sm
      hover:-translate-y-1
      hover:shadow-md
      transition-all
    "
    >
      <div className="flex justify-between">
        <h3>{company.name}</h3>

        <span
          className="
          bg-green-500
          text-white
          px-3
          rounded
        "
        >
          Active
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <p>{company.email}</p>

        <p>{company.phone}</p>

        <p>{company.shortName}</p>
      </div>
    </div>
  );
}
