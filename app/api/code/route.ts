import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI, Content, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // 
import { NextResponse } from "next/server";


if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const generationConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];


const CODE_GENERATOR_INSTRUCTION = "You are a code generator. You MUST answer *only* in markdown code snippets. Ensure the code block includes the language identifier (e.g., ```javascript ... ``` or ```python ... ```). Use code comments *within* the code block for explanations.";

const instructionAcknowledgement: Content = {
    role: "model",
    parts: [{ text: "Okay, I will act as a code generator and respond *only* with markdown code snippets, ensuring the language identifier is included (like ```python ... ```). I will use code comments for explanations." }]
}

type InputMessage = {
    role: "user" | "model"; 
    content: string;
};

const buildGoogleGenAIContent = (messages: InputMessage[]): Content[] => {
    return messages.map((message): Content => ({
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }],
    }));
};

export async function POST(req: Request) {
    try {

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI API Key not configured at request time.");
            return new NextResponse("API Key not configured", { status: 500 });
        }

        const { userId } = await auth(); 
        const body = await req.json();
        const { messages }: { messages: InputMessage[] } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!messages || messages.length === 0) {
            return new NextResponse("Messages are required", { status: 400 });
        }

        
        const instructionContent: Content = {
            role: "user", 
            parts: [{ text: CODE_GENERATOR_INSTRUCTION }],
        };

       
        const conversationHistory = buildGoogleGenAIContent(messages.slice(0, -1));
        const historyForChat: Content[] = [
            instructionContent,
            instructionAcknowledgement,
            ...conversationHistory,
        ];


        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: CODE_GENERATOR_INSTRUCTION
        });


        const lastMessage = messages[messages.length - 1];

        
        if (lastMessage.role !== 'user') {
            console.warn("Received request where the last message wasn't from the user. This might indicate an issue with frontend state management.");
            return new NextResponse("Last message must be from user", { status: 400 });
        }


        
        const chat = model.startChat({
            history: historyForChat,
            generationConfig, 
            safetySettings,  
        });


        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response;

        if (!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
            const blockReason = response?.promptFeedback?.blockReason;
            const safetyRatings = response?.candidates?.[0]?.safetyRatings;
            console.error("Gemini response blocked or empty.", { blockReason, safetyRatings });

             if (blockReason) {
                return new NextResponse(`Request blocked due to: ${blockReason}. Please adjust your prompt.`, { status: 400 });
            }
             if (safetyRatings?.some(rating => rating.probability !== 'NEGLIGIBLE' && rating.probability !== 'LOW')) {
                 return new NextResponse("Response blocked due to safety concerns. Please rephrase your request.", { status: 400 });
             }
            return new NextResponse("Model did not return a valid response.", { status: 500 });
        }


        const text = response.text(); 

        return NextResponse.json({ role: 'model', content: text });

    } catch (error) {
        console.error("[CODE_GENERATION_ERROR]", error);
         
        return new NextResponse(`Internal error: ${error}`, { status: 500 });
    }
}