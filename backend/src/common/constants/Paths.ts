
export default {
  Base: '/api',
  Auth: {
    Base: '/auth',
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
