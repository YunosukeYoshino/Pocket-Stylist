import { Hono } from 'hono'
import { FileController } from '../controllers/fileController'
import { Env } from '../index'

export const fileRoutes = new Hono<{ Bindings: Env }>()

// Initialize controller
let fileController: FileController

fileRoutes.use('*', async (c, next) => {
  if (!fileController) {
    fileController = new FileController(c.env)
  }
  await next()
})

// Upload file
fileRoutes.post('/upload', async (c) => {
  return fileController.uploadFile(c)
})

// Get file by ID
fileRoutes.get('/:id', async (c) => {
  return fileController.getFile(c)
})

// Delete file by ID
fileRoutes.delete('/:id', async (c) => {
  return fileController.deleteFile(c)
})

// Get user files (with optional category filter)
fileRoutes.get('/', async (c) => {
  return fileController.getUserFiles(c)
})