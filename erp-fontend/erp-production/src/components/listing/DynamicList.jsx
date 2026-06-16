export default function DynamicList({ data, renderCard }) {
    return (
      <div className="space-y-4">
        {/* {data.map((item, index) => renderCard(item, index))} */}

        {data.map((item, index) => (
          <div className="bg-white rounded-lg p-6">
            <div className="grid grid-cols-4 gap-8">
              <div>
                <p>Company Name</p>

                <p className="text-blue-600">{company.name}</p>
              </div>

              <div>
                <p>Short Name</p>

                <p>{company.shortName}</p>
              </div>

              <div>
                <p>Status</p>

                <p>{company.status}</p>
              </div>

              <div>
                <p>Email</p>

                <p>{company.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
}
