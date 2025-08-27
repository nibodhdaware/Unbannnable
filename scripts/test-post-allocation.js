const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config();

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function testPostAllocation() {
    try {
        console.log("Testing post allocation...");

        // Test data - replace with actual values
        const testData = {
            paymentId: "test_payment_" + Date.now(),
            userId: "jh787vqe9h5pwj4yema038rwks7n3cyp", // Replace with actual user ID
            planType: "tenPosts", // Test with 10 posts
        };

        console.log("Test data:", testData);

        const result = await convex.mutation(
            "payments:allocatePostsFromPayment",
            testData,
        );

        console.log("Post allocation result:", result);

        // Check user's updated post count
        const user = await convex.query("users:getUser", {
            id: testData.userId,
        });
        console.log("User after allocation:", {
            totalPurchasedPosts: user.totalPurchasedPosts,
            email: user.email,
        });
    } catch (error) {
        console.error("Error testing post allocation:", error);
    }
}

testPostAllocation();
