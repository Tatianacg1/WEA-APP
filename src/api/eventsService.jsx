import axios from "axios";

export const fetchEventsDetails = async () => {
    try {
      const response = await axios.get('https://new-api.worldeventaccess.com/api/PublicEvents?Status=1', {
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };