import { createOffer, createAnswer, setRemoteDescription } from '@/utils/fileTransfer/signaling'

function makeMockPc(type: 'offer' | 'answer' = 'offer') {
  return {
    createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'offer-sdp' }),
    createAnswer: jest.fn().mockResolvedValue({ type: 'answer', sdp: 'answer-sdp' }),
    setLocalDescription: jest.fn().mockResolvedValue(undefined),
    setRemoteDescription: jest.fn().mockResolvedValue(undefined),
  }
}

describe('createOffer', () => {
  it('calls createOffer on the peer connection', async () => {
    const pc = makeMockPc()
    await createOffer(pc as unknown as RTCPeerConnection)
    expect(pc.createOffer).toHaveBeenCalledTimes(1)
  })

  it('sets the offer as the local description', async () => {
    const pc = makeMockPc()
    await createOffer(pc as unknown as RTCPeerConnection)
    expect(pc.setLocalDescription).toHaveBeenCalledWith({ type: 'offer', sdp: 'offer-sdp' })
  })
})

describe('createAnswer', () => {
  it('calls createAnswer on the peer connection', async () => {
    const pc = makeMockPc()
    await createAnswer(pc as unknown as RTCPeerConnection)
    expect(pc.createAnswer).toHaveBeenCalledTimes(1)
  })

  it('sets the answer as the local description', async () => {
    const pc = makeMockPc()
    await createAnswer(pc as unknown as RTCPeerConnection)
    expect(pc.setLocalDescription).toHaveBeenCalledWith({ type: 'answer', sdp: 'answer-sdp' })
  })
})

describe('setRemoteDescription', () => {
  it('parses the SDP string and calls setRemoteDescription', async () => {
    const pc = makeMockPc()
    const sdp = { type: 'answer', sdp: 'remote-sdp' }
    await setRemoteDescription(pc as unknown as RTCPeerConnection, JSON.stringify(sdp))
    expect(pc.setRemoteDescription).toHaveBeenCalledWith(sdp)
  })

  it('also creates an answer when the remote SDP is an offer', async () => {
    const pc = makeMockPc()
    const sdp = { type: 'offer', sdp: 'remote-offer-sdp' }
    await setRemoteDescription(pc as unknown as RTCPeerConnection, JSON.stringify(sdp))
    expect(pc.createAnswer).toHaveBeenCalledTimes(1)
    expect(pc.setLocalDescription).toHaveBeenCalledTimes(1)
  })

  it('does not create an answer when the remote SDP is not an offer', async () => {
    const pc = makeMockPc()
    const sdp = { type: 'answer', sdp: 'remote-answer-sdp' }
    await setRemoteDescription(pc as unknown as RTCPeerConnection, JSON.stringify(sdp))
    expect(pc.createAnswer).not.toHaveBeenCalled()
    expect(pc.setLocalDescription).not.toHaveBeenCalled()
  })
})
