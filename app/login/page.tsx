"use client";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Login</h1>
      <button
        className="bg-[#f4f0e1] px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
        onClick={() => signIn("google")}
      >
        Log In
      </button>
    </div>
  );
}
