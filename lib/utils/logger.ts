type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMetadata {
  [key: string]: any;
}

export function log(level: LogLevel, message: string, metadata?: LogMetadata) {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  const logString = JSON.stringify(logEntry);

  switch (level) {
    case 'error':
      console.error(logString);
      break;
    case 'warn':
      console.warn(logString);
      break;
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.debug(logString);
      }
      break;
    default:
      console.log(logString);
  }
}

export const logger = {
  info: (message: string, metadata?: LogMetadata) => log('info', message, metadata),
  warn: (message: string, metadata?: LogMetadata) => log('warn', message, metadata),
  error: (message: string, metadata?: LogMetadata) => log('error', message, metadata),
  debug: (message: string, metadata?: LogMetadata) => log('debug', message, metadata),
};




