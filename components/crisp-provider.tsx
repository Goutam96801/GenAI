"use client";

import { CrispChat } from "@/components/crisp-chat";

export const CrispProvider = () => {
    return (
        <div className="hidden">
            <CrispChat />
        </div>
    )
}