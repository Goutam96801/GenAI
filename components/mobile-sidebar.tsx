"use client"

import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"

interface MobileSidebarProps {
    isPro: boolean;
}

const MobileSidebar = ({
    isPro = false
}: MobileSidebarProps) => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if(!isMounted){
        return null
    }
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden cursor-pointer">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[240px] sm:w-[540px] text-white">
            <SheetTitle className="hidden"></SheetTitle>
                <Sidebar isPro={isPro} />
            </SheetContent>
        </Sheet>
    )
}

export default MobileSidebar;