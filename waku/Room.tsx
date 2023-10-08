'use client'

import type { LightNode } from "@waku/interfaces";
import { useContentPair, useLightPush, useWaku } from "@waku/react";
import { ChatMessage } from "./chat_message";
import type { RoomProps } from "./types";
import FakeList from "./FakeList";

export default function Room(props: RoomProps) {
  const { node } = useWaku<LightNode>();
  const { encoder } = useContentPair();
  const { push: onPush } = useLightPush({ node, encoder });

  const onSend = async (text: string) => {
    if (!onPush || !text) {
      return;
    }

    if (text.startsWith("/")) {
      props.commandHandler(text);
    } else {
      const timestamp = new Date();
      const chatMessage = ChatMessage.fromUtf8String(
        timestamp,
        props.nick,
        text
      );
      const payload = chatMessage.encode();

      await onPush({ payload, timestamp });
    }
  };

  //DISCLAIMER
  //during the hackaton we encountered some problems on Waku
  //to ensure a smooth live demo we preferred to show the data from localStorage
  return (
    <div className="h-screen flex flex-col w-full">
      {/* <ChatList messages={props.messages} /> */}
      <FakeList />
    </div>
  );
}