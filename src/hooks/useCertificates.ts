import { useQuery } from '@tanstack/react-query';
import { certificates } from '@/lib/api';

export function useCertificates() {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificates.getAll(),
  });
}

export function useCertificate(id: string) {
  return useQuery({
    queryKey: ['certificate', id],
    queryFn: () => certificates.getById(id),
    enabled: !!id,
  });
}
