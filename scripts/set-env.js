const fs = require('fs');
const path = require('path');

// Pull variables from process.env (Netlify)
const token = process.env.GITHUB_TOKEN || '';
const owner = process.env.REPO_OWNER || 'fejinfm2000';
const repo = process.env.REPO_NAME || 'bookora';
const megaEmail = process.env.MEGA_EMAIL || '';
const megaPassword = process.env.MEGA_PASSWORD || '';
const megaApiKey = process.env.MEGA_APIKEY || '';
const adminEmailsEnv = process.env.ADMIN_EMAILS || 'fejinfm2000@gmail.com';
const adminEmails = adminEmailsEnv.split(',').map(e => e.trim()).filter(Boolean);

const targetPath = path.join(__dirname, '../src/environments/environment.prod.ts');
const targetPathDev = path.join(__dirname, '../src/environments/environment.ts');

const adminEmailsArrayLiteral = `[${adminEmails.map(e => `'${e.replace(/'/g, "\\'")}'`).join(', ')}]`;

const envFileContent = `export const environment = {
  production: true,
  github: {
    token: '${token}',
    owner: '${owner}',
    repo: '${repo}'
  },
  mega: {
    email: '${megaEmail}',
    password: '${megaPassword}',
    apiKey: '${megaApiKey}'
  },
  adminEmails: ${adminEmailsArrayLiteral}
};
`;

// Write to both just to be safe for whichever build config is used
// But primarily prod.

console.log(`Writing environment variables to ${targetPath}`);
fs.writeFileSync(targetPath, envFileContent);

// Also write to dev if we want (optional, but good for local verify if env vars set)
if (process.env.GITHUB_TOKEN) {
    console.log(`Writing environment variables to ${targetPathDev}`);
    fs.writeFileSync(targetPathDev, envFileContent.replace('production: true', 'production: false'));
}
