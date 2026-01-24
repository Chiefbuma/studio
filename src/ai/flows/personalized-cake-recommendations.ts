'use server';
/**
 * @fileOverview An AI-powered cake recommender for WhiskeDelights.
 *
 * - recommendCake - A function that takes a user query and returns a cake recommendation.
 * - RecommendCakeInput - The input type for the recommendCake function.
 * - RecommendCakeOutput - The return type for the recommendCake function.
 */

import { ai } from '@/ai/genkit';
import { getCakes } from '@/services/cake-service';
import { z } from 'zod';

const RecommendCakeInputSchema = z.object({
  query: z.string().describe("The user's request or question about cakes."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The conversation history.'),
});
export type RecommendCakeInput = z.infer<typeof RecommendCakeInputSchema>;

const RecommendCakeOutputSchema = z.object({
  recommendation: z.string().describe('A friendly, conversational recommendation for the user.'),
  cakeId: z.string().optional().describe('The ID of the recommended cake, if a specific one is recommended.'),
});
export type RecommendCakeOutput = z.infer<typeof RecommendCakeOutputSchema>;


const recommendationPrompt = ai.definePrompt({
  name: 'recommendationPrompt',
  input: {
    schema: z.object({
      cakes: z.string(),
      query: z.string(),
      history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })).optional(),
    }),
  },
  output: { schema: RecommendCakeOutputSchema },
  prompt: `You are "Dee", a friendly and enthusiastic cake expert for WhiskeDelights, a premium artisan cake shop. Your personality is warm, inviting, and a little bit sweet.

Your goal is to help users find their perfect cake based on their preferences.

You have the following cakes available:
---
{{{cakes}}}
---

Based on the user's query and the conversation history, provide a helpful recommendation.
- If you recommend a specific cake, provide its ID in the \`cakeId\` field.
- If the user is just chatting or you can't recommend a specific cake, you can omit the \`cakeId\`.
- Keep your responses concise and friendly. Use emojis to add personality! 🎂✨

Here is the conversation history (if any):
{{#if history}}
{{#each history}}
{{#if (eq this.role "user")}}
User: {{{this.content}}}
{{/if}}
{{#if (eq this.role "model")}}
Dee: {{{this.content}}}
{{/if}}
{{/each}}
{{/if}}

Current user query: "{{{query}}}"

Your recommendation:`,
});


const recommendCakeFlow = ai.defineFlow(
  {
    name: 'recommendCakeFlow',
    inputSchema: RecommendCakeInputSchema,
    outputSchema: RecommendCakeOutputSchema,
  },
  async (input) => {
    const cakes = await getCakes();
    const cakesWithoutCustom = cakes.filter(c => c.id !== 'custom-cake');

    const result = await recommendationPrompt({
      query: input.query,
      history: input.history,
      cakes: JSON.stringify(cakesWithoutCustom.map(c => ({ id: c.id, name: c.name, description: c.description, category: c.category, base_price: c.base_price })), null, 2),
    });

    return result.output!;
  }
);


export async function recommendCake(input: RecommendCakeInput): Promise<RecommendCakeOutput> {
  return recommendCakeFlow(input);
}
