/**
 * NPM Registry Client
 *
 * Fetches package metadata from npm registry
 */

import https from 'https';

/**
 * Fetch latest version from npm registry
 */
export async function getLatestVersion(packageName: string): Promise<string | null> {
  return new Promise((resolve) => {
    const url = `https://registry.npmjs.org/${packageName}`;

    https
      .get(url, (res) => {
        let data = '';

        // Collect response data
        res.on('data', (chunk) => {
          data += chunk;
        });

        // Parse response
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const packageData = JSON.parse(data);
              const latestVersion = packageData['dist-tags']?.latest;
              resolve(latestVersion || null);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        });
      })
      .on('error', () => {
        resolve(null);
      })
      .setTimeout(5000, () => {
        resolve(null);
      });
  });
}
