import type { TreeNode } from '@/components/molecules/types';
import type { Folder, Workflow } from '@/types/workflow';

/**
 * Converts a flat list of items with path-like keys into a tree structure.
 *
 * @param items The flat list of items.
 * @param getKey A function to get the path-like key from an item (e.g., 'math/add').
 * @param getLabel A function to get the display label for a node.
 * @returns An array of root TreeNode objects.
 */
export function buildTreeFromPath<T>(
  items: T[],
  getKey: (item: T) => string,
  getLabel: (item: T, part: string) => string
): TreeNode[] {
  const root: TreeNode = { id: 'root', label: 'root', children: [] };
  const nodeMap = new Map<string, TreeNode>();
  nodeMap.set('root', root);

  items.forEach(item => {
    const key = getKey(item);
    const parts = key.split('/');
    let currentPath = '';
    let parentNode = root;

    parts.forEach((part, index) => {
      const isLastPart = index === parts.length - 1;
      const oldPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let currentNode = nodeMap.get(currentPath);

      if (!currentNode) {
        if (isLastPart) {
          // It's a leaf node (the actual item)
          currentNode = {
            id: key,
            label: getLabel(item, part),
            ...item
          };
        } else {
          // It's a directory node
          currentNode = {
            id: currentPath,
            label: part,
            children: []
          };
        }

        const parentId = oldPath || 'root';
        parentNode = nodeMap.get(parentId)!;
        parentNode.children!.push(currentNode);
        nodeMap.set(currentPath, currentNode);
      }
      parentNode = currentNode;
    });
  });

  return root.children || [];
}


/**
 * Converts the Folder[] structure from the API into the TreeNode[] structure for the UI.
 * @param folders The array of Folder objects from the backend.
 * @returns An array of TreeNode objects.
 */
export function convertFoldersToTreeNodes(folders: Folder[]): TreeNode[] {
  return folders.map(folder => {
    // Convert workflows in the current folder
    const workflowNodes: TreeNode[] = (folder.workflows || []).map((workflow: Workflow) => {
      const { id, name, ...rest } = workflow;
      return {
        id: id!,
        label: name!,
        // Add the rest of the workflow object for later use
        ...rest,
      }
    });

    // Recursively convert child folders and get their nodes
    const childrenNodes: TreeNode[] = folder.children ? convertFoldersToTreeNodes(folder.children) : [];

    return {
      id: folder.id!,
      label: folder.name!,
      children: [...childrenNodes, ...workflowNodes], // Combine folders and workflows
      isFolder: true, // Custom property to identify folders
    };
  });
}
