
export function formatNumber(val, options = {}) {
  const {
    decimals = 2,
    fallback = "0",
    allowDecimal = true,
    useGrouping = true,
  } = options;

  if (val === null || val === undefined || val === "" || isNaN(Number(val))) {
    return fallback;
  }

  const num = Number(val);
  const fixedDecimals = allowDecimal ? decimals : 0;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fixedDecimals,
    maximumFractionDigits: fixedDecimals,
    useGrouping,
  }).format(num);
}


export function formatCurrency(val, currencySymbol = "₦", options = {}) {
  const { decimals = 2, fallback = "0.00" } = options;
  if (val === null || val === undefined || val === "" || isNaN(Number(val))) {
    return currencySymbol ? `${currencySymbol} ${fallback}` : fallback;
  }
  const formatted = formatNumber(val, { decimals, fallback, useGrouping: true });
  return currencySymbol ? `${currencySymbol} ${formatted}` : formatted;
}


export function formatQuantityWithUom(val, uomName = "", options = {}) {
  const formatted = formatNumber(val, options);
  return uomName ? `${formatted} ${uomName}` : formatted;
}

export function formatPercent(val, options = {}) {
  const { decimals = 2, fallback = "0%" } = options;
  if (val === null || val === undefined || val === "" || isNaN(Number(val))) {
    return fallback;
  }
  const formatted = formatNumber(val, { decimals });
  return `${formatted}%`;
}


export function parseNumberInput(val, options = {}) {
  const { min, max, decimals = 2, allowDecimal = true } = options;

  if (val === "" || val === null || val === undefined) return "";
  const clean = String(val).replace(/[^0-9.-]/g, "");

  let num = parseFloat(clean);
  if (isNaN(num)) return "";

  if (min !== undefined && num < min) num = min;
  if (max !== undefined && num > max) num = max;

  if (!allowDecimal) return String(Math.floor(num));
  return num.toFixed(decimals);
}


export function sanitizeNumericString(inputVal, allowDecimal = true) {
  if (!inputVal) return "";
  let val = String(inputVal);
  if (allowDecimal) {
    val = val.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) {
      val = `${parts[0]}.${parts.slice(1).join("")}`;
    }
  } else {
    val = val.replace(/[^0-9]/g, "");
  }
  return val;
}
