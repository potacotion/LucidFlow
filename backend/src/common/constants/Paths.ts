
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
    // [新增] 用于外部 SDK/API 触发工作流
    Trigger: '/:id/trigger',
  },
  NodeDefinitions: {
    Base: '/node-definitions',
    GetAll: '/',
  },
  AllNodeDefinitions: {
    Base: '/all-node-definitions',
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
