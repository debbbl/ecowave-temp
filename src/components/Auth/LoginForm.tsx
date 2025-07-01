import React, { useState } from 'react';
import { useAuthContext } from './AuthProvider';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const LoginForm = (): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const { signIn, signUp } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        console.log('Creating account for:', email);
        const { error } = await signUp(email, password, fullName, 'admin');
        if (error) {
          console.error('Sign up error:', error);
          setError(error.message);
        } else {
          setIsSignUp(false);
          setError('Account created successfully! Please check your email for a confirmation link, then sign in.');
          // Clear form
          setEmail('');
          setPassword('');
          setFullName('');
        }
      } else {
        console.log('Signing in:', email);
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Sign in error:', error);
          
          // Provide more helpful error messages
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.');
          } else if (error.message.includes('Too many requests')) {
            setError('Too many login attempts. Please wait a few minutes and try again.');
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              className="w-[75px] h-[41px] object-cover"
              alt="Roche logo"
              src="/roche-logo.png"
            />
            <div className="ml-2 font-bold text-black text-xl [font-family:'Sansation',Helvetica]">
              EcoWave Hub
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Create Admin Account' : 'Admin Login'}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {isSignUp ? 'Create a new admin account' : 'Sign in with your credentials'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter your full name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="admin@ecowave.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your password"
                minLength={6}
              />
              {isSignUp && (
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              )}
            </div>
            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                error.includes('successfully') || error.includes('created') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-[#009A5A] hover:bg-[#008a50] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Admin Account' : 'Sign In'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmail('');
                setPassword('');
                setFullName('');
              }}
              disabled={isLoading}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need admin account? Create one'}
            </Button>
          </form>

          {/* Email Confirmation Info */}
          {isSignUp && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> After creating your account, you'll receive a confirmation email. 
                Click the link in the email to verify your account, then return here to sign in.
              </p>
            </div>
          )}

          {/* Troubleshooting Info */}
          <div className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Email Redirect Issue?</strong> If the confirmation email leads to localhost, 
              you can disable email confirmations in your Supabase Dashboard → Authentication → Settings 
              → "Enable email confirmations" (turn it off for admin accounts).
            </p>
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-600">
                <strong>Debug Info:</strong><br/>
                Current URL: {window.location.origin}<br/>
                Supabase URL: {import.meta.env.VITE_SUPABASE_URL?.substring(0, 30)}...<br/>
                Auth Mode: Real Authentication
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};