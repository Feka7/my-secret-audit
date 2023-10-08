'use client'

import { Message } from "./Message";
import type { ChatListProps } from "./types";

export default function ChatList(props: ChatListProps) {
  const renderedMessages = props.messages.array.map((message) => (
    <div
      key={
        message.nick +
        message.payloadAsUtf8 +
        message.timestamp.valueOf() +
        message.sentTimestamp?.valueOf()
      }
      className="flex"
    >
      <div className="flex flex-col p-3">
      <p className="text-gray-500">New Audit!</p>
      <p className="text-sm text-gray-500">
        {formatDisplayDate(message)}
      </p>
      <p className="text-gray-700">{message.payloadAsUtf8}</p>
      </div>
    </div>
  ));

  return (
    <div className="overflow-y-auto h-full flex flex-col space-y-6 self-center py-4">
      {renderedMessages}
    </div>
  );
}

function formatDisplayDate(message: Message): string {
  return message.timestamp.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
}

