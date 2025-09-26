import { Router } from 'express';
import Paths from '@src/common/constants/Paths';
import WorkflowService from '@src/services/WorkflowService';
import { Folder } from '@src/models/workflow';

const FolderRoutes = Router();

FolderRoutes.post(Paths.Folders.Add, async (req, res) => {
  const { folder } = req.body as { folder: Partial<Folder> };
  const newFolder = await WorkflowService.addFolder(folder);
  return res.status(201).json(newFolder);
});

FolderRoutes.put(Paths.Folders.Update, async (req, res) => {
  const { folder } = req.body as { folder: Partial<Folder> };
  const updatedFolder = await WorkflowService.updateFolder(req.params.id, folder);
  return res.json(updatedFolder);
});

FolderRoutes.delete(Paths.Folders.Delete, async (req, res) => {
  await WorkflowService.deleteFolder(req.params.id);
  return res.sendStatus(200);
});

export default FolderRoutes;