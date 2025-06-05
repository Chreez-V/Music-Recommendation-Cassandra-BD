import React, { useState, useEffect } from 'react';
import { getUser } from '../services/api';

interface User {
    user_id: number;
    name: string;
    city: string;
}

const UserProfile: React.FC<{ userId: number }> = ({ userId }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUser(userId);
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    return (
        <div className="user-profile">
            <h2>{user.name}</h2>
            <p>ID: {user.user_id}</p>
            <p>City: {user.city}</p>
        </div>
    );
};

export default UserProfile;
