export function buildApiUrl(path) {
  const base = import.meta.env.VITE_API_URL || "";
  if (!base || path.startsWith("http")) return path;
  const baseClean = base.replace(/\/$/, "");
  const pathClean = path.replace(/^\//, "");
  return `${baseClean}/${pathClean}`;
}
