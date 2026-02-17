const fs = require('fs');
const path = require('path');
const https = require('https');

async function main() {
  const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
  if (!fs.existsSync(envPath)) {
    console.error('environment.ts not found at', envPath);
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');

  const githubMatch = content.match(/github:\s*\{\s*token:\s*'([^']*)',\s*owner:\s*'([^']*)',\s*repo:\s*'([^']*)'\s*\}/s);
  const megaMatch = content.match(/mega:\s*\{\s*email:\s*'([^']*)',\s*password:\s*'([^']*)',\s*apiKey:\s*'([^']*)'\s*\}/s);

  if (!githubMatch || !megaMatch) {
    console.error('Failed to parse credentials from environment.ts');
    process.exit(1);
  }

  const githubToken = githubMatch[1];
  const repoOwner = githubMatch[2];
  const repoName = githubMatch[3];

  const megaEmail = megaMatch[1];
  const megaPassword = megaMatch[2];

  if (!megaEmail || !megaPassword) {
    console.error('Mega credentials missing in environment.ts');
    process.exit(1);
  }

  console.log('Parsed credentials. Owner:', repoOwner, 'Repo:', repoName);

  // Upload a small text file to Mega
  try {
    const { Storage } = require('megajs');

    console.log('Logging into Mega...');
    const storage = await new Storage({ email: megaEmail, password: megaPassword }).ready;

    const filename = `bookora_test_upload_${Date.now()}.txt`;
    const data = `Bookora test upload at ${new Date().toISOString()}`;
    const buffer = Buffer.from(data, 'utf8');

    console.log('Uploading to Mega as', filename);
    const uploaded = await storage.upload({ name: filename, size: buffer.length }, buffer).complete;
    const link = await uploaded.link();

    console.log('Mega upload completed. Link:', link);

    // Prepare JSON to save to GitHub
    const filePath = 'src/assets/data/test_megajs_result.json';
    const payload = {
      uploadedAt: new Date().toISOString(),
      filename,
      link
    };

    const body = JSON.stringify({ message: 'Test: save Mega upload result', content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64') });

    const putPath = `/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    const options = {
      hostname: 'api.github.com',
      path: putPath,
      method: 'PUT',
      headers: {
        'User-Agent': 'bookora-test-script',
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    console.log('Saving result to GitHub at', filePath);

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let resp = '';
        res.on('data', (d) => (resp += d));
        res.on('end', () => {
          if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
            console.error('GitHub API error', res.statusCode, resp);
            return reject(new Error('GitHub API error: ' + res.statusCode));
          }
          console.log('Saved result to GitHub. Response:', resp.substring(0, 200));
          resolve();
        });
      });
      req.on('error', (e) => reject(e));
      req.write(body);
      req.end();
    });

    console.log('Test completed successfully.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

main();
