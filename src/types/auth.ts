export interface User {
  id: string
  email: string
  name?: string
  picture?: string
  nickname?: string
  email_verified?: boolean
  sub: string
  roles?: string[]
  permissions?: string[]
  app_metadata?: {
    role?: string
    subscription?: string
    onboarding_completed?: boolean
    created_via?: string
  }
  user_metadata?: {
    preferences?: {
      language?: string
      currency?: string
      notifications?: {
        email?: boolean
        push?: boolean
      }
    }
  }
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  error: string | null
}

export interface LoginOptions {
  prompt?: 'login' | 'consent' | 'none'
  scope?: string
  audience?: string
  connection?: string
  redirectTo?: string
}

export interface LogoutOptions {
  returnTo?: string
  federated?: boolean
}

export interface AuthConfig {
  domain: string
  clientId: string
  audience?: string
  scope?: string
  redirectUri: string
  logoutUri: string
  additionalParameters?: Record<string, string>
  customParameters?: Record<string, string>
}

export interface AuthError {
  code: string
  message: string
  description?: string
}

export interface SocialConnection {
  name: string
  strategy: 'google-oauth2' | 'apple' | 'facebook' | 'twitter'
  display_name: string
  icon?: string
}

export enum Role {
  USER = 'user',
  PREMIUM_USER = 'premium_user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum Permission {
  READ_OWN_DATA = 'read:own_data',
  WRITE_OWN_DATA = 'write:own_data',
  READ_ALL_DATA = 'read:all_data',
  MANAGE_USERS = 'manage:users',
  SYSTEM_ADMIN = 'system:admin',
}

export interface TokenSet {
  access_token: string
  refresh_token?: string
  id_token: string
  token_type: string
  expires_in: number
  scope?: string
}

export interface RefreshTokenResult {
  accessToken: string
  idToken: string
  expiresIn: number
}
