/**
 * Check Inngest Setup Script
 * 
 * This script verifies that Inngest is properly configured and accessible.
 * 
 * Usage:
 *   npx tsx scripts/check-inngest.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envPaths = ['.env.local', '.env'];
for (const envPath of envPaths) {
  const result = config({ path: resolve(process.cwd(), envPath) });
  if (!result.error) {
    console.log(`✅ Loaded environment from ${envPath}`);
    break;
  }
}

async function checkInngest() {
  console.log('\n🔍 Checking Inngest Setup...\n');

  // Check environment variables
  const eventKey = process.env.INNGEST_EVENT_KEY;
  const signingKey = process.env.INNGEST_SIGNING_KEY;

  if (eventKey) {
    console.log('✅ INNGEST_EVENT_KEY is set');
    if (eventKey.startsWith('event_')) {
      console.log('   → Using Inngest Cloud (production)');
    } else {
      console.log('   → Using local dev server');
    }
  } else {
    console.log('⚠️  INNGEST_EVENT_KEY is not set');
    console.log('   → Will use local dev server (run: npm run inngest:dev)');
  }

  if (signingKey) {
    console.log('✅ INNGEST_SIGNING_KEY is set');
  } else {
    console.log('⚠️  INNGEST_SIGNING_KEY is not set (optional for local dev)');
  }

  // Check if Inngest endpoint is accessible
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  const inngestUrl = `${appUrl}/api/inngest`;

  console.log(`\n🌐 Checking Inngest endpoint: ${inngestUrl}`);

  try {
    const response = await fetch(inngestUrl);
    
    if (response.status === 503) {
      console.log('❌ Inngest endpoint returned 503');
      console.log('   → Inngest is not configured or dev server is not running');
      console.log('   → Run: npm run inngest:dev');
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ Inngest endpoint is accessible');
      
      if (data.functions && Array.isArray(data.functions)) {
        console.log(`   → Found ${data.functions.length} registered functions:`);
        data.functions.forEach((fn: any) => {
          console.log(`     - ${fn.name || fn.id}`);
        });
      }
    } else {
      console.log(`⚠️  Inngest endpoint returned ${response.status}`);
    }
  } catch (error: any) {
    console.log('❌ Could not reach Inngest endpoint');
    console.log(`   → Error: ${error.message}`);
    console.log('   → Make sure your Next.js app is running');
    console.log('   → Run: npm run dev');
  }

  // Check if local dev server is running
  console.log('\n🔍 Checking local Inngest dev server...');
  try {
    const devServerResponse = await fetch('http://localhost:8288');
    if (devServerResponse.ok) {
      console.log('✅ Inngest dev server is running on http://localhost:8288');
      console.log('   → Dashboard: http://localhost:8288');
    }
  } catch (error) {
    console.log('⚠️  Inngest dev server is not running');
    console.log('   → To start: npm run inngest:dev');
  }

  console.log('\n📚 Next Steps:');
  if (!eventKey) {
    console.log('   1. For local dev: npm run inngest:dev');
    console.log('   2. For production: Sign up at https://www.inngest.com');
    console.log('   3. Add INNGEST_EVENT_KEY to .env.local');
  } else {
    console.log('   ✅ Inngest is configured!');
    console.log('   → Test by uploading a transcript or generating practice');
  }
  console.log('');
}

checkInngest().catch((error) => {
  console.error('❌ Error checking Inngest:', error);
  process.exit(1);
});

