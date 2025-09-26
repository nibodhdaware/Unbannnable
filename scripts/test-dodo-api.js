// Test script to verify Dodo Payments API key
const testDodoAPI = async () => {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const testEndpoint = process.env.NEXT_PUBLIC_DODO_TEST_API;

    console.log("Testing Dodo Payments API...");
    console.log("API Key (first 10 chars):", apiKey?.substring(0, 10) + "...");
    console.log("Test Endpoint:", testEndpoint);

    try {
        // Try a simple GET request to see if the API key works
        const response = await fetch(`${testEndpoint}/products`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Response Status:", response.status);
        console.log("Response Status Text:", response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log("✅ API Key is valid!");
            console.log("Products data:", data);
        } else {
            const errorData = await response.json().catch(() => null);
            console.log("❌ API Key validation failed");
            console.log("Error:", errorData);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
};

// Run the test
testDodoAPI();
