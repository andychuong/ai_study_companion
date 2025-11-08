/**
 * Check Pinecone Setup Script
 * 
 * This script verifies that Pinecone is properly configured and accessible.
 * 
 * Usage:
 *   npx tsx scripts/check-pinecone.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { Pinecone } from '@pinecone-database/pinecone';

// Load environment variables
const envPaths = ['.env.local', '.env'];
for (const envPath of envPaths) {
  const result = config({ path: resolve(process.cwd(), envPath) });
  if (!result.error) {
    console.log(`✅ Loaded environment from ${envPath}`);
    break;
  }
}

async function checkPinecone() {
  console.log('\n🔍 Checking Pinecone Setup...\n');

  // Check environment variables
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME || 'study-companion';

  if (apiKey) {
    console.log('✅ PINECONE_API_KEY is set');
    console.log(`   Key prefix: ${apiKey.substring(0, 10)}...`);
  } else {
    console.log('❌ PINECONE_API_KEY is not set');
    console.log('   → Add PINECONE_API_KEY to your environment variables');
    return;
  }

  if (indexName) {
    console.log(`✅ PINECONE_INDEX_NAME is set: ${indexName}`);
  } else {
    console.log(`⚠️  PINECONE_INDEX_NAME not set, using default: ${indexName}`);
  }

  // Test Pinecone connection
  console.log('\n🌐 Testing Pinecone connection...');
  
  try {
    // Pinecone v2+ only needs API key, no environment needed
    // Use type assertion to match the actual client implementation
    const pinecone = new Pinecone({
      apiKey: apiKey,
    } as any);

    console.log('✅ Pinecone client initialized');

    // List indexes
    console.log('\n📋 Listing Pinecone indexes...');
    const indexesResponse = await pinecone.listIndexes();
    
    // Pinecone SDK returns an array directly or an object with indexes property
    const indexes = Array.isArray(indexesResponse) ? indexesResponse : (indexesResponse as any).indexes || [];
    
    console.log(`   Found ${indexes.length || 0} index(es):`);
    if (indexes && indexes.length > 0) {
      indexes.forEach((idx: any) => {
        const idxName = idx.name || idx;
        const isTarget = idxName === indexName;
        console.log(`   ${isTarget ? '✅' : '  '} ${idxName}${isTarget ? ' (target)' : ''}`);
      });
    } else {
      console.log('   No indexes found');
    }

    // Check if target index exists
    const targetIndex = indexes.find((idx: any) => {
      const idxName = idx.name || idx;
      return idxName === indexName;
    });
    
    if (!targetIndex) {
      console.log(`\n❌ Index "${indexName}" not found!`);
      console.log('   → Create the index in Pinecone Console: https://app.pinecone.io/');
      console.log(`   → Index name should be: ${indexName}`);
      return;
    }

    console.log(`\n✅ Index "${indexName}" exists`);

    // Test index connection
    console.log(`\n🔗 Testing connection to index "${indexName}"...`);
    const index = pinecone.index(indexName);
    
    // Get index stats
    try {
      const stats = await index.describeIndexStats();
      console.log('✅ Successfully connected to index');
      // Pinecone SDK uses totalRecordCount, not totalVectorCount
      const totalRecords = (stats as any).totalRecordCount || (stats as any).totalVectorCount || 0;
      console.log(`   Total vectors: ${totalRecords}`);
      console.log(`   Dimension: ${(stats as any).dimension || 'unknown'}`);
      console.log(`   Index fullness: ${(stats as any).indexFullness || 'unknown'}`);
    } catch (error: any) {
      console.log(`❌ Failed to get index stats: ${error.message}`);
      return;
    }

    // Test upsert (with a small test vector)
    console.log(`\n🧪 Testing vector upsert...`);
    try {
      const testVector = {
        id: `test-${Date.now()}`,
        values: new Array(1536).fill(0).map(() => Math.random()),
        metadata: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      };

      await index.upsert([testVector]);
      console.log('✅ Successfully upserted test vector');

      // Test query
      console.log(`\n🔍 Testing vector query...`);
      const queryResult = await index.query({
        vector: testVector.values,
        topK: 1,
        includeMetadata: true,
      });

      if (queryResult.matches && queryResult.matches.length > 0) {
        console.log('✅ Successfully queried vectors');
        console.log(`   Found ${queryResult.matches.length} match(es)`);
      } else {
        console.log('⚠️  Query returned no matches (this might be normal)');
      }

      // Clean up test vector
      console.log(`\n🧹 Cleaning up test vector...`);
      await index.deleteOne(testVector.id);
      console.log('✅ Test vector deleted');

    } catch (error: any) {
      console.log(`❌ Failed to test upsert/query: ${error.message}`);
      if (error.message.includes('dimension')) {
        console.log('   → Check that the index dimension matches your embeddings (should be 1536 for text-embedding-3-large)');
      }
      return;
    }

    console.log('\n✅ Pinecone is configured correctly!');
    console.log('\n📚 Next Steps:');
    console.log('   → Pinecone is ready to use');
    console.log('   → Transcript analysis will store vectors in Pinecone');
    console.log('   → RAG features will work in chat');

  } catch (error: any) {
    console.log(`\n❌ Error checking Pinecone: ${error.message}`);
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('   → Invalid API key. Check your PINECONE_API_KEY');
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
      console.log(`   → Index "${indexName}" not found. Create it in Pinecone Console`);
    } else {
      console.log(`   → Error: ${error.message}`);
    }
  }

  console.log('');
}

checkPinecone().catch((error) => {
  console.error('❌ Error checking Pinecone:', error);
  process.exit(1);
});

