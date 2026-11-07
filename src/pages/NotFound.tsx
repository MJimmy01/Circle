import { Button } from "@heroui/react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
        404
      </h1>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6 text-sm">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Button
        as={Link}
        to="/"
        color="primary"
        variant="solid"
        className="font-medium shadow-md"
      >
        Back to Home
      </Button>
    </div>
  );
}
