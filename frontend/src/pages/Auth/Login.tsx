import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      const response = await authApi.login(formData);
      
      console.log('Login response:', response.data);
      
      // Backend returns: { token: '...', user: { id: '...', email: '...' } }
      const user = response.data.user || response.data;
      
      // Ensure we have valid data
      if (!user || !user.id || !user.email) {
        console.error('Invalid user data:', user);
        throw new Error('Invalid response from server');
      }
      
      // Store user data
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('authToken', response.data.token || 'dummy-token');
      
      console.log('User data stored:', {
        userId: user.id,
        userEmail: user.email
      });
      
      login(response.data.token || 'dummy-token');
      console.log('Login successful');
    } catch (err: any) {
      console.error('Login failed', err);
      setErrors(prev => ({ ...prev, email: 'Invalid email or password' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center full-height" style={{ backgroundColor: '#f1f5f9' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-6 font-bold" style={{ fontSize: '1.5rem' }}>Welcome Back</h2>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
          />
          
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
          />
          
          <Button type="submit" fullWidth isLoading={isLoading} className="mb-4">
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold" style={{ color: 'var(--primary-color)' }}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};
