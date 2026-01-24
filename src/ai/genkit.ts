'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit and export the 'ai' object.
// This object is used throughout the application to define AI flows, prompts, and tools.
export const ai = genkit({
  plugins: [
    // The Google AI plugin is used to connect to models like Gemini.
    // It will only be enabled if the GEMINI_API_KEY environment variable is set.
    process.env.GEMINI_API_KEY ? googleAI() : [],
  ],
  // Log level can be 'debug', 'info', 'warn', or 'error'.
  logLevel: 'info',
  // Enable tracing and metrics for observability.
  enableTracingAndMetrics: true,
});
