const fs = require('fs');

const fields = [
  { name: 'itemName', label: 'Item Name', required: true, type: 'text' },
  { name: 'itemCode', label: 'Item Code', required: true, type: 'text', disabled: 'mode === "edit"' },
  { name: 'shortName', label: 'Short Name', type: 'text' },
  { name: 'printName', label: 'Print Name', type: 'text' },
  { name: 'referenceCode', label: 'Reference Code', type: 'text' },
  { name: 'barcode', label: 'Barcode', required: true, type: 'text' },
  { name: 'vendorBarcode', label: 'Vendor Barcode', type: 'text' },
  { name: 'usageType', label: 'Usage Type', required: true, type: 'select', options: 'USAGE_TYPE_OPTIONS' },
  { name: 'status', label: 'Status', required: true, type: 'select', options: 'STATUS_OPTIONS' },
  { name: 'categoryId', label: 'Category', required: true, type: 'select', options: 'categoryOptions', isLoading: 'loadingDependentFields' },
  { name: 'manufacturerId', label: 'Manufacturer', required: true, type: 'select', options: 'manufacturerOptions', isLoading: 'loadingDependentFields' },
  { name: 'brandId', label: 'Brand', required: true, type: 'select', options: 'brandOptions', isLoading: 'loadingDependentFields' },
  { name: 'itemUomId', label: 'Item Base UOM', required: true, type: 'select', options: 'uomOptions' },
  { name: 'packageUomId', label: 'Package UOM', required: true, type: 'select', options: 'packageOptions', isLoading: 'loadingDependentFields' },
  { name: 'unitsPerPacking', label: 'Units Per Packing', required: true, type: 'number', step: '0.01' },
  { name: 'primitiveQuantity', label: 'Primitive Quantity', required: true, type: 'number', step: '0.01' },
  { name: 'isDecimalAllowed', label: 'Is Decimal Allowed?', required: true, type: 'select', options: 'YES_NO_OPTIONS' },
  { name: 'inventoryType', label: 'Inventory Type', required: true, type: 'select', options: 'INVENTORY_TYPE_OPTIONS' },
  { name: 'isScrap', label: 'Is Scrap?', required: true, type: 'select', options: 'YES_NO_OPTIONS' },
  { name: 'shelfLife', label: 'Shelf Life (Days)', type: 'number' },
  { name: 'batchCode', label: 'Batch Code / Lot No', required: true, type: 'text' },
  { name: 'currencyId', label: 'Currency', required: true, type: 'select', options: 'currencyOptions' },
  { name: 'purchasePrice', label: 'Purchase Price', required: true, type: 'number', step: '0.01' },
  { name: 'costPrice', label: 'Cost Price', required: true, type: 'number', step: '0.01' },
  { name: 'costPerUnit', label: 'Cost Per Unit', required: true, type: 'number', step: '0.01' },
  { name: 'weight', label: 'Weight', type: 'number', step: '0.01' },
  { name: 'weightUomId', label: 'Weight UOM', type: 'select', options: 'uomOptions' },
  { name: 'volume', label: 'Volume', type: 'number', step: '0.01' },
  { name: 'volumeUomId', label: 'Volume UOM', type: 'select', options: 'uomOptions' },
  { name: 'length', label: 'Length', type: 'number', step: '0.01' },
  { name: 'width', label: 'Width', type: 'number', step: '0.01' },
  { name: 'height', label: 'Height', type: 'number', step: '0.01' },
  { name: 'dimensionUomId', label: 'Dimension UOM', type: 'select', options: 'uomOptions' }
];

let html = '';
fields.forEach(f => {
  if (f.type === 'select') {
    html += `
            <div className="space-y-1.5" id="field-${f.name}">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                ${f.label} ${f.required ? '<span className="text-red-400 ml-1">*</span>' : ''}
              </label>
              <Select
                instanceId="select-${f.name}"
                value={${f.options}.find((opt) => String(opt.value) === String(formData.${f.name})) || null}
                onChange={(opt) => handleChange("${f.name}", opt ? opt.value : "")}
                options={${f.options}}
                ${f.isLoading ? `isLoading={${f.isLoading}}` : ''}
                isClearable={true}
                isSearchable={true}
                placeholder="Select ${f.label.replace(/ \\([^)]*\\)/, '')}"
                classNamePrefix="react-select"
                styles={customSelectStyles(errors.${f.name})}
                ${f.options === 'manufacturerOptions' || f.options === 'categoryOptions' || f.options === 'brandOptions' || f.options === 'packageOptions' ? `
                noOptionsMessage={() => 
                  (user?.isSuperAdmin && !formData.companyId) 
                    ? "⚠ Please select Company." 
                    : "No options found"
                }` : ''}
              />
              {errors.${f.name} && (
                <p className="text-xs text-red-500">{errors.${f.name}}</p>
              )}
            </div>
`;
  } else {
    html += `
            <div className="space-y-1.5" id="field-${f.name}">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                ${f.label} ${f.required ? '<span className="text-red-400 ml-1">*</span>' : ''}
              </label>
              <input
                type="${f.type}"
                ${f.step ? `step="${f.step}"` : ''}
                ${f.disabled ? `disabled={${f.disabled}}` : ''}
                value={formData.${f.name} === null || formData.${f.name} === undefined ? "" : formData.${f.name}}
                onChange={(e) => handleChange("${f.name}", e.target.value)}
                className={\`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                  \${errors.${f.name} ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                  \${${f.disabled || 'false'} ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"}
                \`}
              />
              {errors.${f.name} && (
                <p className="text-xs text-red-500">{errors.${f.name}}</p>
              )}
            </div>
`;
  }
});

fs.writeFileSync('/var/www/html/training/erp/erp-frontend/item_form_fields.txt', html);
