import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const getUser = async (userId: number) => {
    return axios.get(`${API_URL}/users/${userId}`);
};

export const createUser = async (user: { user_id: number; name: string; city: string }) => {
    return axios.post(`${API_URL}/users`, user);
};
