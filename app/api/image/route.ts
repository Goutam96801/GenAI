import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
// Initialize the Google Gen AI client with your API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_API_KEY) {
  throw new NextResponse("GEMINI_API_KEY is not set", { status: 500 });
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define the model ID for Gemini 2.0 Flash experimental
const MODEL_ID = "gemini-2.0-flash-exp";

export async function POST(req: NextRequest) {
  try {
    // Parse JSON request
    const requestData = await req.json();
    const { prompt } = requestData;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Get the model with the correct configuration
    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        // @ts-expect-error - Gemini API JS is missing this type
        responseModalities: ["Text", "Image"],
      },
    });

    // Send the prompt to generate an image
    const result = await model.generateContent(prompt);
    const response = result.response;


    return NextResponse.json(response);

   
  } catch (error) {
    console.error("Error generating image:", error);
    return new NextResponse("Failed to generate image", { status: 500 });
  }
}