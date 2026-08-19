import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../services/api';
import type { ApiResponse, User, Organization } from '../../types';
import { UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setErrors({ password: ['Passwords do not match.'] });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await api.post<ApiResponse<{ token: string; user: User; organization: Organization }>>(
        '/auth/register',
        {
          name,
          email,
          password,
          organization_name: organizationName,
        }
      );
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user, [res.data.data.organization]);
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: [err.response?.data?.message || 'Registration failed.'] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-6 text-center">
          <img src="/taskora-logo-dark.png" alt="Taskora Logo" className="h-12 mb-3 object-contain" />
          <p className="text-sm text-slate-400">Create your user account & workspace</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {errors.general[0]}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name?.[0]}
            required
          />
          <Input
            label="Work Email"
            type="email"
            placeholder="john@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email?.[0]}
            required
          />
          <Input
            label="Organization Name"
            type="text"
            placeholder="Acme Corp"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            error={errors.organization_name?.[0]}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password?.[0]}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />

          <Button type="submit" className="w-full mt-3" isLoading={isLoading} icon={<UserPlus className="w-4 h-4" />}>
            Create Organization & Sign Up
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
