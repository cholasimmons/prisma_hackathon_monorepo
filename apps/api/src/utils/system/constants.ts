const mono_config = {
  app: {
    name: 'Plates',
    description: 'Crowd-sourced Vehicle Database database',
    lastUpdated: new Date().toISOString(),
    version: '0.1.0',
  },
  auth: {
    email: {
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 48,
    },
    password: {
      minLength: 6,
      maxLength: 24,
      requireUppercase: false,
      requireLowercase: false,
      requireNumber: false,
      requireSpecialChar: false,
    }
  },
  defaultAvatar: '/images/default-avatar.png',
};

export default mono_config;