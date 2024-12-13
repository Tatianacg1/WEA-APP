import axios from 'axios';
import { API_TOKEN } from './config';

export const fetchPrivateEventDetails = async (eventId) => {
  try {
    const response = await axios.get(`https://new-api.worldeventaccess.com/api/Event/${eventId}?IncludeTickets=false`, {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};