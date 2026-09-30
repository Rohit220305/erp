"use client";

import MaterialRequestForm from "./MaterialRequestForm";

export default function MaterialRequestDrawerForm({
  id = null,
  initialData = null,
  onSuccess = null,
  onCancel = null,
}) {
  return (
    <div className="p-4">
      <MaterialRequestForm
        id={id}
        initialData={initialData}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </div>
  );
}
