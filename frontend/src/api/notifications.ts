import { supabase } from '../lib/supabaseClient';
import type { Notification } from '../types/models';

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, read, createdAt')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return data;
}
