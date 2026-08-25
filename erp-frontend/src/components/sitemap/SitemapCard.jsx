import { useRouter } from "next/navigation";

export default function SitemapCard({ title, menus, path }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm hover:-translate-y-1 transition-all duration-300 ease-out">
      <div
        className={`border-b border-gray-100 px-8 py-4 hover:bg-gray-50 `}
        
      >
        <h3 className="font-medium text-[17px]">{title}</h3>
      </div>

      <ul className="px-8 py-4">
        {menus.map((menu) => {
          const label = typeof menu === "string" ? menu : menu.label;
          const menuPath = typeof menu === "string" ? path : menu.path;
          return (
            <li
              key={label}
              className="mb-2 text-[15px] text-gray-600 hover:text-blue-600 cursor-pointer"
              onClick={() => menuPath && router.push(menuPath)}
            >
              • {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
