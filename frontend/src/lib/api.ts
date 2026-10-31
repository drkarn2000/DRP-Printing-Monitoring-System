// API client for DRP Printing Monitoring System

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function fetchApi<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText} (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    // If backend is booting or unreachable, allow caller to fallback cleanly
    throw err;
  }
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvEscape = (v: any) => '"' + String(v ?? '').replaceAll('"', '""') + '"';
  const content = [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
