import { createMutation } from '@/shared/api/query-client';

export function useLoginMutation() {
  return createMutation({
    url: '/auth/login',
    method: 'POST',
  });
}

export function useRegisterMutation() {
  return createMutation({
    url: '/auth/register',
    method: 'POST',
  });
}
