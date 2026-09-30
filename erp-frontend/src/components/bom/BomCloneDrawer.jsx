"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import SideDrawer from "@/components/common/SideDrawer";
import ConfirmModal from "@/components/common/ConfirmModal";
import { listBoms, cloneBom } from "@/lib/api/bom-api";

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    pointerEvents: "auto",
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "48px",
    backgroundColor: disabled ? "#f3f4f6" : "#f9fafb",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: disabled ? "#e5e7eb" : error ? "#f87171" : "#1565c0",
    },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#1565c0"
      : state.isFocused
        ? "#eff6ff"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1f2937",
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: disabled ? "#9ca3af" : "#1f2937",
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#9ca3af",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    transition: "all .2s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
  }),
});

export default function BomCloneDrawer({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [bomOptions, setBomOptions] = useState([]);
  const [loadingBoms, setLoadingBoms] = useState(false);

  const [formData, setFormData] = useState({
    sourceBomId: "",
    newBomName: "",
  });
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    data: null,
  });

  useEffect(() => {
    if (open) {
      // Reset state when opening
      setFormData({ sourceBomId: "", newBomName: "" });
      setErrors({});
      setIsDirty(false);

      // Fetch BOM list for dropdown
      const loadBomOptions = async () => {
        try {
          setLoadingBoms(true);
          const res = await listBoms({ page: 1, limit: 1000 });
          const list = res?.settings?.data?.list || res?.data?.list || [];
          setBomOptions(
            list.map((bom) => ({
              label: `${bom.bomName}`,
              value: bom.id,
            }))
          );
        } catch (error) {
          console.error("Failed to load BOM options:", error);
          toast.error("Failed to load BOM options");
        } finally {
          setLoadingBoms(false);
        }
      };

      loadBomOptions();
    }
  }, [open]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const fieldErrors = {};
    if (!formData.sourceBomId) {
      fieldErrors.sourceBomId = "Please select From BOM.";
    }
    if (!formData.newBomName || !formData.newBomName.trim()) {
      fieldErrors.newBomName = "Please enter To BOM.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmState({ isOpen: true, data: formData });
    }
  };

  const handleDiscardClick = () => {
    if (isDirty) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      onClose && onClose();
    }
  };

  const handleActualSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await cloneBom({
        sourceBomId: Number(data.sourceBomId),
        newBomName: data.newBomName.trim(),
      });

      const isSuccess =
        response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success("BOM cloned successfully!");
        onSuccess && onSuccess();
      } else {
        toast.error(message || "Failed to clone BOM");
      }
    } catch (error) {
      console.error("Clone BOM Error:", error);
      toast.error(error.message || "Failed to clone BOM");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title="Clone BOM"
      width="450px"
    >
      <div className="flex h-full flex-col text-black">
        <form
          onSubmit={handleSubmitClick}
          id="clone-bom-drawer-form"
          className="flex h-full flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                From BOM <span className="text-red-500">*</span>
              </label>
              <Select
                instanceId="select-source-bom"
                value={
                  bomOptions.find(
                    (opt) => opt.value === formData.sourceBomId
                  ) || null
                }
                onChange={(opt) =>
                  handleChange("sourceBomId", opt ? opt.value : "")
                }
                options={bomOptions}
                isLoading={loadingBoms}
                isClearable={true}
                isSearchable={true}
                placeholder="Select BOM to clone from..."
                classNamePrefix="react-select"
                styles={customSelectStyles(errors.sourceBomId, loading)}
              />
              {errors.sourceBomId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.sourceBomId}
                </p>
              )}
            </div>

            {/* Field 2: To BoM */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                To BOM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter new BOM Name"
                value={formData.newBomName}
                onChange={(e) => handleChange("newBomName", e.target.value)}
                className={`w-full rounded-md border bg-gray-50 px-4 py-3 text-sm placeholder:text-sm placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-[#1565c0]
                  ${errors.newBomName ? "border-red-500 bg-red-50" : "border-gray-300"}
                `}
              />
              {errors.newBomName && (
                <p className="mt-1 text-sm text-red-500">{errors.newBomName}</p>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="border-t bg-white px-6 pt-5 pb-10">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDiscardClick}
                disabled={loading}
                className="flex-1 cursor-pointer rounded-md border border-[#1565c0] px-4 py-3 text-[#1565c0] transition hover:bg-blue-50"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 cursor-pointer rounded-md bg-[#1565c0] px-4 py-3 text-white transition hover:bg-[#0f57a6] disabled:opacity-50"
              >
                {loading ? "Cloning..." : "Submit"}
              </button>
            </div>
          </div>
        </form>

        <ConfirmModal
          isOpen={confirmState.isOpen}
          actionType={
            confirmState.type === "discard" ? "discard" : "create"
          }
          entityName="BOM Clone"
          onConfirm={() => {
            if (confirmState.type === "discard") {
              onClose && onClose();
            } else {
              handleActualSubmit(confirmState.data);
            }
            setConfirmState({ isOpen: false, data: null });
          }}
          onCancel={() => setConfirmState({ isOpen: false, data: null })}
        />
      </div>
    </SideDrawer>
  );
}
