import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building, 
  CheckCircle, 
  ArrowRight,
  Shield,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRegister } from '@/hooks/useAuth';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  companyName: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      agreeToTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
      });
    } catch (error) {
      // Error is handled by the mutation
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                FreelanceHub
              </h1>
              <p className="text-sm text-gray-500">Start Your Freelancing Journey</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">Join 10,000+ freelancers</span>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create your account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Start managing your freelance business professionally
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      placeholder="John"
                      className={`pl-10 h-12 ${errors.firstName ? 'border-rose-500 focus:border-rose-500' : ''}`}
                      {...register('firstName')}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.firstName && (
                    <p className="text-rose-600 text-sm">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Last Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className={`pl-10 h-12 ${errors.lastName ? 'border-rose-500 focus:border-rose-500' : ''}`}
                      {...register('lastName')}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.lastName && (
                    <p className="text-rose-600 text-sm">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
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
                  <p className="text-rose-600 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Company Name (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-gray-700 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Company Name (Optional)
                </Label>
                <div className="relative">
                  <Input
                    id="companyName"
                    placeholder="Your Business Name"
                    className="pl-10 h-12"
                    {...register('companyName')}
                  />
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
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
                  <p className="text-rose-600 text-sm">{errors.password.message}</p>
                )}
                
                {/* Password Requirements */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className={`flex items-center gap-2 text-xs ${password?.length >= 8 ? 'text-emerald-600' : 'text-gray-500'}`}>
                    <div className={`h-2 w-2 rounded-full ${password?.length >= 8 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                    <div className={`h-2 w-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[a-z]/.test(password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                    <div className={`h-2 w-2 rounded-full ${/[a-z]/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                    <div className={`h-2 w-2 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span>Number</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 h-12 ${errors.confirmPassword ? 'border-rose-500 focus:border-rose-500' : ''}`}
                    {...register('confirmPassword')}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-rose-600 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="agreeToTerms" 
                    {...register('agreeToTerms')} 
                    onCheckedChange={(checked) => {
                      // Convert Checkbox's boolean value to the form
                      register('agreeToTerms').onChange({
                        target: {
                          name: 'agreeToTerms',
                          value: checked,
                        },
                      });
                    }}
                  />
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                  >
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-rose-600 text-sm">{errors.agreeToTerms.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Already have account */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <Shield className="h-5 w-5 text-emerald-500 mx-auto" />
                <p className="text-xs font-medium text-gray-700">Secure</p>
              </div>
              <div className="space-y-1">
                <Sparkles className="h-5 w-5 text-blue-500 mx-auto" />
                <p className="text-xs font-medium text-gray-700">Powerful</p>
              </div>
              <div className="space-y-1">
                <CheckCircle className="h-5 w-5 text-purple-500 mx-auto" />
                <p className="text-xs font-medium text-gray-700">Reliable</p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};