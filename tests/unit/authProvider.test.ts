import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authProvider } from '../../src/providers/authProvider'
import { apiClient } from '../../src/utils/api'
import { getAccessToken, getUser, setAccessToken, setUser } from '../../src/utils/storage'

// Mock the axios client
vi.mock('../../src/utils/api', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

// Mock the storage functions
vi.mock('../../src/utils/storage', () => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  getUser: vi.fn(),
  setUser: vi.fn(),
  clearAuth: vi.fn(),
}))

describe('authProvider', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('login', () => {
    it('should call the API with correct parameters and store the response', async () => {
      // Mock successful login response
      const mockResponse = {
        data: {
          access_token: 'test-token',
          token_type: 'Bearer',
          expires_in: 3600,
          user: {
            user_id: 'user-id',
            email: 'test@example.com',
            roles: ['standard'],
          },
        },
      }

      // Setup the mock
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      // Call the login method
      await authProvider.login({ username: 'test@example.com', password: 'password' })

      // Verify the API was called with correct parameters
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        {
          email: 'test@example.com',
          password: 'password',
        }
      )

      // Verify the token and user were stored
      expect(vi.mocked(setAccessToken)).toHaveBeenCalledWith('test-token')
      expect(vi.mocked(setUser)).toHaveBeenCalledWith(mockResponse.data.user)
    })

    it('should handle login failure', async () => {
      // Mock a failed login
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Invalid credentials'))

      // Call the login method and expect it to reject
      await expect(
        authProvider.login({ username: 'bad@example.com', password: 'wrongpassword' })
      ).rejects.toThrow('Invalid email or password. Please try again.')

      // Verify the API was called
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        {
          email: 'bad@example.com',
          password: 'wrongpassword',
        }
      )
    })
  })

  describe('checkAuth', () => {
    it('should resolve when token exists', async () => {
      // Mock token exists
      vi.mocked(getAccessToken).mockReturnValueOnce('valid-token')

      // Call checkAuth and expect it to resolve
      await expect(authProvider.checkAuth({})).resolves.not.toThrow()

      // Verify getAccessToken was called
      expect(getAccessToken).toHaveBeenCalled()
    })

    it('should reject when no token exists', async () => {
      // Mock no token
      vi.mocked(getAccessToken).mockReturnValueOnce(null)

      // Call checkAuth and expect it to reject
      await expect(authProvider.checkAuth({})).rejects.toThrow('No authentication token found')

      // Verify getAccessToken was called
      expect(getAccessToken).toHaveBeenCalled()
    })
  })

  describe('getPermissions', () => {
    it('should return user roles when user exists', async () => {
      // Mock user exists with roles
      vi.mocked(getUser).mockReturnValueOnce({
        user_id: 'user-id',
        email: 'test@example.com',
        roles: ['tenant_admin'],
      })

      // Call getPermissions and expect it to return roles
      const roles = await authProvider.getPermissions({})
      expect(roles).toEqual(['tenant_admin'])

      // Verify getUser was called
      expect(getUser).toHaveBeenCalled()
    })

    it('should reject when no user exists', async () => {
      // Mock no user
      vi.mocked(getUser).mockReturnValueOnce(null)

      // Call getPermissions and expect it to reject
      await expect(authProvider.getPermissions({})).rejects.toThrow('No user found')

      // Verify getUser was called
      expect(getUser).toHaveBeenCalled()
    })
  })
})