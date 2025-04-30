import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddressInput = ({ userId, onCancel, onSave, initialAddress }) => {
  const [address, setAddress] = useState({
    address_line: '',
    country: '',
    city: '',
    postal_code: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken') || document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
      
      await axios.post('http://localhost:8080/api/v1/profile/address', {
        user_id: userId,
        ...address
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSave();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="address-form mt-4">
      <h3 className="text-lg font-semibold mb-3">{initialAddress ? 'Edit Address' : 'Add Address'}</h3>
      {error && <div className="text-red-500 mb-3">{error}</div>}
      {success && <div className="text-green-500 mb-3">Address saved successfully!</div>}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="form-group">
          <label htmlFor="address_line" className="block text-sm font-medium text-gray-700">Address Line:</label>
          <input
            type="text"
            id="address_line"
            name="address_line"
            value={address.address_line}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country:</label>
          <input
            type="text"
            id="country"
            name="country"
            value={address.country}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={address.city}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">Postal Code:</label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={address.postal_code}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="flex space-x-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressInput;