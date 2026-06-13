import { Router } from "next/router";
import { useRouter } from "next/navigation";

export default function SitemapCard({ title, menus, path }) {
  const router = useRouter();
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm hover:-translate-y-1 transition-all duration-300 ease-out">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="font-medium text-[18px]">{title}</h3>
      </div>

      <ul className="px-8 py-4">
        {menus.map((menu) => (
          <li
            key={menu}
            className="mb-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer"
            onClick={() => router.push(path)}
          >
            • {menu}
          </li>
        ))}
      </ul>
    </div>
  );
}
