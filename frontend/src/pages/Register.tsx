import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { register as registerAction, clearError } from '../store/slices/authSlice';
import { useAuth } from '../hooks/useAuth';
import { AppDispatch } from '../store/store';
import { UserPlus } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth();

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = (data: RegisterForm) => {
    dispatch(registerAction(data));
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all";

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-2">Create account</h2>
      <p className="text-primary-200/60 text-center text-sm mb-8">Start shipping with ShipFlow</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-100 mb-1.5">Full Name</label>
          <input {...formRegister('name')} className={inputClass} placeholder="John Doe" />
          {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-100 mb-1.5">Email</label>
          <input {...formRegister('email')} type="email" className={inputClass} placeholder="you@example.com" />
          {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-100 mb-1.5">Password</label>
          <input {...formRegister('password')} type="password" className={inputClass} placeholder="Min. 6 characters" />
          {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-100 mb-1.5">Phone (optional)</label>
          <input {...formRegister('phone')} type="tel" className={inputClass} placeholder="+1-555-0100" />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-all disabled:opacity-50 shadow-lg shadow-primary-500/25"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Create Account
            </>
          )}
        </button>
      </form>

      <p className="text-center text-primary-200/60 text-sm mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-300 hover:text-primary-200 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
