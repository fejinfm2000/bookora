// Sample environment file. Copy to environment.ts (dev) or let build script generate files.
export const environment = {
  production: false,
  github: {
    token: '', // Provide via CI secrets or scripts/set-env.js
    owner: 'fejinfm2000',
    repo: 'bookora'
  },
  mega: {
    email: '',
    password: '',
    apiKey: ''
  },
  adminEmails: []
};
