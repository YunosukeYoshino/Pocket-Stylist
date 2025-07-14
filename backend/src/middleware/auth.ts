import { Context, Next } from 'hono'
import { Env } from '../index'

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  try {
    const authorization = c.req.header('Authorization')
    
    if (!authorization) {
      return c.json({ error: 'Authorization header required' }, 401)
    }
    
    const token = authorization.replace('Bearer ', '')
    
    if (!token) {
      return c.json({ error: 'Bearer token required' }, 401)
    }
    
    // Verify JWT token with Auth0
    const response = await fetch(`https://${c.env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      return c.json({ error: 'Invalid token' }, 401)
    }
    
    const user = await response.json()
    
    // Store user info in context
    c.set('user', user)
    
    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({ error: 'Authentication failed' }, 401)
  }
}