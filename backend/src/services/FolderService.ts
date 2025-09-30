import { PrismaClient, Folder } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Creates a new folder.
 * @param name - The name of the new folder.
 * @param parentId - The ID of the parent folder (optional).
 * @returns The newly created folder.
 */
async function create(name: string, parentId?: string): Promise<Folder> {
  // If the parentId is our virtual root, treat it as a root-level creation (parentId = null).
  const effectiveParentId = parentId === '__root__' ? undefined : parentId;

  // Use Prisma's 'connect' syntax for safer relation handling.
  const newFolder = await prisma.folder.create({
    data: {
      name,
      ...(effectiveParentId && { parent: { connect: { id: effectiveParentId } } }),
    },
  });
  return newFolder;
}

/**
 * Deletes a folder and all its contents (workflows and sub-folders).
 * @param id - The ID of the folder to delete.
 */
async function deleteFolder(id: string): Promise<void> {
  // We need to implement recursive deletion or handle cascading in the schema.
  // For now, let's assume we can delete a folder if it's empty.
  // A full implementation would require deleting all child workflows and folders.
  
  // First, check if the folder has children or workflows.
  const folder = await prisma.folder.findUnique({
    where: { id },
    include: { children: true, workflows: true },
  });

  if (!folder) {
    throw new Error('Folder not found');
  }

  if (folder.children.length > 0 || folder.workflows.length > 0) {
    // For now, prevent deletion of non-empty folders.
    // A more robust implementation would recursively delete.
    throw new Error('Cannot delete a non-empty folder.');
  }

  await prisma.folder.delete({
    where: { id },
  });
}


export default {
  create,
  delete: deleteFolder,
} as const;