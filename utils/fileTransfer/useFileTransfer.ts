import { useCallback, useRef, useState } from "react";
import { FileMeta, FileTransferState } from "./types";
import { createPeerConnection, onICECandidate } from "./peerConnection";
import { createDataChannel, isChannelReady, setupChannelListeners, setupOndatachannel } from "./channel";
import { createOffer, setRemoteDescription } from "./signaling";
import { sendFile } from "./sendFile";
import { initializeReceiveState, addReceivedChunk, addReceivedEncryptedChunk, setReceivedFileMeta, getReceivedFile, getReceiveProgress } from "./receiveFile";
import { downloadFile } from "./download";

import { EncryptedData, exportKeyToString, importKeyFromString } from "./encryption";
import { createNewKey } from "./keyManagement";

export function useFileTransfer() {
  const [state, setState] = useState<FileTransferState>({
    localSDP: "",
    remoteSDP: "",
    sendProgress: 0,
    receiveProgress: 0,
    isConnected: false,
    error: null,
    encryptionKey: "",
    remoteEncryptionKey: "",
    isEncryptionEnabled: false,
  });

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const receiveStateRef = useRef(initializeReceiveState());
  const encryptionKeyRef = useRef<CryptoKey | null>(null);
  const remoteEncryptionKeyRef = useRef<CryptoKey | null>(null);

  const setLocalSDP = useCallback((sdp: string) => {
    setState((prev) => ({ ...prev, localSDP: sdp }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setIsConnected = useCallback((connected: boolean) => {
    setState((prev) => ({ ...prev, isConnected: connected }));
  }, []);

  const handleGenerateEncryptionKey = useCallback(async () => {
    try {
      const key = await createNewKey();
      encryptionKeyRef.current = key;
      const keyString = await exportKeyToString(key);
      setState((prev) => ({
        ...prev,
        encryptionKey: keyString,
        isEncryptionEnabled: true,
        error: null,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao gerar chave de criptografia";
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, []);

  const handleImportRemoteEncryptionKey = useCallback(
    async (keyString: string) => {
      try {
        const key = await importKeyFromString(keyString);
        remoteEncryptionKeyRef.current = key;
        setState((prev) => ({
          ...prev,
          remoteEncryptionKey: keyString,
          error: null,
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro ao importar chave de criptografia remota";
        setState((prev) => ({ ...prev, error: errorMessage }));
      }
    },
    [],
  );

  const copyEncryptionKeyToClipboard = useCallback(() => {
    if (state.encryptionKey) {
      navigator.clipboard.writeText(state.encryptionKey);
      return true;
    }
    return false;
  }, [state.encryptionKey]);

  const initPeerConnection = useCallback(() => {
    try {
      const pc = createPeerConnection();
      pcRef.current = pc;

      onICECandidate(pc, setLocalSDP);

      setupOndatachannel(pc, (channel) => {
        channelRef.current = channel;
        setupChannelListeners(
          channel,
          () => setIsConnected(true),
          (meta) => setReceivedFileMeta(receiveStateRef.current, meta),
          async (data) => {
            const progress = await addReceivedChunk(
              receiveStateRef.current,
              data,
              remoteEncryptionKeyRef.current || undefined,
            );
            setState((prev) => ({ ...prev, receiveProgress: progress as number }));
          },
          () => {
            const blob = getReceivedFile(receiveStateRef.current);
            const filename =
              receiveStateRef.current.fileMeta?.name || "downloaded-file";
            downloadFile(blob, filename);
            receiveStateRef.current = initializeReceiveState();
          },
          {
            decryptionKey: remoteEncryptionKeyRef.current || undefined,
            onEncryptedChunkError: (error) => {
              console.error("Erro ao descriptografar chunk:", error);
              setError(`Erro ao descriptografar: ${error.message}`);
            },
          },
        );
      });

      const channel = createDataChannel(pc);
      channelRef.current = channel;

      setupChannelListeners(
        channel,
        () => setIsConnected(true),
        (meta) => setReceivedFileMeta(receiveStateRef.current, meta),
        async (data) => {
          const progress = await addReceivedChunk(
            receiveStateRef.current,
            data,
            remoteEncryptionKeyRef.current || undefined,
          );
          setState((prev) => ({ ...prev, receiveProgress: progress as number }));
        },
        () => {
          const blob = getReceivedFile(receiveStateRef.current);
          const filename =
            receiveStateRef.current.fileMeta?.name || "downloaded-file";
          downloadFile(blob, filename);
          receiveStateRef.current = initializeReceiveState();
        },
        {
          decryptionKey: remoteEncryptionKeyRef.current || undefined,
          onEncryptedChunkError: (error) => {
            console.error("Erro ao descriptografar chunk:", error);
            setError(`Erro ao descriptografar: ${error.message}`);
          },
        },
      );

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao inicializar conexão";
      setError(errorMessage);
    }
  }, [setLocalSDP, setError, setIsConnected]);

  const handleCreateOffer = useCallback(async () => {
    try {
      if (!pcRef.current) {
        initPeerConnection();
      }
      if (pcRef.current) {
        await createOffer(pcRef.current);
      }
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar offer";
      setError(errorMessage);
    }
  }, [initPeerConnection, setError]);

  const handleSetRemote = useCallback(async (remoteSDP: string) => {
    try {
      if (!pcRef.current) {
        initPeerConnection();
      }
      if (pcRef.current) {
        await setRemoteDescription(pcRef.current, remoteSDP);
      }
      setState((prev) => ({ ...prev, remoteSDP }));
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao configurar descrição remota";
      setError(errorMessage);
    }
  }, [initPeerConnection, setError]);

  const handleSendFile = useCallback(
    async (file: File) => {
      try {
        if (!isChannelReady(channelRef.current)) {
          setError("Canal não está aberto");
          return;
        }

        await sendFile(
          channelRef.current!,
          file,
          (progress) => {
            setState((prev) => ({ ...prev, sendProgress: progress }));
          },
          encryptionKeyRef.current || undefined,
        );
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao enviar arquivo";
        setError(errorMessage);
      }
    },
    [setError],
  );

  const reset = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.close();
    }
    if (pcRef.current) {
      pcRef.current.close();
    }

    pcRef.current = null;
    channelRef.current = null;
    receiveStateRef.current = initializeReceiveState();
    encryptionKeyRef.current = null;
    remoteEncryptionKeyRef.current = null;

    setState({
      localSDP: "",
      remoteSDP: "",
      sendProgress: 0,
      receiveProgress: 0,
      isConnected: false,
      error: null,
      encryptionKey: "",
      remoteEncryptionKey: "",
      isEncryptionEnabled: false,
    });
  }, []);

  return {
    ...state,
    initPeerConnection,
    createOffer: handleCreateOffer,
    setRemote: handleSetRemote,
    sendFile: handleSendFile,
    reset,
    generateEncryptionKey: handleGenerateEncryptionKey,
    importRemoteEncryptionKey: handleImportRemoteEncryptionKey,
    copyEncryptionKeyToClipboard,
  };
}
