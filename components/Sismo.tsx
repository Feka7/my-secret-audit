"use client";

import {
  SismoConnectButton,
  AuthType,
  SismoConnectResponse,
  ClaimType,
} from "@sismo-core/sismo-connect-react";
import { useAddress } from "@thirdweb-dev/react";
import { useLocalStorage } from "usehooks-ts";

export default function Sismo() {

    const [sismoProof, setSismoProof] = useLocalStorage<String>("sismoProof","")
  return (
    <SismoConnectButton
      config={{
        appId: "0x4bfc624f6c35b0592cf039a0b5077479", // replace with your appId
        vault: {
          // For development purposes insert the Data Sources that you want to impersonate here
          // Never use this in production
          impersonate: [
            // Github
            "github:feka7",
          ],
        },
        // displayRawResponse: true,
      }}
      theme="light"
      text="Sign your GitHub account"
      // request proof of Data Sources ownership (e.g EVM, GitHub, twitter or telegram)
      auths={[{ authType: AuthType.GITHUB }]}
      // retrieve the Sismo Connect Reponse from the user's Sismo data vault
      onResponse={async (response: SismoConnectResponse) => {
        const res = await fetch("/api/verify", {
          method: "POST",
          body: JSON.stringify(response),
        });

        //DISCLAIMER
        //The response from Sismo is not properly handled
        //Our scope is to simulate the interaction for the live demo
        setSismoProof("sismoProof generated")
      }}
      // reponse in bytes to call a contract
      // onResponseBytes={async (response: string) => {
      //   console.log(response);
      // }}
    />
  );
}