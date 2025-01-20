import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Settings, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Failed to sign in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Settings className="h-12 w-12 text-primary-light animate-spin-slow" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-dark dark:text-primary-light">
          Sign in to AbdoluteB
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 dark:bg-white/5 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-primary-light/20 dark:border-primary-dark/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-dark dark:text-primary-light">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-primary-light/20 dark:border-primary-dark/20 rounded-md shadow-sm bg-white dark:bg-background-dark text-primary-dark dark:text-primary-light placeholder-primary-dark/50 dark:placeholder-primary-light/50 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light/50"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-dark dark:text-primary-light">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-primary-light/20 dark:border-primary-dark/20 rounded-md shadow-sm bg-white dark:bg-background-dark text-primary-dark dark:text-primary-light placeholder-primary-dark/50 dark:placeholder-primary-light/50 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light/50"
                  placeholder="Enter your password"
                />
                <Lock className="h-5 w-5 text-primary-dark/40 dark:text-primary-light/40 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-primary-light hover:bg-primary-light/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-light/20 dark:border-primary-dark/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/90 dark:bg-white/5 text-primary-dark/60 dark:text-primary-light/60">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/auth/signup"
                className="w-full flex justify-center py-2 px-4 border border-primary-light/20 dark:border-primary-dark/20 rounded-md shadow-md text-sm font-medium text-primary-dark dark:text-primary-light bg-white/50 dark:bg-white/5 hover:bg-primary-light/10 dark:hover:bg-primary-light/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-colors duration-200"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}