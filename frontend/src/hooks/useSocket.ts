import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { addNotification } from '../store/slices/notificationSlice';
import { updateShipmentRealtime } from '../store/slices/shipmentSlice';
import { useAuth } from './useAuth';
import { AppDispatch } from '../store/store';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const initialized = useRef(false);

  useEffect(() => {
    if (isAuthenticated && token && !initialized.current) {
      initialized.current = true;
      const socket = connectSocket(token);

      socket.on('notification', (data) => {
        dispatch(addNotification(data));
      });

      socket.on('tracking:update', (data) => {
        dispatch(updateShipmentRealtime(data));
      });
    }

    return () => {
      if (!isAuthenticated) {
        disconnectSocket();
        initialized.current = false;
      }
    };
  }, [isAuthenticated, token, dispatch]);

  const joinTrackingRoom = (trackingNumber: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('track:join', trackingNumber);
    }
  };

  const leaveTrackingRoom = (trackingNumber: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('track:leave', trackingNumber);
    }
  };

  return { joinTrackingRoom, leaveTrackingRoom };
};
