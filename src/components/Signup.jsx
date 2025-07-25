import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Building2, Shield, User, UserCheck } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  function handleRoleChange(value) {
    setFormData({
      ...formData,
      role: value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(formData.email, formData.password, formData.name, formData.role);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create an account. Please try again.');
      console.error('Signup error:', error);
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to sign in with Google.');
      console.error('Google sign in error:', error);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl relative z-10">
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="flex items-center justify-center mb-4 transform hover:scale-110 transition-transform duration-300">
            <Building2 className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-blue-600 mr-2 animate-bounce" style={{animationDelay: '0.5s'}} />
            <Shield className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-green-600 animate-bounce" style={{animationDelay: '1s'}} />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-2">
            CCL Mining
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base lg:text-lg">Employee Record & Compliance Management</p>
        </div>

        <Card className="backdrop-blur-lg bg-white/90 shadow-2xl border-0 rounded-2xl transform hover:scale-105 transition-all duration-300 animate-slideInUp">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Create Account</CardTitle>
            <CardDescription className="text-gray-600 text-xs md:text-sm lg:text-base">
              Sign up to access the compliance management system
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6 lg:px-8">
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50/80 backdrop-blur-sm animate-shake">
                <AlertDescription className="text-red-800 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <fieldset className="border border-gray-200 rounded-xl p-4 md:p-5 lg:p-6 space-y-4">
                <legend className="text-xs md:text-sm lg:text-base font-semibold text-gray-700 px-2">Personal Information</legend>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2 transform hover:scale-105 transition-transform duration-200">
                    <Label htmlFor="name" className="text-gray-700 font-medium text-sm md:text-base">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2 transform hover:scale-105 transition-transform duration-200">
                    <Label htmlFor="email" className="text-gray-700 font-medium text-sm md:text-base">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="border border-gray-200 rounded-xl p-4 md:p-5 lg:p-6 space-y-4">
                <legend className="text-xs md:text-sm lg:text-base font-semibold text-gray-700 px-2">Account Details</legend>
                
                <div className="space-y-2 transform hover:scale-105 transition-transform duration-200">
                  <Label htmlFor="role" className="text-gray-700 font-medium text-sm md:text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Role
                  </Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-2xl bg-white/95 backdrop-blur-lg">
                      <SelectItem value="employee" className="rounded-lg hover:bg-blue-50 transition-colors duration-200">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span>Employee</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hr" className="rounded-lg hover:bg-green-50 transition-colors duration-200">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 text-green-500" />
                          <span>HR/Admin</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2 transform hover:scale-105 transition-transform duration-200">
                    <Label htmlFor="password" className="text-gray-700 font-medium text-sm md:text-base">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2 transform hover:scale-105 transition-transform duration-200">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium text-sm md:text-base">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </fieldset>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group" 
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span className="relative z-10">Create Account</span>
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-500 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 border-2 border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl py-3 font-medium transform hover:scale-105 transition-all duration-300 group"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <div className="flex items-center justify-center">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <svg className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign up with Google</span>
                </div>
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-200"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

