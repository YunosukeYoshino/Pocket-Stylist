import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

export async function errorHandler(c: Context, next: Next) {
  try {
    await next()
  } catch (error) {
    console.error('Error:', error)
    
    if (error instanceof HTTPException) {
      return c.json(
        { error: error.message },
        error.status
      )
    }
    
    if (error instanceof Error) {
      return c.json(
        { error: error.message },
        500
      )
    }
    
    return c.json(
      { error: 'Internal server error' },
      500
    )
  }
}