export function formatNumber(val, decimals = 4) {
  if (val === null || val === undefined || val === "" || isNaN(Number(val))) {
    return "0";
  }
  const num = Number(val);
  const isFloat = num % 1 !== 0;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: isFloat ? decimals : 0,
  });
}

export function formatQuantityWithUom(val, uom = "", decimals = 4) {
  const formatted = formatNumber(val, decimals);
  return uom ? `${formatted} ${uom}` : formatted;
}

export function formatCurrency(val, currencySymbol = "₦", options = {}) {
  const { decimals = 2 } = options;
  const formatted = formatNumber(val, decimals);
  return currencySymbol ? `${currencySymbol} ${formatted}` : formatted;
}

export function formatPercent(val, options = {}) {
  const { decimals = 2 } = options;
  if (val === null || val === undefined || val === "" || isNaN(Number(val))) {
    return "0%";
  }
  return `${formatNumber(val, decimals)}%`;
}

export function addCommas(raw) {
  if (!raw && raw !== "0") return "";
  const str = String(raw);
  const [intPart, ...decParts] = str.split(".");
  const hasDecimal = str.includes(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (!hasDecimal) return formattedInt;
  return `${formattedInt}.${decParts.join("")}`;
}

export function stripCommas(formatted) {
  if (!formatted && formatted !== "0") return "";
  return String(formatted).replace(/,/g, "");
}
