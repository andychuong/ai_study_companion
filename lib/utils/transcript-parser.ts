/**
 * Parse and normalize transcript formats
 */

export type TranscriptFormat = 'plain_text' | 'json' | 'csv' | 'markdown';

export interface ParsedTranscript {
  text: string;
  speakers?: Array<{
    name: string;
    text: string;
    timestamp?: string;
  }>;
}

/**
 * Parse transcript based on format
 */
export function parseTranscript(
  transcript: string,
  format: TranscriptFormat
): ParsedTranscript {
  switch (format) {
    case 'plain_text':
      return parsePlainText(transcript);
    case 'json':
      return parseJSON(transcript);
    case 'csv':
      return parseCSV(transcript);
    case 'markdown':
      return parseMarkdown(transcript);
    default:
      return parsePlainText(transcript);
  }
}

function parsePlainText(text: string): ParsedTranscript {
  return {
    text: text.trim(),
  };
}

function parseJSON(text: string): ParsedTranscript {
  try {
    const data = JSON.parse(text);
    if (typeof data === 'string') {
      return { text: data };
    }
    if (data.text) {
      return {
        text: data.text,
        speakers: data.speakers,
      };
    }
    // If it's an array of messages
    if (Array.isArray(data)) {
      const speakers = data.map((item: any) => ({
        name: item.speaker || item.name || 'Unknown',
        text: item.text || item.content || '',
        timestamp: item.timestamp || item.time,
      }));
      return {
        text: speakers.map((s) => `${s.name}: ${s.text}`).join('\n'),
        speakers,
      };
    }
    return { text: JSON.stringify(data) };
  } catch {
    return { text };
  }
}

function parseCSV(text: string): ParsedTranscript {
  const lines = text.split('\n');
  const headers = lines[0]?.split(',').map((h) => h.trim()) || [];
  const speakers: Array<{ name: string; text: string; timestamp?: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]?.split(',').map((v) => v.trim()) || [];
    if (values.length === 0) continue;

    const speakerIndex = headers.indexOf('speaker') >= 0 ? headers.indexOf('speaker') : 0;
    const textIndex = headers.indexOf('text') >= 0 ? headers.indexOf('text') : 1;
    const timestampIndex = headers.indexOf('timestamp') >= 0 ? headers.indexOf('timestamp') : -1;

    speakers.push({
      name: values[speakerIndex] || 'Unknown',
      text: values[textIndex] || '',
      timestamp: timestampIndex >= 0 ? values[timestampIndex] : undefined,
    });
  }

  return {
    text: speakers.map((s) => `${s.name}: ${s.text}`).join('\n'),
    speakers,
  };
}

function parseMarkdown(text: string): ParsedTranscript {
  // Simple markdown parsing - extract text content
  const lines = text.split('\n');
  const speakers: Array<{ name: string; text: string }> = [];
  let currentSpeaker = '';
  let currentText = '';

  for (const line of lines) {
    // Check for speaker markers (e.g., "**Speaker:**" or "### Speaker")
    const speakerMatch = line.match(/(?:^|\*\*)([A-Z][a-z]+)(?:\*\*)?\s*:/);
    if (speakerMatch) {
      if (currentSpeaker && currentText) {
        speakers.push({ name: currentSpeaker, text: currentText.trim() });
      }
      currentSpeaker = speakerMatch[1];
      currentText = line.replace(speakerMatch[0], '').trim();
    } else {
      currentText += (currentText ? ' ' : '') + line.trim();
    }
  }

  if (currentSpeaker && currentText) {
    speakers.push({ name: currentSpeaker, text: currentText.trim() });
  }

  return {
    text: speakers.length > 0
      ? speakers.map((s) => `${s.name}: ${s.text}`).join('\n')
      : text,
    speakers: speakers.length > 0 ? speakers : undefined,
  };
}



