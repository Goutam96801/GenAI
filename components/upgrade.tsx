import { Button } from "@/components/ui/button"
import { useProModal } from "@/hooks/use-pro-modal"
import { Zap } from "lucide-react"
import { useEffect, useState } from "react";

interface UpgradeProps {
    isPro: boolean;
}

const Upgrade = ({
    isPro = false
}: UpgradeProps) => {

    const proModal = useProModal();
    

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    if(isPro) {
        return null;
    }

    return (
        <div className="px-3">
            <Button onClick={proModal.onOpen} className="w-full cursor-pointer" variant="premium">
                Upgrade to Pro
                <Zap className="w-4 h-4 ml-2 fill-white" />
            </Button>
        </div>
    )
}

export default Upgrade;