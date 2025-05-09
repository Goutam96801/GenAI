import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";


const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY || ""
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

        // Check free trial
        const freeTrail = await checkApiLimit();
        const isPro = await checkSubscription();

        if (!freeTrail && !isPro) {
            return NextResponse.json("Free trail has expired.", { status: 403 });
        }

        const input = {
            prompt: prompt,
            model_version: "stereo-large",
            output_format: "mp3",
            normalization_strategy: "peak"
        };

        const prediction = await replicate.predictions.create({
            version: "meta/musicgen:",
            // 671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb
            input
        });
        
        let finalPrediction = prediction;

        while(finalPrediction.status !== "succeeded" && 
            finalPrediction.status !== "failed"
        ){
            await new Promise((res) => setTimeout(res, 1000));
            finalPrediction = await replicate.predictions.get(prediction.id)
        }

        if (finalPrediction.status === "succeeded") {
            if (!isPro) await increaseApiLimit();
            return NextResponse.json({ output: finalPrediction.output });
          } else {
            return new NextResponse("Prediction failed", { status: 500 });
          }

    } catch (error) {
        console.log("[MUSIC_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}