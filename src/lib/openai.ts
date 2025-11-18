import OpenAI from "openai";
import { generateFakerField } from "./faker";

/**
 * Lazy-initialized OpenAI client instance.
 * Only instantiated when actually needed to avoid build-time errors.
 */
let openAIClientInstance: OpenAI | null = null;

/**
 * Maps common field names to appropriate faker methods.
 * Used as fallback when OpenAI API is not available.
 */
const FAKER_FIELD_MAPPING: Record<string, string> = {
    // Personal information
    name: "faker.person.fullName",
    firstname: "faker.person.firstName",
    lastname: "faker.person.lastName",
    username: "faker.internet.username",
    email: "faker.internet.email",
    phone: "faker.phone.number",
    age: "faker.number.int",
    bio: "faker.person.bio",
    avatar: "faker.image.avatar",
    
    // Address
    address: "faker.location.streetAddress",
    city: "faker.location.city",
    country: "faker.location.country",
    zipcode: "faker.location.zipCode",
    state: "faker.location.state",
    
    // Company
    company: "faker.company.name",
    job: "faker.person.jobTitle",
    jobtitle: "faker.person.jobTitle",
    department: "faker.commerce.department",
    
    // Internet
    url: "faker.internet.url",
    domain: "faker.internet.domainName",
    ip: "faker.internet.ip",
    useragent: "faker.internet.userAgent",
    
    // Commerce
    product: "faker.commerce.productName",
    price: "faker.commerce.price",
    description: "faker.commerce.productDescription",
    
    // Text
    title: "faker.lorem.sentence",
    text: "faker.lorem.paragraph",
    content: "faker.lorem.paragraphs",
    sentence: "faker.lorem.sentence",
    word: "faker.lorem.word",
    
    // Date/Time
    date: "faker.date.recent",
    datetime: "faker.date.recent",
    time: "faker.date.recent",
    
    // Other
    id: "faker.string.uuid",
    uuid: "faker.string.uuid",
    color: "faker.color.human",
    image: "faker.image.url",
};

/**
 * Checks if OpenAI API key is available.
 * @returns true if the API key is set, false otherwise
 */
function hasOpenAIKey(): boolean {
    return !!process.env.OPENAI_API_KEY;
}

/**
 * Generates mock data using faker.js as a fallback when OpenAI is not available.
 * Analyzes the field name and prompt to determine the best faker method to use.
 * 
 * @param field - The name/description of the field being generated
 * @param aiPrompt - User's description of what to generate
 * @returns Promise resolving to an object with a 'result' array of generated strings
 */
function generateFakerFallback(
    field: string,
    aiPrompt: string
): Promise<{ result: string[] }> {
    // Normalize field name for matching
    const normalizedField = field.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Try to find a matching faker method
    let fakerMethod = "faker.lorem.word";
    let additionalOptions: Record<string, unknown> | null = null;
    
    // Check if field name matches any predefined mapping
    for (const [key, method] of Object.entries(FAKER_FIELD_MAPPING)) {
        if (normalizedField.includes(key)) {
            fakerMethod = method;
            break;
        }
    }
    
    // Check prompt for hints
    const promptLower = aiPrompt.toLowerCase();
    if (promptLower.includes("email")) fakerMethod = "faker.internet.email";
    else if (promptLower.includes("name")) fakerMethod = "faker.person.fullName";
    else if (promptLower.includes("number") || promptLower.includes("age") || promptLower.includes("price")) {
        fakerMethod = "faker.number.int";
        additionalOptions = { min: 0, max: 9999 };
    }
    else if (promptLower.includes("url") || promptLower.includes("link")) fakerMethod = "faker.internet.url";
    else if (promptLower.includes("date")) fakerMethod = "faker.date.recent";
    else if (promptLower.includes("text") || promptLower.includes("description")) fakerMethod = "faker.lorem.paragraph";
    
    // Generate 20 items as per AI generation default
    const result: string[] = [];
    for (let i = 0; i < 20; i++) {
        try {
            const value = generateFakerField(fakerMethod, additionalOptions || undefined);
            result.push(String(value));
        } catch (error) {
            console.error(`Error generating faker data: ${error}`);
            result.push("Sample data");
        }
    }
    
    return Promise.resolve({ result });
}

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
 * If OpenAI API key is not available, automatically falls back to faker.js
 * to generate realistic mock data.
 * 
 * The function:
 * 1. Checks if OpenAI API key is available
 * 2. If not available, uses faker.js to generate data based on field name
 * 3. If available, sends a structured prompt to OpenAI
 * 4. Requests data generation based on user requirements and constraints
 * 5. Returns an array of independent, distinct values (default: 20 items)
 * 6. Each value is generated independently without dependencies
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
    // If no OpenAI API key, use faker.js as fallback
    if (!hasOpenAIKey()) {
        console.log(`[Fallback] OpenAI API key not available. Using faker.js to generate field: "${field}"`);
        return generateFakerFallback(field, aiPrompt);
    }

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