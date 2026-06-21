import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../utils/api';

export function useSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(API_URL, { withCredentials: true });

    const invalidate = (keys) => () => keys.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));

    socket.on('notification', invalidate(['notifications', 'dashboard']));
    socket.on('agent_completed', invalidate(['agents', 'emails', 'dashboard', 'crm']));
    socket.on('email_processed', invalidate(['emails', 'dashboard', 'crm']));

    return () => socket.disconnect();
  }, [queryClient]);
}
