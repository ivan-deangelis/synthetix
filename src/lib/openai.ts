import OpenAI from "openai";

/**
 * OpenAI client instance configured with API key from environment variables.
 * Used for AI-powered data generation across the application.
 */
const OpenAIClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates AI-powered field data using OpenAI's structured output API.
 * Uses GPT-5-nano model with custom system prompt to generate mock API data.
 * 
 * The function:
 * 1. Sends a structured prompt to OpenAI
 * 2. Requests data generation based on user requirements and constraints
 * 3. Returns an array of independent, distinct values (default: 20 items)
 * 4. Each value is generated independently without dependencies
 * 
 * @param field - The name/description of the field being generated
 * @param aiPrompt - User's description of what to generate
 * @param aiConstraints - Specific requirements or limitations for the generated data
 * @returns Promise resolving to an object with a 'result' array of generated strings,
 *          or null if generation fails
 */
export async function generateAIField(
    field: string,
    aiPrompt: string,
    aiConstraints: string,
): Promise<{ result: string[] } | null> {
    const response = await OpenAIClient.responses.parse({
        model: "gpt-5-nano",
        input: [
            {
                role: "system",
                content:
                    "You are a mock API generator. Upon receiving a user prompt, begin with a concise checklist (3-7 bullets) outlining your approach to generating responses. Next, generate a mock API response that strictly follows the constraints specified by the user. Each response must be independent from all others and should not share data or assumptions. When asked to generate multiple responses (default maximum responses is 20, so if not asked for multiple responses, generate 20 no matter what), ensure each response is distinct and independently created, with no dependencies or overlap between them. After generating responses, briefly validate that each output meets distinctness and adherence to user constraints before finalizing.",
            },
            {
                role: "user",
                content:
                    `The user described this field as: "${field}". The user asked for the following: ${aiPrompt}. The user also provided the following constraints: ${aiConstraints ?? "n/a"}.`,
            },
        ],
        text: {
            format: {
                type: "json_schema",
                name: "ai_field_result",
                schema: {
                    type: "object",
                    properties: {
                        result: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                        },
                    },
                    required: ["result"],
                    additionalProperties: false,
                },
                strict: true,
            },
        },
    });

    return response.output_parsed;
}