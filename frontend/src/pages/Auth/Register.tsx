import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authApi } from '../../services/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      const response = await authApi.register({ email: formData.email, password: formData.password });
      
      console.log('Register response:', response.data);
      
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
      
      console.log('User registered and data stored:', {
        userId: user.id,
        userEmail: user.email
      });
      
      navigate('/login');
    } catch (err: any) {
      console.error('Registration failed', err);
      setErrors(prev => ({ ...prev, email: 'Registration failed. User might already exist.' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center full-height" style={{ backgroundColor: '#f1f5f9' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-2 font-bold" style={{ fontSize: '1.5rem' }}>Create Account</h2>
        <p className="text-center text-secondary mb-6 text-sm">Start your AI journey today</p>
        
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

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
          />
          
          <Button type="submit" fullWidth isLoading={isLoading} className="mb-4">
            Sign Up
          </Button>
        </form>

        <div className="text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-bold" style={{ color: 'var(--primary-color)' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
