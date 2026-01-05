
const { ProxyAgent, fetch } = require('undici');
const path = require('path');
const fs = require('fs');

// Simple dotenv parser to avoid dependency issues if dotenv isn't installed/linked correctly for this script context
function loadEnv(filePath) {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

loadEnv(path.resolve(process.cwd(), '.env.local'));
loadEnv(path.resolve(process.cwd(), '.env'));

async function checkIp() {
    const fixieUrl = process.argv[2] || process.env.FIXIE_URL;

    if (!fixieUrl) {
        console.error('❌ FIXIE_URL environment variable is not set.');
        process.exit(1);
    }

    console.log('Using FIXIE_URL:', fixieUrl.replace(/:[^:]*@/, ':****@'));

    try {
        const client = new ProxyAgent(fixieUrl);

        console.log('Fetching IP address through proxy...');
        // Using httpbin or ipify
        const response = await fetch('https://api.ipify.org?format=json', {
            dispatcher: client
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch IP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('\n✅ Your Fixie Static IP Address is:');
        console.log(data.ip);
        console.log('\nPlease whitelist this IP in your Lenco Dashboard.');

    } catch (error) {
        console.error('❌ Error fetching IP:', error);
    }
}

checkIp();
