export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow other properties
}
