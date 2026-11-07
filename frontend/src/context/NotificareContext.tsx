import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from './AuthContext';

export interface Notificare {
  id: number;
  titlu: string;
  continut: string;
  citita: boolean;
  creatLa: string;
}

interface NotificareContextType {
  notificari: Notificare[];
  necititeCount: number;
  marcheazaCitita: (id: number) => Promise<void>;
  marcheazaToateCitite: () => Promise<void>;
}

const NotificareContext = createContext<NotificareContextType | null>(null);

export function NotificareProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [notificari, setNotificari] = useState<Notificare[]>([]);
  const clientRef = useRef<Client | null>(null);

  const necititeCount = notificari.filter(n => !n.citita).length;

  // Incarca notificarile din REST API la autentificare
  useEffect(() => {
    if (!token || !user) {
      setNotificari([]);
      return;
    }

    fetch('/api/notificari', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((data: Notificare[]) => setNotificari(data))
      .catch(() => {});
  }, [token, user]);

  // Conecteaza WebSocket la autentificare, deconecteaza la logout
  useEffect(() => {
    if (!token || !user) {
      // Deconecteaza la logout
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        // Asculta notificarile personale
        client.subscribe('/user/queue/notificari', (frame) => {
          try {
            const notif: Notificare = JSON.parse(frame.body);
            setNotificari(prev => [notif, ...prev]);
          } catch {
            // ignoram mesajele malformate
          }
        });
      },
      onStompError: () => {
        // Eroare silentioasa — reconectarea se face automat
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [token, user]);

  const marcheazaCitita = async (id: number) => {
    if (!token) return;
    await fetch(`/api/notificari/${id}/citita`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotificari(prev =>
      prev.map(n => (n.id === id ? { ...n, citita: true } : n))
    );
  };

  const marcheazaToateCitite = async () => {
    if (!token) return;
    await fetch('/api/notificari/toate-citite', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotificari(prev => prev.map(n => ({ ...n, citita: true })));
  };

  return (
    <NotificareContext.Provider value={{ notificari, necititeCount, marcheazaCitita, marcheazaToateCitite }}>
      {children}
    </NotificareContext.Provider>
  );
}

export function useNotificari() {
  const ctx = useContext(NotificareContext);
  if (!ctx) throw new Error('useNotificari must be used within NotificareProvider');
  return ctx;
}
