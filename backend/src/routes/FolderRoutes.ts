import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import FolderService from '@src/services/FolderService';

const router = Router();

// --- Routes ---

/**
 * @swagger
 * /api/folders:
 *   post:
 *     tags: [Folders]
 *     summary: Create a new folder
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created folder.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 */
router.post('/', async (req, res, next) => {
  const { name, parentId } = req.body;

  if (!name) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Folder name is required.' });
  }

  try {
    const newFolder = await FolderService.create(name, parentId);
    return res.status(StatusCodes.CREATED).json(newFolder);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/folders/{id}:
 *   delete:
 *     tags: [Folders]
 *     summary: Delete a folder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Folder deleted successfully.
 *       404:
 *         description: Folder not found.
 *       409:
 *         description: Cannot delete a non-empty folder.
 */
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    await FolderService.delete(id);
    return res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    // A bit of error handling to give a more specific response
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
    }
     if (error instanceof Error && error.message.includes('non-empty')) {
      return res.status(StatusCodes.CONFLICT).json({ error: error.message });
    }
    next(error);
  }
});


export default router;