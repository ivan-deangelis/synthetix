import OpenAI from "openai";

/**
 * Lazy-initialized OpenAI client instance.
 * Only instantiated when actually needed to avoid build-time errors.
 */
let openAIClientInstance: OpenAI | null = null;

/**
 * Gets or creates the OpenAI client instance.
 * @throws Error if OPENAI_API_KEY is not set when the client is needed
 */
function getOpenAIClient(): OpenAI {
    if (!openAIClientInstance) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error(
                "Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable."
            );
        }
        openAIClientInstance = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openAIClientInstance;
}

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
    const OpenAIClient = getOpenAIClient();
    
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