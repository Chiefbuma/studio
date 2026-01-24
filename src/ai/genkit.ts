'use server';

import { genkit } from 'genkit';

// Initialize Genkit and export the 'ai' object.
// This object can be used to define AI flows, prompts, and tools.
export const ai = genkit({
  plugins: [
    // AI plugins like Google AI would be configured here if needed.
  ],
  // Log level can be 'debug', 'info', 'warn', or 'error'.
  logLevel: 'info',
  // Enable tracing and metrics for observability.
  enableTracingAndMetrics: true,
});
