import React from "react";
import { BookSearch } from "lucide-react";

export default function NoDataMessage({ moduleName = "Data" }) {
  return (
    <div className="bg-white  p-10 h-full w-full text-center ">
      <BookSearch className="mx-auto h-12 w-12  text-gray-300 mb-4" />
      <h3 className="text-sm  text-gray-500">No {moduleName} Found</h3>
    </div>
  );
}
