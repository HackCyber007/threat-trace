// frontend/src/services/api.js

const API_BASE = 'http://localhost:5000/api';

async function fetchWrapper(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
    }
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const getIndicatorSummary = (indicator) => 
  fetchWrapper(`/indicators/summary?value=${encodeURIComponent(indicator)}`);

export const getIndicatorGraph = (indicator) => 
  fetchWrapper(`/indicators/graph?value=${encodeURIComponent(indicator)}`);

export const getHiddenLinks = () => 
  fetchWrapper('/campaigns/hidden-links');