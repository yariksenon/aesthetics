import React, { useEffect, useState } from "react";
import axios from "axios";
import { Cookie } from "@mui/icons-material";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await axios.get('http://localhost:8080/api/v1/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        localStorage.removeItem('token');
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={() => window.location.href = '/login'}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!profile) {
    return <div className="max-w-md mx-auto mt-10 p-6">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {profile.user_id}</p>
        <p><strong>Role:</strong> {profile.role}</p>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}
        className="mt-6 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
