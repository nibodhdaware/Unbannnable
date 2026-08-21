import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F2F0E9] px-6">
            <div className="text-center max-w-md border-2 border-[#1A1A1A] bg-white p-10 shadow-[8px_8px_0px_0px_#1A1A1A]">
                <h1 className="text-5xl font-black tracking-tighter text-[#1A1A1A] mb-3">
                    404
                </h1>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
                    Page Not Found
                </h2>
                <p className="text-black/60 mb-8 font-medium">
                    The page you&apos;re looking for doesn&apos;t exist or was
                    moved.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center h-11 px-6 bg-[#FF4500] text-white font-bold uppercase tracking-wide text-sm border-2 border-[#1A1A1A] hover:bg-[#E04400] transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
