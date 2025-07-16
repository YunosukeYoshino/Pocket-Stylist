import { Hono } from 'hono'
import { FileController } from '../controllers/fileController'
import type { Env } from '../index'

export const fileRoutes = new Hono<{ Bindings: Env }>()

// Initialize controller factory to create controllers per environment
const createFileController = (env: Env) => {
  let instance: FileController | null = null
  return () => {
    if (!instance) {
      instance = new FileController(env)
    }
    return instance
  }
}

fileRoutes.use('*', async (c, next) => {
  const getController = createFileController(c.env)
  c.set('fileController', getController())
  await next()
})

// Upload file
fileRoutes.post('/upload', async (c) => {
  const controller = c.get('fileController') as FileController
  return controller.uploadFile(c)
})

// Get file by ID
fileRoutes.get('/:id', async (c) => {
  const controller = c.get('fileController') as FileController
  return controller.getFile(c)
})

// Delete file by ID
fileRoutes.delete('/:id', async (c) => {
  const controller = c.get('fileController') as FileController
  return controller.deleteFile(c)
})

// Get user files (with optional category filter)
fileRoutes.get('/', async (c) => {
  const controller = c.get('fileController') as FileController
  return controller.getUserFiles(c)
})