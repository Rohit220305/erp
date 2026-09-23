
export const displayFormat = (value, type = "DEFAULT") => {
  if (value !== null && value !== undefined && value !== "") {
    return value;
  }

  const envKey = `NEXT_PUBLIC_NO_DATA_${type.toUpperCase()}`;
  return process.env[envKey] || "—";
};
