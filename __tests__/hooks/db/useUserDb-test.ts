import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserDb } from '@/hooks/db/useUserDb';
import { db } from '@/database/db';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

// Mock de la base de datos
jest.mock('@/database/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis()
  }
}));

// Mock del esquema
jest.mock('@/database/schema', () => ({
  users: {
    id: 'id'
  }
}));

// Mock de drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn()
}));

describe('useUserDb Hook', () => {
  const mockUsers = [
    { id: 'user1', name: 'John Doe', avatar: 'avatar1.jpg', status: 'online' },
    { id: 'user2', name: 'Jane Smith', avatar: 'avatar2.jpg', status: 'offline' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    
    // Configurar el mock para devolver usuarios por defecto
    (db.select().from as jest.Mock).mockImplementation(() => Promise.resolve(mockUsers));
  });

  it('should initialize with default values', async () => {
    const { result } = renderHook(() => useUserDb());
    
    expect(result.current.currentUser).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.loading).toBe(true);
    
    // Espera a que la actualización asíncrona ocurra
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users).toEqual(mockUsers);
  });

});