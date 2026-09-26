import { fetchExperts } from '../api/users';
import type { ExpertProfile } from '../types/models';
import { useAsyncData } from './useAsyncData';

const NO_EXPERTS: ExpertProfile[] = [];

export function useExperts() {
  const { data, isLoading, error } = useAsyncData(fetchExperts);
  return { experts: data ?? NO_EXPERTS, isLoading, error };
}
