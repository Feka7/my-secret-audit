import React, { useEffect, useState } from "react";
import { generate } from "server-name-generator";
import { Message } from "./Message";
import { EPeersByDiscoveryEvents, LightNode, Tags } from "@waku/interfaces";
import type { PeerId } from "@libp2p/interface-peer-id";

import { useFilterMessages, useStoreMessages } from "@waku/react";
import type {
  UseMessagesParams,
  UseMessagesResult,
  UsePeersParams,
  UsePeersResults,
} from "./types";
import { OrderedSet } from "./ordered_array";
import { getPeerIdsForProtocol } from "./utils";

export const usePersistentNick = (): [
  string,
  React.Dispatch<React.SetStateAction<string>>
] => {
  const [nick, setNick] = useState<string>(() => {
    const persistedNick = "feka";
    return persistedNick !== null ? persistedNick : generate();
  });
  useEffect(() => {
    localStorage.setItem("nick", nick);
  }, [nick]);

  return [nick, setNick];
};

export const useMessages = (params: UseMessagesParams): UseMessagesResult => {
  const { messages: newMessages } = useFilterMessages(params);
  const { messages: storedMessages } = useStoreMessages(params);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const pushMessages = (msgs: Message[]) => {
    if (!msgs || !msgs.length) {
      return;
    }
    setLocalMessages((prev) => [...prev, ...msgs]);
  };

  const allMessages = React.useMemo((): OrderedSet<Message> => {
    const allMessages = new OrderedSet(Message.cmp, Message.isEqual);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const _msgs = [...storedMessages, ...newMessages]
      .map(Message.fromWakuMessage)
      .filter((v): v is Message => !!v)
      .filter((v) => v.payloadAsUtf8 !== "")
      // Filter out messages that are "sent" tomorrow are they are likely to be flukes
      .filter((m) => m.timestamp.valueOf() < tomorrow.valueOf());
    allMessages.push(..._msgs);
    allMessages.push(...localMessages);

    return allMessages;
  }, [storedMessages, newMessages, localMessages]);

  return [allMessages, pushMessages];
};


/**
 * Hook returns map of peers for different protocols.
 * If protocol is not implemented on the node peers are undefined.
 * @example
 * const { storePeers } = usePeers({ node });
 * @param {Waku} params.node - Waku node, if not set then no peers will be returned
 * @returns {Object} map of peers, if some of the protocols is not implemented then undefined
 */
export const usePeers = (params: UsePeersParams): UsePeersResults => {
  const { node } = params;
  const [peers, setPeers] = React.useState<UsePeersResults>({});

  useEffect(() => {
    if (!node) {
      return;
    }

    const listener = async () => {
      // find all the peers that are connected for diff protocols
      const peerIds = node.libp2p.getPeers();
      const peers = await Promise.all(
        peerIds.map((id) => node.libp2p.peerStore.get(id))
      );

      setPeers({
        allConnected: peers.map((p) => p.id),
        storePeers: getPeerIdsForProtocol(node.store, peers),
        filterPeers: getPeerIdsForProtocol(node.filter, peers),
        lightPushPeers: getPeerIdsForProtocol(node.lightPush, peers),
      });
    };

    listener(); // populate peers before event is invoked
    node.libp2p.addEventListener("peer:identify", listener);
    return () => {
      node.libp2p.removeEventListener("peer:identify", listener);
    };
  }, [node, setPeers]);

  return peers;
};