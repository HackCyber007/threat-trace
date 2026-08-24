// frontend/src/services/api.js

const API_BASE = 'https://threat-trace-yaik.onrender.com/api';

export const getIndicatorSummary = async (indicator) => {
  const response = await fetch(`${API_BASE}/indicators/summary?value=${encodeURIComponent(indicator)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch summary');
  }
  return response.json();
};

export const getIndicatorGraph = async (indicator) => {
  const response = await fetch(`${API_BASE}/indicators/graph?value=${encodeURIComponent(indicator)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch graph data');
  }
  return response.json();
};

export const getHiddenLinks = async () => {
  const response = await fetch(`${API_BASE}/campaigns/hidden-links`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch hidden links');
  }
  return response.json();
};