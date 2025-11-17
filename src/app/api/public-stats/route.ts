import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const client = await clerkClient();

        // Fetch all users with proper pagination
        let allUsers: any[] = [];
        let offset = 0;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
            const response = await client.users.getUserList({
                limit,
                offset,
            });

            allUsers = [...allUsers, ...response.data];
            offset += limit;
            hasMore = response.data.length === limit;
        }

        // Get actual count and real avatars
        const actualCount = allUsers.length;
        const realAvatars = allUsers.map((u) => u.imageUrl).filter(Boolean); // Remove any null/undefined

        return NextResponse.json({
            count: actualCount,
            avatars: realAvatars.slice(0, 10), // Show up to 10 avatars
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);

        // Fallback to static data if API fails
        return NextResponse.json({
            count: 30,
            avatars: [
                "https://avatar.vercel.sh/user1",
                "https://avatar.vercel.sh/user2",
                "https://avatar.vercel.sh/user3",
                "https://avatar.vercel.sh/user4",
                "https://avatar.vercel.sh/user5",
            ],
        });
    }
}
