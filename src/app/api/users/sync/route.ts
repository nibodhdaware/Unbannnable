import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function POST(req: NextRequest) {
    try {
        const { clerkId, email, fullName, username } = await req.json();

        if (!clerkId || !email) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        const userData = {
            clerkId,
            email,
            fullName: fullName || null,
            username: username || null,
            updatedAt: new Date(),
        };

        if (existingUser.length > 0) {
            // Update existing user
            await db
                .update(users)
                .set(userData)
                .where(eq(users.clerkId, clerkId));

            console.log("User updated in database:", clerkId);
        } else {
            // Insert new user
            await db.insert(users).values({
                ...userData,
                createdAt: new Date(),
            });

            console.log("User created in database:", clerkId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
