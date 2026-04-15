import { MAX_BUFFER, CHANNEL_NAME } from "./constants";
import { DataChannelMessage, FileMeta } from "./types";

export function createDataChannel(
  pc: RTCPeerConnection,
): RTCDataChannel {
  const channel = pc.createDataChannel(CHANNEL_NAME);
  channel.binaryType = "arraybuffer";
  channel.bufferedAmountLowThreshold = MAX_BUFFER;

  return channel;
}

export function setupChannelListeners(
  channel: RTCDataChannel,
  onOpen: () => void,
  onMetaReceived: (meta: FileMeta) => void,
  onDataReceived: (data: ArrayBuffer) => void,
  onTransferComplete: () => void,
) {
  channel.onopen = () => {
    console.log("Canal aberto");
    onOpen();
  };

  channel.onmessage = (e) => {
    if (typeof e.data === "string") {
      const msg: DataChannelMessage = JSON.parse(e.data);

      if (msg.type === "meta") {
        onMetaReceived(msg as FileMeta);
      }

      if (msg.type === "end") {
        onTransferComplete();
      }
      return;
    }

    onDataReceived(e.data);
  };

  channel.onerror = (error) => {
    console.error("Erro no canal:", error);
  };

  channel.onclose = () => {
    console.log("Canal fechado");
  };
}

export function isChannelReady(channel: RTCDataChannel | null): boolean {
  return channel !== null && channel.readyState === "open";
}

export function setupOndatachannel(
  pc: RTCPeerConnection,
  onDataChannelReceived: (channel: RTCDataChannel) => void,
) {
  pc.ondatachannel = (e) => {
    const channel = e.channel;
    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = MAX_BUFFER;
    onDataChannelReceived(channel);
  };
}
