import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtHeader } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

// Environment validation
if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw new Error('AUTH0_DOMAIN and AUTH0_AUDIENCE environment variables are required')
}

// Custom claim namespace - make configurable
const CUSTOM_NAMESPACE = process.env.AUTH0_CUSTOM_NAMESPACE || 'https://pocket-stylist.com'

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  requestHeaders: {},
  timeout: 30000,
})

function getKey(header: JwtHeader, callback: (err: any, key?: string) => void) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err)
    }
    const signingKey = key?.getPublicKey()
    callback(null, signingKey)
  })
}

interface DecodedToken {
  sub: string
  email?: string
  [key: string]: any
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided',
    })
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    },
    (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
      if (err || !decoded || typeof decoded === 'string') {
        console.error('JWT verification failed:', err)
        return res.status(403).json({
          error: 'Invalid token',
          message: 'Token verification failed',
        })
      }

      const tokenPayload = decoded as DecodedToken

      req.user = {
        ...tokenPayload,
        sub: tokenPayload.sub,
        email: tokenPayload.email || tokenPayload[`${CUSTOM_NAMESPACE}/email`],
      }

      next()
    }
  )
}

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return next()
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    },
    (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
      if (!err && decoded && typeof decoded !== 'string') {
        const tokenPayload = decoded as DecodedToken
        req.user = {
          ...tokenPayload,
          sub: tokenPayload.sub,
          email: tokenPayload.email || tokenPayload[`${CUSTOM_NAMESPACE}/email`],
        }
      }
      next()
    }
  )
}
