import OpenAI from "openai";

const OpenAIClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
