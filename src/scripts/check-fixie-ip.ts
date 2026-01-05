
import { ProxyAgent, fetch } from 'undici';
import * as dotenv from 'dotenv';
import path from 'path';

// Try to load from .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function checkIp() {
    const fixieUrl = process.env.FIXIE_URL;

    if (!fixieUrl) {
        console.error('❌ FIXIE_URL environment variable is not set.');
        console.error('Please make sure you have pulled your Vercel environment variables or set FIXIE_URL in .env.local');
        process.exit(1);
    }

    console.log('Using FIXIE_URL:', fixieUrl.replace(/:[^:]*@/, ':****@')); // Mask password

    try {
        const client = new ProxyAgent(fixieUrl);

        console.log('Fetching IP address through proxy...');
        const response = await fetch('https://api.ipify.org?format=json', {
            dispatcher: client
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch IP: ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        console.log('\n✅ Your Fixie Static IP Address is:');
        console.log(`\x1b[32m${data.ip}\x1b[0m`);
        console.log('\nPlease whitelist this IP in your Lenco Dashboard.');

    } catch (error) {
        console.error('❌ Error fetching IP:', error);
    }
}

checkIp();
