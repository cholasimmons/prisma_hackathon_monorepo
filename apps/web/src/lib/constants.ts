const mono_config = {
  app: {
    name: 'Plates',
    description: 'Crowd-sourced Vehicle Database database',
    lastUpdated: new Date().toISOString(),
    version: '0.1.0',
    email: 'apps@simmons.studio'
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
  credit: {
    author: 'Simmons Multimedia',
    year: new Date().getFullYear(),
    url: 'https://simmons.studio',
    email: 'info@simmons.studio'
  },
  defaultAvatar: '/images/default-avatar.png',
};

export default mono_config;