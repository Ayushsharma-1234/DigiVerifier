import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();
  const router = useRouter();

  const isApplicant = user?.role === 'APPLICANT';
  const isLMO = user?.role === 'LMO';
  const isGATC = user?.role === 'GATC';
  const isAdmin = user?.role === 'ADMIN';

  const requireAuth = (allowedRoles?: string[]) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect unauthorized users based on their role
      switch (user.role) {
        case 'APPLICANT':
          router.push('/dashboard/applicant');
          break;
        case 'LMO':
          router.push('/dashboard/lmo');
          break;
        case 'GATC':
          router.push('/dashboard/gatc');
          break;
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/auth/login');
      }
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isApplicant,
    isLMO,
    isGATC,
    isAdmin,
    login,
    logout,
    updateUser,
    requireAuth,
  };
}
