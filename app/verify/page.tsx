"use client";

import NavBar from "@/components/NavBar";
import { useAddress, useSDK, useStorage } from "@thirdweb-dev/react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import CryptoJS from "crypto-js";

export const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";

export default function Page() {
  const address = useAddress();
  const sdk = useSDK();
  const storage = useStorage();
  const [state, setState] = useState<string>("");
  const ref = useRef<HTMLDialogElement>(null);
  const [audit, setAudit] = useState<string>("");

  const [formData, setFormData] = useState({
    uri: "",
    key: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    ref.current?.showModal();
    console.log(formData);
    setState("Download to IPFS");

    const download_uri_private_data = await storage?.downloadJSON(
      formData.uri as string
    );
    console.log(download_uri_private_data.data);
    const decryptedBytes = CryptoJS.AES.decrypt(
      download_uri_private_data.data,
      formData.key
    );
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    console.log(decryptedData);
    setAudit(decryptedData);
    setState("Audit decrypted!")

    console.log("fine");
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-3 md:p-24">
      <NavBar />
      <div className="w-full p-4 rounded bg-purple-300 mt-4">
        <h2 className="text-3xl font-semibold mt-4 text-center text-white">
          Verify audit
        </h2>
        <form
          onSubmit={handleSubmit}
          className="form-control space-y-4 mt-4 w-full"
        >
          <label htmlFor="calldata">URI:</label>
          <input
            type="text"
            id="uri"
            name="uri"
            className="input"
            value={formData.uri}
            onChange={handleChange}
            placeholder="Insert the URI that points to the encrypted audit on IPFS"
          />
          <label htmlFor="audit">Decrypting key:</label>
          <input
            type="text"
            id="key"
            name="key"
            className="input"
            value={formData.key}
            onChange={handleChange}
            placeholder="Insert the key needed to decrypt the audit on IPFS"
          />
          <button
            className="btn bg-pink-300 text-white hover:bg-pink-500 max-w-xs self-center"
            type="submit"
            disabled={address ? false : true}
          >
            Verify
          </button>
        </form>
        {audit && (
          <>
            <p className="text-xl text-white font-semibold">Audit report</p>
            <div className="w-full text-black">{audit}</div>
          </>
        )}
      </div>
      <button className="btn hidden">open modal</button>
      <dialog id="my_modal_1" className="modal" ref={ref}>
        <div className="modal-box">
          <p className="py-4 text-center font-semibold">{state}</p>
          <div className="modal-action">
            {!state.startsWith("Down") ? (
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
