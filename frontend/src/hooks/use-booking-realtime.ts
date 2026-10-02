'use client';

import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { ENV } from '@/config/env';
import { authApi } from '@/services/auth.service';
import { useAuth } from '@/providers/auth-context';

export function useBookingRealtime(onBookingChanged: () => void) {
  const { status, user } = useAuth();
  const onBookingChangedRef = useRef(onBookingChanged);

  useEffect(() => {
    onBookingChangedRef.current = onBookingChanged;
  }, [onBookingChanged]);

  useEffect(() => {
    if (status !== 'authenticated' || !user) return;

    let disposed = false;
    let hasConnected = false;
    let starting = false;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const connection = new HubConnectionBuilder()
      .withUrl(ENV.signalRHubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    const refreshBookings = () => onBookingChangedRef.current();
    const refreshAuth = async () => {
      try {
        await authApi.me();
      } catch (error) {
        console.error('Could not refresh authentication before SignalR reconnect.', error);
      }
    };

    connection.on('BookingCreated', refreshBookings);
    connection.on('BookingCancelled', refreshBookings);
    connection.on('BookingStatusChanged', refreshBookings);
    connection.onreconnecting(() => {
      void refreshAuth();
    });
    connection.onreconnected(() => {
      refreshBookings();
    });

    const start = async () => {
      if (disposed || starting || connection.state !== HubConnectionState.Disconnected) return;

      starting = true;
      try {
        await connection.start();
        if (disposed) {
          await connection.stop();
          return;
        }

        if (hasConnected) refreshBookings();
        hasConnected = true;
      } catch (error) {
        if (disposed) return;

        console.error('Could not start the booking SignalR connection.', error);
        void refreshAuth();
        retryTimeout = setTimeout(() => void start(), 5000);
      } finally {
        starting = false;
      }
    };

    const startTimeout = setTimeout(() => void start(), 0);

    return () => {
      disposed = true;
      if (startTimeout) clearTimeout(startTimeout);
      if (retryTimeout) clearTimeout(retryTimeout);

      connection.off('BookingCreated', refreshBookings);
      connection.off('BookingCancelled', refreshBookings);
      connection.off('BookingStatusChanged', refreshBookings);
      void connection.stop().catch((error: unknown) => {
        console.error('Could not stop the booking SignalR connection.', error);
      });
    };
  }, [status, user]);
}
