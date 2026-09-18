import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applications } from '@/lib/api';

export function useApplications(filters?: any) {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => applications.getAll(filters),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => applications.getById(id),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applications.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function usePayApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applications.pay,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useScheduleApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => applications.schedule(id, date),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useInspectApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => applications.inspect(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
