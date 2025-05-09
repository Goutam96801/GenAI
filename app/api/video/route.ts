import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }

    const input = {
      style: "None",
      effect: "None",
      prompt,
      quality: "360p",
      duration: 5,
      motion_mode: "normal",
      aspect_ratio: "16:9",
      negative_prompt: "",
    };

    // Replace with your model version ID (you can find it on replicate.com)
    const prediction = await replicate.predictions.create({
      version: "pixverse/pixverse-v4", // ← replace this!
      input,
    });

    let finalPrediction = prediction;

    while (
      finalPrediction.status !== "succeeded" &&
      finalPrediction.status !== "failed"
    ) {
      await new Promise((res) => setTimeout(res, 1000));
      finalPrediction = await replicate.predictions.get(prediction.id);
    }

    if (finalPrediction.status === "succeeded") {
      if (!isPro) await increaseApiLimit();
      return NextResponse.json({ output: finalPrediction.output });
    } else {
      return new NextResponse("Prediction failed", { status: 500 });
    }
  } catch (error) {
    console.error("[VIDEO_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
