import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
    const { userId } = await auth();

    if (!userId) {
        return false;
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
        where: {
            userId,
        },
        select: {
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
            stripePriceId: true,
        },
    });

    if (!userSubscription) {
        return false;
    }

    const currentPeriodEnd = userSubscription.stripeCurrentPeriodEnd?.getTime();

    if (!currentPeriodEnd) {
        return false;
    }

    const isValid =
        !!userSubscription.stripePriceId &&
        currentPeriodEnd + DAY_IN_MS > Date.now();

    return isValid;


}