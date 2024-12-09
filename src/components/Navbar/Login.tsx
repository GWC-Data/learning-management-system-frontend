import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoginImg from '../../images/login&signup.png';

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
  setUserName: (name: string) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated, setUserName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('/auth/login', { email, password });

      // Log response for debugging
      console.log('Login successful:', response.data);

      // Extract token and user details
      const { accessToken, user } = response.data;
      const fullName = `${user.firstName} ${user.lastName}`;
      const userId = user.id; // Assuming `id` is the property for the user ID

      console.log('Access token:', accessToken);

      // Store token and user details in localStorage
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', fullName);

      // Update authentication state and user name
      setIsAuthenticated(true);
      setUserName(fullName);

      // Redirect to home route
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your email and password.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen bg-gradient-to-r from-purple-200 to-blue-200">
      {/* Image on the left */}
      <div className="hidden md:block">
        <img src={LoginImg} alt="Login" className="w-[520px] h-[520px] mt-14 ml-56" />
      </div>

      {/* Login Form on the right */}
      <div className="flex justify-center items-center p-8 -mt-[120px] ml-56">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
          <h2 className="text-3xl font-semibold mb-6 text-center text-blue-700">Login</h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            <label className="block mb-3">
              <span className="text-gray-600">Email</span>
              <input
                type="email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-600">Password</span>
              <input
                type="password"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition shadow-md"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
