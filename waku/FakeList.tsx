"use client";

import { useReadLocalStorage } from "usehooks-ts";

export default function FakeList() {
  const messages = useReadLocalStorage("messages") as string[];
  return (
    <>
      {messages && messages.map((m, index) => (
        <div className="flex" key={index}>
          <div className="flex flex-col p-3">
            <p className="text-gray-500">New Audit!</p>
            <p className="text-gray-700">{m}</p>
          </div>
        </div>
      ))}
    </>
  );
}
