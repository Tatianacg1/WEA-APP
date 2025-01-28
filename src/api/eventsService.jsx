import axios from "axios";

export const fetchEventsDetails = async () => {
    try {
      const response = await axios.get('https://api.worldeventaccess.com/api/PublicEvents?Status=1', {
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };