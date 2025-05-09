"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const testimonials = [
    {
        quote:
            "GenAI completely changed the way I code! The instant code generation saved me hours on my last web project.",
        name: "Aarav Mehta",
        title: "Frontend Developer",
    },
    {
        quote:
            "I needed high-quality images for my marketing campaign—and GenAI delivered stunning visuals for free!",
        name: "Elena Rodriguez",
        title: "Digital Marketer",
    },
    {
        quote:
            "The chat generation feels natural, intelligent, and responsive. It’s like having a co-pilot for every project!",
        name: "Michael Lee",
        title: "AI Researcher",
    },
    {
        quote:
            "GenAI's free tools for code and image generation are a game-changer for indie developers like me.",
        name: "Priya Sharma",
        title: "Solo App Builder",
    },
    {
        quote:
            "I used GenAI to generate a music track for my short film. The results were unbelievably good.",
        name: "Carlos Mendes",
        title: "Filmmaker",
    },
    {
        quote:
            "The video generation feature blew my mind. It's fast, creative, and shockingly simple to use.",
        name: "Tina Gallagher",
        title: "Content Creator",
    },
    {
        quote:
            "GenAI is my daily go-to for AI-generated images and code snippets. It’s fast, accurate, and intuitive.",
        name: "Liam Zhang",
        title: "UI/UX Designer",
    },
    {
        quote:
            "As a teacher, I use GenAI to create interactive content and quick code demos for my students. It’s brilliant!",
        name: "Dr. Nora Kim",
        title: "Computer Science Educator",
    },
    {
        quote:
            "I built a prototype in 3 days using GenAI's code and image generation. Absolutely essential tool in my stack.",
        name: "Rahul Patil",
        title: "Startup Founder",
    },
    {
        quote:
            "The fact that GenAI offers free access to such high-quality AI tools is incredible. Highly recommended!",
        name: "Emily Cooper",
        title: "Freelance Designer",
    },
];


export const LandingContent = () => {
    return (
        <div className="px-10 pb-20">
            <h2 className="text-center text-4xl text-white font-extrabold mb-10">
                Testimonials
            </h2>
            <div className="h-[20rem] bg-transparent rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
                <InfiniteMovingCards
                    items={testimonials}
                    direction="right"
                    speed="slow"
                    className="dark"
            
                />
            </div>
        </div>
    )
}