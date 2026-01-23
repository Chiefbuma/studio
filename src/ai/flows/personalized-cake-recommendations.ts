'use server';
/**
 * @fileOverview AI-powered cake recommendation flow based on user order history.
 *
 * - personalizedCakeRecommendations - A function that generates personalized cake recommendations.
 * - PersonalizedCakeRecommendationsInput - The input type for the personalizedCakeRecommendations function.
 * - PersonalizedCakeRecommendationsOutput - The return type for the personalizedCakeRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedCakeRecommendationsInputSchema = z.object({
  userOrderHistory: z.string().describe('The user\'s past cake order history, as a JSON string.'),
});
export type PersonalizedCakeRecommendationsInput = z.infer<typeof PersonalizedCakeRecommendationsInputSchema>;

const PersonalizedCakeRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('An array of cake names recommended for the user.'),
});
export type PersonalizedCakeRecommendationsOutput = z.infer<typeof PersonalizedCakeRecommendationsOutputSchema>;

export async function personalizedCakeRecommendations(
  input: PersonalizedCakeRecommendationsInput
): Promise<PersonalizedCakeRecommendationsOutput> {
  return personalizedCakeRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedCakeRecommendationsPrompt',
  input: {schema: PersonalizedCakeRecommendationsInputSchema},
  output: {schema: PersonalizedCakeRecommendationsOutputSchema},
  prompt: `You are a cake recommendation expert. Based on the user\'s past order history, recommend 3 cakes that they might enjoy.

User Order History:
{{{userOrderHistory}}}

Recommendations:
`,
});

const personalizedCakeRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedCakeRecommendationsFlow',
    inputSchema: PersonalizedCakeRecommendationsInputSchema,
    outputSchema: PersonalizedCakeRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
