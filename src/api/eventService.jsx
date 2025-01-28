import axios from 'axios';

export const fetchEventDetails = async (eventId) => {
  try {
    const response = await axios.get(`https://api.worldeventaccess.com/api/PublicEvents/${eventId}`, {
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};