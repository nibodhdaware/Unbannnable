export async function generateResultImage(result: {
    banRisk: number;
    risk_level: "low" | "medium" | "high" | "critical";
    issues: string[];
    suggestions: string[];
}): Promise<Blob> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    // Set canvas size (social media friendly dimensions)
    canvas.width = 1200;
    canvas.height = 630;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#fff7ed");
    gradient.addColorStop(1, "#fef2f2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Risk level colors
    const colors = {
        low: { bg: "#dcfce7", text: "#16a34a", icon: "✓" },
        medium: { bg: "#fef3c7", text: "#ca8a04", icon: "⚠" },
        high: { bg: "#fed7aa", text: "#ea580c", icon: "⚠" },
        critical: { bg: "#fecaca", text: "#dc2626", icon: "✕" },
    };

    const color = colors[result.risk_level];

    // Draw main card with shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 40, 40, canvas.width - 80, canvas.height - 80, 20);
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Draw risk badge
    ctx.fillStyle = color.bg;
    roundRect(ctx, canvas.width / 2 - 100, 80, 200, 50, 25);
    ctx.fill();

    ctx.fillStyle = color.text;
    ctx.font = 'bold 20px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(result.risk_level.toUpperCase() + " RISK", canvas.width / 2, 112);

    // Draw percentage
    ctx.fillStyle = "#111827";
    ctx.font = 'bold 120px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(`${result.banRisk}%`, canvas.width / 2, 250);

    // Draw subtitle
    ctx.fillStyle = "#6b7280";
    ctx.font = '28px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.fillText("Chance of Getting Banned", canvas.width / 2, 290);

    // Draw divider
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 330);
    ctx.lineTo(canvas.width - 100, 330);
    ctx.stroke();

    // Draw issues and suggestions side by side
    const leftX = 80;
    const rightX = canvas.width / 2 + 40;
    const startY = 370;
    const maxWidth = canvas.width / 2 - 120;

    // Issues section (left)
    ctx.fillStyle = "#991b1b";
    ctx.font = 'bold 22px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText("Issues Found", leftX, startY);

    ctx.fillStyle = "#374151";
    ctx.font = '16px system-ui, -apple-system, "Segoe UI", sans-serif';
    let yOffset = startY + 35;
    result.issues.slice(0, 3).forEach((issue) => {
        const wrapped = wrapText(ctx, `• ${issue}`, maxWidth);
        wrapped.forEach((line) => {
            if (yOffset < canvas.height - 100) {
                ctx.fillText(line, leftX, yOffset);
                yOffset += 24;
            }
        });
    });

    // Suggestions section (right)
    ctx.fillStyle = "#065f46";
    ctx.font = 'bold 22px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText("How to Fix", rightX, startY);

    ctx.fillStyle = "#374151";
    ctx.font = '16px system-ui, -apple-system, "Segoe UI", sans-serif';
    yOffset = startY + 35;
    result.suggestions.slice(0, 3).forEach((suggestion) => {
        const wrapped = wrapText(ctx, `✓ ${suggestion}`, maxWidth);
        wrapped.forEach((line) => {
            if (yOffset < canvas.height - 100) {
                ctx.fillText(line, rightX, yOffset);
                yOffset += 24;
            }
        });
    });

    // Draw footer branding
    ctx.fillStyle = "#9ca3af";
    ctx.font = '18px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("check.unbannnable.com", canvas.width / 2, canvas.height - 50);

    // Convert to blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to create image"));
            },
            "image/png",
            1.0,
        );
    });
}

// Helper function to draw rounded rectangles
function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Helper function to wrap text
function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + " " + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}
