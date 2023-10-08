"use client";

import { useAddress, useSDK, useStorage } from "@thirdweb-dev/react";
import {
  EAS,
  SchemaEncoder,
  SchemaRegistry,
} from "@ethereum-attestation-service/eas-sdk";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { SignerOrProvider } from "@ethereum-attestation-service/eas-sdk/dist/transaction";
import { Str } from "@supercharge/strings";
import CryptoJS from "crypto-js";
import { useContentPair, useLightPush, useWaku } from "@waku/react";
import { LightNode } from "@waku/interfaces";
import { ChatMessage } from "@/waku/chat_message";
import NavBar from "@/components/NavBar";
import { useLocalStorage } from "usehooks-ts";
import Sismo from "@/components/Sismo";

export const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
const eas = new EAS(EASContractAddress);

const schemaAuditUID =
  "0xdd037f18a5ad8213bd0826375c767a2098a5b46e4306e73d3d2ef6e71520519f";

const schemaRegistryContractAddress =
  "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"; // Sepolia 0.26
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

export default function Page() {
  const address = useAddress();
  const sdk = useSDK();
  const storage = useStorage();
  const { node } = useWaku<LightNode>();
  const { encoder } = useContentPair();
  const { push: onPush } = useLightPush({ node, encoder });
  const [state, setState] = useState<string>("");
  const ref = useRef<HTMLDialogElement>(null);
  const [messages, setMessages] = useLocalStorage<String[]>("messages", []);
  const [sismoProof, setSismoProof] = useLocalStorage<String>("sismoProof", "");

  useEffect(() => {
    setSismoProof("");
  }, []);

  const [formData, setFormData] = useState({
    calldata: "",
    audit: "",
    chainId: "",
    destination: "",
    estimateReward: "",
    flawedContractAddress: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    ref.current?.showModal();
    setState("Loading to IPFS");
    const encryptionKey = Str.random();
    console.log("Encription key: " + encryptionKey);

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify({ audit: formData.audit, calldata: formData.calldata }),
      encryptionKey
    ).toString();
    console.log(encryptedData);
    const uri_private_data = await storage?.upload({ data: encryptedData });
    console.log(uri_private_data);

    setState("Create attestation of audit");

    schemaRegistry.connect(
      sdk?.getSignerOrProvider() as unknown as SignerOrProvider
    );

    const schemaRecord = await schemaRegistry.getSchema({
      uid: schemaAuditUID,
    });
    console.log(schemaRecord);

    const schemaEncoder = new SchemaEncoder(schemaRecord.schema);
    const encodedData = schemaEncoder.encodeData([
      {
        name: "private_uid",
        value: uri_private_data as string,
        type: "string",
      },
      {
        name: "target",
        value: formData.flawedContractAddress,
        type: "address",
      },
      {
        name: "requested_rewards",
        value: formData.estimateReward,
        type: "string",
      },
      { name: "chain_id", value: parseInt(formData.chainId), type: "uint24" },
    ]);

    eas.connect(sdk?.getSignerOrProvider() as unknown as SignerOrProvider);
    const tx = await eas.attest({
      schema: schemaAuditUID,
      data: {
        recipient: formData.destination,
        revocable: true, // Be aware that if your schema is not revocable, this MUST be false
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();

    console.log("New attestation UID:", newAttestationUID);

    const timestamp = new Date();
    const chatMessage = ChatMessage.fromUtf8String(
      timestamp,
      address || "unknow",
      "Attest UID: " +
        newAttestationUID +
        "\nUri: " +
        uri_private_data +
        "\nencriptionKey: " +
        encryptionKey
    );
    const payload = chatMessage.encode();

    if (onPush) {
      console.log("push");
      const r = await onPush({ payload, timestamp });
      console.log(r);
    }
    setMessages((messages) => [
      ...messages,
      "Attest UID: " +
        newAttestationUID +
        "\nUri: " +
        uri_private_data +
        "\nencriptionKey: " +
        encryptionKey,
    ]);
    setState(
      "Encrypted key successfully send to recipier!\n\nAttest UID:\n\n" +
        newAttestationUID +
        "\n\nUri:\n\n" +
        uri_private_data +
        "\n\nencriptionKey:\n\n" +
        encryptionKey
    );
    console.log("fine");
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-3 md:p-24">
      <NavBar />
      <div className="w-full p-4 rounded bg-purple-300 mt-4">
        {!sismoProof ? (
          <div className="flex flex-col w-full justify-center items-center space-y-12 py-24">
          <p>{"Sign with your GitHub account to prove your are a person (and also a dev 😁)"}</p>
          <div className="max-w-xs"><Sismo /></div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold mt-4 text-center text-white">
              New audit
            </h2>
            <form
              onSubmit={handleSubmit}
              className="form-control space-y-4 mt-4 w-full"
            >
              <label htmlFor="calldata">Calldata:</label>
              <input
                type="text"
                id="calldata"
                name="calldata"
                className="input"
                value={formData.calldata}
                onChange={handleChange}
                placeholder="Insert the calldata that triggers the vulnerability"
              />
              <label htmlFor="audit">Audit description:</label>
              <input
                type="text"
                id="audit"
                name="audit"
                className="input "
                value={formData.audit}
                onChange={handleChange}
                placeholder="Insert a short description of the vulnerability"
              />
              <label htmlFor="chainId">Chain ID:</label>
              <input
                type="text"
                id="chainId"
                name="chainId"
                className="input "
                value={formData.chainId}
                onChange={handleChange}
                placeholder="Insert the chain where the smart contract resides"
              />
              <label htmlFor="destination">Recipient:</label>
              <input
                type="text"
                id="destination"
                name="destination"
                className="input "
                value={formData.destination}
                onChange={handleChange}
                placeholder="Insert the recipient that you want to notify about the vulnerability"
              />
              <label htmlFor="estimateReward">Requested reward:</label>
              <input
                type="text"
                id="estimateReward"
                name="estimateReward"
                className="input "
                value={formData.estimateReward}
                onChange={handleChange}
                placeholder="Insert a sum you considers fair for having discovered the vulnerability"
              />
              <label htmlFor="flawedContractAddress">
               Flawed contract address:
              </label>
              <input
                type="text"
                id="flawedContractAddress"
                name="flawedContractAddress"
                className="input "
                value={formData.flawedContractAddress}
                onChange={handleChange}
                placeholder="Insert the contract related to the vulnerability you discovered"
              />
              <button
                className="btn bg-pink-300 text-white hover:bg-pink-500 max-w-xs self-center"
                type="submit"
                disabled={address ? false : true}
              >
                Submit
              </button>
            </form>
          </>
        )}
      </div>

      <button className="btn hidden">open modal</button>
      <dialog id="my_modal_1" className="modal" ref={ref}>
        <div className="modal-box">
          <p className="py-4 text-center font-semibold text-xs">{state}</p>
          <div className="modal-action">
            {state.startsWith("Enc") ? (
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            ) : (
              <span className="loading loading-spinner loading-lg"></span>
            )}
          </div>
        </div>
      </dialog>
    </main>
  );
}
