"use client";

import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center p-3 md:p-24">
      <NavBar />
      <div className="grow flex justify-center items-center">
      <div className="grid gris-cols-1 md:grid-cols-3 gap-10">
        <Link href="/new" className="btn bg-purple-700 text-white hover:bg-purple-900 w-32">New</Link>
        <Link href="/verify" className="btn bg-purple-700 text-white hover:bg-purple-900 w-32">Verify</Link>
        <Link href="/chat" className="btn bg-purple-700 text-white hover:bg-purple-900 w-32">Messages</Link>        
      </div>
      </div>
    </main>
  )
}
