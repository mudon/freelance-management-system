import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Building,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLogin } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  // Remove rememberMe if not in your API
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await loginMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center shadow-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                FreelanceHub
              </h1>
              <p className="text-sm text-gray-500">Professional Freelancing Platform</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">Welcome back!</span>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Access your dashboard and manage your freelance business
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className={`pl-10 h-12 ${errors.email ? 'border-rose-500 focus:border-rose-500' : ''}`}
                    {...register('email')}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-rose-600 text-sm flex items-center gap-1">
                    <span>⚠</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 h-12 ${errors.password ? 'border-rose-500 focus:border-rose-500' : ''}`}
                    {...register('password')}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-600 text-sm flex items-center gap-1">
                    <span>⚠</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                {/* <Checkbox id="rememberMe" {...register('rememberMe')} /> */}
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                >
                  Remember me for 30 days
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Create an account
              </Link>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              <span>Protected by end-to-end encryption</span>
            </div>
          </CardFooter>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/privacy" className="hover:text-gray-700 hover:underline">
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/terms" className="hover:text-gray-700 hover:underline">
              Terms of Service
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/contact" className="hover:text-gray-700 hover:underline">
              Contact Support
            </Link>
          </div>
          <p className="mt-4">© {new Date().getFullYear()} FreelanceHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};