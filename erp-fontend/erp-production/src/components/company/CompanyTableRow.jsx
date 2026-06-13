import Image from "next/image";

export default function CompanyTableRow({ company }) {
  return (
    <tr className="border border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-4">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={company.companyName}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-gray-200" />
        )}
      </td>

      <td className="px-4 py-4">
        <div>
          <p className="font-medium">{company.companyName}</p>

          <p className="text-xs text-gray-500">{company.shortName}</p>
        </div>
      </td>

      <td className="px-4 py-4">{company.companyCode}</td>

      <td className="px-4 py-4">{company.contactPersonName}</td>

      <td className="px-4 py-4">{company.email}</td>

      <td className="px-4 py-4">{company.phone}</td>

      <td className="px-4 py-4">
        <span
          className={`
            px-3 py-1 rounded-full text-xs

            ${
              company.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }
          `}
        >
          {company.status}
        </span>
      </td>

      <td className="px-4 py-4">{company.addedDateFormatted}</td>
    </tr>
  );
}
