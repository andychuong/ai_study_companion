/**
 * Test Inngest Integration Script
 * 
 * This script sends a test event to Inngest to verify the integration is working.
 * 
 * Usage:
 *   npx tsx scripts/test-inngest.ts
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

async function testInngest() {
  console.log('\n🧪 Testing Inngest Integration...\n');

  // Test 1: Send transcript.uploaded event
  console.log('📤 Sending test event: transcript.uploaded');
  
  const eventPayload = {
    name: 'transcript.uploaded',
    data: {
      sessionId: 'test-session-' + Date.now(),
      studentId: 'test-student-123',
      transcript: 'Today we discussed algebra and quadratic equations. The student showed good understanding of factoring but struggled with the quadratic formula. We practiced several problems together.',
      transcriptUrl: 'https://example.com/transcript',
    },
  };

  try {
    // Send event to Inngest dev server
    const response = await fetch('http://localhost:8288/api/inngest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [eventPayload],
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Event sent successfully!');
      console.log('   Response:', JSON.stringify(result, null, 2));
      console.log('\n📊 Check the Inngest dashboard at http://localhost:8288/runs to see the job execute');
    } else {
      const error = await response.text();
      console.log('❌ Failed to send event');
      console.log('   Status:', response.status);
      console.log('   Error:', error);
    }
  } catch (error: any) {
    console.log('❌ Error sending event:', error.message);
    console.log('   Make sure Inngest dev server is running: npm run inngest:dev');
  }

  console.log('\n✅ Test complete!\n');
}

testInngest().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

