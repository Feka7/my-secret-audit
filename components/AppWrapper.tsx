"use client";

import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ReactNode } from "react";
import { Sepolia } from "@thirdweb-dev/chains";
import { ContentPairProvider, LightNodeProvider } from "@waku/react";
import { Protocols } from "@waku/interfaces";
import { CONTENT_TOPIC } from "./../waku/config";

export default function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider
      activeChain={Sepolia}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <LightNodeProvider
        options={{ defaultBootstrap: true }}
        protocols={[Protocols.Store, Protocols.Filter, Protocols.LightPush]}
      >
        <ContentPairProvider contentTopic={CONTENT_TOPIC}>
        {children}
        </ContentPairProvider>
      </LightNodeProvider>
    </ThirdwebProvider>
  );
}
