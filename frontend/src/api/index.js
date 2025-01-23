import axios from 'axios';
import { useDispatch } from 'react-redux';
import { searchReducer } from '../reducers';

export const search = async (search) => {
    try {
        const response = await axios.post(`http://localhost:3000/search`, {
            query: search
        });
        return response; // Return the data instead of the whole response
    } catch (error) {
        console.error(error);
        throw error;
    }
}