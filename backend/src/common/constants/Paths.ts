
export default {
  Base: '/api',
  Auth: {
    Base: '/auth',
  },
  Roles: {
   Base: '/roles',
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
  Users: {
    Base: '/users',
  },
  Config: {
    Base: '/config',
    Root: '/',
    User: '/user',
    Global: '/global',
    NeedsInitialization: '/needs-initialization',
    Initialize: '/initialize',
    IsMultiUser: '/is-multi-user',
  }
} as const;
