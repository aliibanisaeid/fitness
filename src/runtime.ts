export const staticSite = import.meta.env.MODE === 'pages' && !import.meta.env.VITE_API_BASE_URL;
export const assetUrl = (value: string) => value.startsWith('/') && !value.startsWith(import.meta.env.BASE_URL) ? `${import.meta.env.BASE_URL}${value.replace(/^\/+/, '')}` : value;
export const apiUrl = (route: string) => `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api/${route}`;

export function downloadRequest(payload: Record<string, unknown>) {
  const { website: _website, ...details } = payload;
  const file = new Blob([JSON.stringify({ status: 'draft-not-submitted', ...details }, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url; link.download = `harakat-${payload.type}-request.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
