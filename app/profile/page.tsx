"use client";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">LoggedIN</h1>
    </div>
  );
}
