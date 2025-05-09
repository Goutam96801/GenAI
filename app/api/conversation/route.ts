import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI, Content, HarmCategory, HarmBlockThreshold  } from "@google/generative-ai";
import { NextResponse } from "next/server";

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

type InputMessage = {
    role: "user" | "assistant" | "model";
    content: string;
};

const buildGoogleGenAIContent = (messages: InputMessage[]): Content[] => {
    return messages.map(message => ({

        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }]
    }));
};

export async function POST(
    req: Request
) {
    try {

        const { userId } = await auth();
        const body = await req.json();
        const { messages }: { messages: InputMessage[] } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI API Key not configured");
            return new NextResponse("API Key not configured", { status: 500 });
        }

        if (!messages || messages.length === 0) {
            return new NextResponse("Messages are required", { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const history = buildGoogleGenAIContent(messages.slice(0, -1));

        const lastMessage = messages[messages.length - 1];

        if (lastMessage.role !== 'user') {
            return new NextResponse("Last message must be from user", { status: 400 });
        }

        const chat = model.startChat({
            history: history,
            generationConfig,
            safetySettings,  
        });

        const result = await chat.sendMessage(lastMessage.content);

        const response = result.response;
        const text = response.text();


        return NextResponse.json({ role: 'model', content: text });

    } catch (error) {
        console.log("[CONVERSATION_ERROR]", error);
        return new NextResponse(`Internal error: ${error || 'Unknown error'}`, { status: 500 });
    }
}