import axios from 'axios';
import { BASE_URL } from './config';

export const releaseChairFromTicket = async (eventId, tableId, chairId) => {
    const endpoint = `${BASE_URL}/PublicTicket/ReleaseChairFromTicket`;
    const payload = {
        eventId,
        passCode: '1234',
        tables: [
            {
                tableId,
                chairs: [
                    {
                        chairId,
                    },
                ],
            },
        ],
    };

    try {
        const response = await axios.post(endpoint, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error during API call:', error);
        throw error;
    }
};