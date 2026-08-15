import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { login as loginAction, clearError } from '../store/slices/authSlice';
import { useAuth } from '../hooks/useAuth';
import { AppDispatch } from '../store/store';
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, user } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'agent') navigate('/agent');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = (data: LoginForm) => {
    dispatch(loginAction(data));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome back</h2>
      <p className="text-primary-200/60 text-center text-sm mb-8">Sign in to your account</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-primary-100 mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-100 mb-1.5">Password</label>
          <input
            {...register('password')}
            type="password"
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password.message}</p>}
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
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      <p className="text-center text-primary-200/60 text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-300 hover:text-primary-200 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
