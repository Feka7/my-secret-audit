"use client";

import NavBar from "@/components/NavBar";
import Waku from "@/waku/Waku";
import { ReactNode } from "react";


export default function AppWrapper() {
  return (
    <main className="flex min-h-screen flex-col items-center p-3 md:p-24">
        <NavBar />
        <Waku />
    </main>
  );
}
