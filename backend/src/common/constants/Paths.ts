
export default {
  Base: '/api',
  Users: {
    Base: '/users',
    Get: '/all',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
  Workflows: {
    Base: '/workflows',
    Get: '/:id',
    Add: '/',
    Update: '/:id',
    Delete: '/:id',
    GetAll: '/',
    Run: '/:id/run',
  },
  NodeDefinitions: {
    Base: '/node-definitions',
    GetAll: '/',
  },
  Folders: {
    Base: '/folders',
    Add: '/',
    Update: '/:id',
    Delete: '/:id',
  },
} as const;
