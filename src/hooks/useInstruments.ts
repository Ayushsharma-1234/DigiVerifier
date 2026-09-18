import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instruments } from '@/lib/api';

export function useInstruments() {
  return useQuery({
    queryKey: ['instruments'],
    queryFn: () => instruments.getAll(),
  });
}

export function useInstrument(id: string) {
  return useQuery({
    queryKey: ['instrument', id],
    queryFn: () => instruments.getById(id),
    enabled: !!id,
  });
}

export function useInstrumentHistory(id: string) {
  return useQuery({
    queryKey: ['instrumentHistory', id],
    queryFn: () => instruments.getHistory(id),
    enabled: !!id,
  });
}

export function useCreateInstrument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: instruments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instruments'] });
    },
  });
}
