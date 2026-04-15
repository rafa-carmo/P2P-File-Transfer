import { STUN_SERVER } from "./constants";

export function createPeerConnection(): RTCPeerConnection {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: STUN_SERVER }],
  });

  return pc;
}

export function onICECandidate(
  pc: RTCPeerConnection,
  callback: (sdp: string) => void,
) {
  pc.onicecandidate = (e) => {
    if (!e.candidate) {
      const localDescription = pc.localDescription;
      if (localDescription) {
        callback(JSON.stringify(localDescription));
      }
    }
  };
}
