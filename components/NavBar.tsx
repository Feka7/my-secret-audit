'use client'

import { ConnectWallet } from "@thirdweb-dev/react";
import Link from "next/link";
import Image from 'next/image'

export default function NavBar() {
  return (
    <div className="flex w-full items-center justify-around">
      <Link href="/">
        <Image
      src="/logo.png"
      width={250}
      height={250}
      alt="Logo"
    />
    </Link>
      <ConnectWallet />
    </div>
  );
}
