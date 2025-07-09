import { getAuthToken } from './api.js';

// Use non-admin endpoint for fetching rooms
export const API_URL = 'http://localhost:8000/api/rooms';

/**
 * Fetches rooms from the API with authentication
 * @returns {Promise<Array>} Array of room objects
 * @throws {Error} If there's an error fetching rooms or if not authenticated
 */
export async function fetchRooms() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = 'admin-login.html';
        return [];
      }
      throw new Error(`Failed to fetch rooms: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      console.warn('Expected array of rooms, received:', data);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Error in fetchRooms:', err);
    throw new Error('Error fetching rooms: ' + (err.message || 'Unknown error'));
  }
}