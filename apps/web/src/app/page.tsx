import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <main className="flex flex-col items-center justify-center max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
          KitaBuild Election System
        </h1>
        <p className="text-xl text-gray-600">
          Welcome to the secure, streamlined platform for student elections.
        </p>
        <Link 
          href="/login" 
          className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Enter the Portal
        </Link>
      </main>
    </div>
  );
}
