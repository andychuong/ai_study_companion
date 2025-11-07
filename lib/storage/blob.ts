import { put } from '@vercel/blob';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.warn('BLOB_READ_WRITE_TOKEN is not set. Blob storage will not work.');
}

/**
 * Store transcript in Vercel Blob Storage
 */
export async function storeTranscript(
  sessionId: string,
  transcript: string
): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Return a placeholder URL if blob storage is not configured
    // In production, this should throw an error
    console.warn('Blob storage not configured, skipping storage');
    return `placeholder://transcripts/${sessionId}.txt`;
  }

  try {
    const blob = await put(`transcripts/${sessionId}.txt`, transcript, {
      access: 'private' as any, // Type assertion for Vercel Blob API
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return blob.url;
  } catch (error) {
    console.error('Failed to store transcript in blob storage:', error);
    // Return placeholder URL if storage fails
    return `placeholder://transcripts/${sessionId}.txt`;
  }
}

/**
 * Get transcript from Vercel Blob Storage
 * Note: This requires the blob URL and proper authentication
 */
export async function getTranscript(url: string): Promise<string> {
  if (url.startsWith('placeholder://')) {
    throw new Error('Transcript not stored in blob storage');
  }
  
  // For now, return empty string - implement proper blob retrieval if needed
  // This would require fetching from the blob URL with proper auth
  return '';
}

/**
 * Delete transcript from Vercel Blob Storage
 */
export async function deleteTranscript(url: string): Promise<void> {
  if (url.startsWith('placeholder://')) {
    return; // Nothing to delete
  }
  // Implement deletion if needed
}

