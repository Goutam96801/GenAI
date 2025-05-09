"use client";

import { useEffect } from "react";
import {Crisp} from "crisp-sdk-web";

export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("4e159d67-b31c-4f15-bea8-a16b7c06fd83");
    }, [])

    return null;
}