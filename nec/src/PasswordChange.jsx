import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Header from './Header';
import Footer from './Footer';

function PasswordChange() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        // Update token if provided
        if (data.token) {
          login(data.token);
        }

        // Navigate based on user role
        setTimeout(() => {
          if (user.role === 'reviewer') {
            navigate('/reviewer-dashboard');
          } else {
            navigate('/paper-status'); // fallback
          }
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
            Change Password Required
          </h2>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              <strong>Security Notice:</strong> You are required to change your password before proceeding.
              Please choose a strong password that you haven't used before.
            </p>
          </div>

          {message.text && (
            <div className={`mb-4 p-3 rounded text-center ${
              message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your current password"
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your new password"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md text-white ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">Password Requirements:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Must be different from current password</li>
              <li>• Use a combination of letters, numbers, and symbols for better security</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PasswordChange;
