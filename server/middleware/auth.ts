import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  requestHeaders: {},
  timeout: 30000,
})

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err)
    }
    const signingKey = key?.getPublicKey()
    callback(null, signingKey)
  })
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

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
    (err: any, decoded: any) => {
      if (err) {
        console.error('JWT verification failed:', err)
        return res.status(403).json({
          error: 'Invalid token',
          message: 'Token verification failed',
        })
      }

      req.user = {
        sub: decoded.sub,
        email: decoded.email || decoded['https://pocket-stylist.com/email'],
        ...decoded,
      }

      next()
    }
  )
}

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

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
    (err: any, decoded: any) => {
      if (!err && decoded) {
        req.user = {
          sub: decoded.sub,
          email: decoded.email || decoded['https://pocket-stylist.com/email'],
          ...decoded,
        }
      }
      next()
    }
  )
}
