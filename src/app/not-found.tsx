export default function NotFound() {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            404
                        </h1>
                        <h2 className="text-xl text-gray-600 mb-6">
                            Page Not Found
                        </h2>
                        <p className="text-gray-500 mb-8">
                            The page you&apos;re looking for doesn&apos;t exist.
                        </p>
                        <a
                            href="/"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
