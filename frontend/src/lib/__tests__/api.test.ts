import {
  register,
  login,
  logout,
  fetchTransactions,
  createTransaction,
  fetchGoals,
  createGoal,
  updateGoal,
  checkHealth,
} from '../api';

// Mock fetch globally
const mockFetch = jest.fn() as jest.Mock;
(global as any).fetch = mockFetch;

describe('API Functions', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();

    // Reset URL before each test
    // jsdom allows assigning to window.location.href, but it won't
    // actually navigate – that's fine, we just want a clean value.
    window.location.href = 'http://localhost/';
  });

  // ---------- Auth API ----------

  describe('Auth API', () => {
    const testUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
    };

    test('register should make a POST request to register endpoint', async () => {
      const mockResponse = {
        success: true,
        token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await register(testUser);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser),
          credentials: 'include',
        }
      );
      expect(result).toEqual(mockResponse);
    });

    test('login should make a POST request to login endpoint', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        success: true,
        token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await login(credentials);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(credentials),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    test('logout should make a GET request to logout endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await logout();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/auth/logout',
        {
          method: 'GET',
          credentials: 'include',
        }
      );
    });
  });

  // ---------- Transaction API ----------

  describe('Transaction API', () => {
    test('fetchTransactions should make a GET request with query params', async () => {
      const mockTransactions = [
        {
          id: '1',
          date: '2025-01-01',
          amount: 100,
          category: 'Food',
          source: 'manual',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransactions),
      });

      const from = '2025-01-01';
      const to = '2025-01-31';
      const result = await fetchTransactions(from, to);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions?from=2025-01-01&to=2025-01-31'
      );
      expect(result).toEqual(mockTransactions);
    });

    test('createTransaction should make a POST request with transaction data', async () => {
      const newTransaction = {
        date: '2025-01-01',
        amount: 100,
        category: 'Food',
        source: 'manual' as const,
      };

      const mockResponse = { ...newTransaction, id: '1' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createTransaction(newTransaction);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transactions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTransaction),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ---------- Goals API ----------

  describe('Goals API', () => {
    test('fetchGoals should make a GET request to goals endpoint', async () => {
      const mockGoals = [
        {
          id: '1',
          category: 'Food',
          targetAmount: 500,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          period: 'monthly',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGoals),
      });

      const result = await fetchGoals();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/goals'
      );
      expect(result).toEqual(mockGoals);
    });

    test('createGoal should make a POST request with goal data', async () => {
      const newGoal = {
        category: 'Shopping',
        targetAmount: 1000,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        period: 'monthly' as const,
      };

      const mockResponse = {
        ...newGoal,
        id: '1',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createGoal(newGoal);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/goals',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGoal),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ---------- Error Handling ----------

  describe('Error Handling', () => {
    test('should handle 401 unauthorized error (rejects with message)', async () => {
      const errorMessage = 'Unauthorized';

      // Silence jsdom's "navigation not implemented" noise for this test
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: errorMessage }),
      });

      // We assert that the promise rejects with the right message.
      // jsdom's navigation quirks make checking window.location.href unreliable.
      await expect(
        login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toEqual(errorMessage);

      consoleErrorSpy.mockRestore();
    });

    test('should handle network errors', async () => {
      const errorMessage = 'Network error';

      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow(errorMessage);
    });
  });
});
