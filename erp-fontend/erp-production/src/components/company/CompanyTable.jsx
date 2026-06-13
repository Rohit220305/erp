export default function CompanyTable({ data }) {
    return (
      <div className="p-2 rounded-xl">
        <table className="w-full   ">
          <thead className=" ">
            <tr className="bg-[#eceaea] text-left rounded-lg rounded-top">
              <th className="px-4 py-4 font-medium">Logo</th>

              <th className="px-4 py-4 font-medium">Company Name</th>

              <th className="px-4 py-4 font-medium">Company Code</th>

              <th className="px-4 py-4 font-medium">Contact Person</th>

              <th className="px-4 py-4 font-medium">Email</th>

              <th className="px-4 py-4 font-medium">Phone</th>

              <th className="px-4 py-4 font-medium">Status</th>

              <th className="px-4 py-4 font-medium">Added Date</th>
            </tr>
            <div className="h-1"></div>
          </thead>
          <tbody className="">
            {data.map((company) => (
              <tr
                key={company.id}
                className="border border-gray-200 hover:bg-gray-50"
              >
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
            ))}
          </tbody>
        </table>
      </div>
    );
}
