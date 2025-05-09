import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HeadingProps {
    title: string;
    description: string;
    icon: LucideIcon;
    iconColor?: string;
    bgColor?: string;
}

export const Heading = ({
    title,
    description,
    icon: Icon,
    iconColor,
    bgColor
}: HeadingProps) => {
    return (
        <div className="px-4 lg:px-8 flex items-center gap-x-3">
            <div className={cn("p-2 w-fit rounded-md", bgColor)}>
                <Icon className={cn("w-8 h-8", iconColor)} />
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                    {title}
                </h2>
                <p className="text-sm text-muted-foreground hidden sm:block">
                    {description}
                </p>
            </div>
        </div>
    )
}