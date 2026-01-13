import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/authService';
import type { 
  UpdateUserRequest,
} from '@/types/auth';
import { toast } from 'sonner';

// Auth hooks
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Welcome back!');
      setTimeout(() => navigate('/'), 500);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Account created successfully!');
      setTimeout(() => navigate('/'), 500);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
    
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: () => {
      // Clear tokens anyway even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      navigate('/login');
    },
  });
};

// User data hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useUserById = (id?: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => id ? authService.getUserById(id) : null,
    enabled: !!id && authService.isAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      authService.updateUser(id, data),
    onSuccess: (updatedUser, variables) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
      queryClient.setQueryData(['user', variables.id], updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Update failed');
    },
  });
};

export const useDeleteUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authService.deleteUser(id),
    onSuccess: () => {
      queryClient.clear();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.success('Account deleted successfully');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Delete failed');
    },
  });
};

// Token refresh hook
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshToken: string) => 
      authService.refreshToken({ refreshToken }),
    onError: (error: any) => {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    },
  });
};