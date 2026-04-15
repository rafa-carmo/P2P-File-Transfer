export async function createOffer(
  pc: RTCPeerConnection,
): Promise<void> {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
}

export async function createAnswer(
  pc: RTCPeerConnection,
): Promise<void> {
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
}

export async function setRemoteDescription(
  pc: RTCPeerConnection,
  sdpString: string,
): Promise<void> {
  const sdp = JSON.parse(sdpString);
  await pc.setRemoteDescription(sdp);

  if (sdp.type === "offer") {
    await createAnswer(pc);
  }
}
