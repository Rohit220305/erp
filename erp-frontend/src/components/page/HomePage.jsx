export default function HomePage() {
  return (
    <div className="p-10">
      <h1 className="mb-8 text-3xl font-bold">Welcome To ERP</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Company</h2>

          <p className="mt-2 text-gray-500">Manage Companies</p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Group</h2>

          <p className="mt-2 text-gray-500">Manage Groups</p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">User</h2>

          <p className="mt-2 text-gray-500">Manage Users</p>
        </div>
      </div>
    </div>
  );
}
