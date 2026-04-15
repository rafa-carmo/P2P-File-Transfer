"use client"

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, Send, Zap, Globe, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
 const [localSDP, setLocalSDP] = useState("");
  const [remoteSDP, setRemoteSDP] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sendProgress, setSendProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [connected, setConnected] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sendChannelRef = useRef<RTCDataChannel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const receivedSizeRef = useRef(0);
  const fileMetaRef = useRef<{ name: string; size: number } | null>(null);

  const CHUNK_SIZE = 16384;

  const setupDataChannel = useCallback((channel: RTCDataChannel) => {
    channel.binaryType = "arraybuffer";
    channel.onopen = () => {
      setConnected(true);
      toast.success("Conexão P2P estabelecida!");
    };
    channel.onclose = () => setConnected(false);
    channel.onmessage = (e) => {
      if (typeof e.data === "string") {
        const meta = JSON.parse(e.data);
        if (meta.type === "file-meta") {
          fileMetaRef.current = { name: meta.name, size: meta.size };
          receivedChunksRef.current = [];
          receivedSizeRef.current = 0;
          setIsReceiving(true);
          setReceiveProgress(0);
          toast.info(`Recebendo: ${meta.name}`);
        } else if (meta.type === "file-complete") {
          const blob = new Blob(receivedChunksRef.current);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileMetaRef.current?.name || "arquivo";
          a.click();
          URL.revokeObjectURL(url);
          setIsReceiving(false);
          setReceiveProgress(100);
          toast.success("Arquivo recebido com sucesso!");
        }
      } else {
        receivedChunksRef.current.push(e.data);
        receivedSizeRef.current += e.data.byteLength;
        if (fileMetaRef.current) {
          setReceiveProgress(Math.round((receivedSizeRef.current / fileMetaRef.current.size) * 100));
        }
      }
    };
  }, []);

  const createOffer = async () => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcRef.current = pc;

    const channel = pc.createDataChannel("file-transfer");
    sendChannelRef.current = channel;
    setupDataChannel(channel);

    const candidates: RTCIceCandidate[] = [];
    pc.onicecandidate = (e) => {
      if (e.candidate) candidates.push(e.candidate);
    };

    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "complete") {
        setLocalSDP(JSON.stringify({ sdp: pc.localDescription, candidates }));
        toast.success("Offer criada! Copie o SDP Local.");
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  };

  const setRemote = async () => {
    if (!remoteSDP.trim()) {
      toast.error("Cole o SDP remoto primeiro.");
      return;
    }

    try {
      const parsed = JSON.parse(remoteSDP);
      
      if (!pcRef.current) {
        // We are the answerer
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        pcRef.current = pc;

        pc.ondatachannel = (e) => {
          sendChannelRef.current = e.channel;
          setupDataChannel(e.channel);
        };

        const candidates: RTCIceCandidate[] = [];
        pc.onicecandidate = (e) => {
          if (e.candidate) candidates.push(e.candidate);
        };

        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === "complete") {
            setLocalSDP(JSON.stringify({ sdp: pc.localDescription, candidates }));
            toast.success("Answer criada! Copie o SDP Local.");
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(parsed.sdp));
        for (const c of parsed.candidates) await pc.addIceCandidate(new RTCIceCandidate(c));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
      } else {
        // We are the offerer setting the answer
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(parsed.sdp));
        for (const c of parsed.candidates) await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
        toast.success("SDP remoto definido!");
      }
    } catch {
      toast.error("SDP inválido. Verifique e tente novamente.");
    }
  };

  const sendFile = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo primeiro.");
      return;
    }
    const channel = sendChannelRef.current;
    if (!channel || channel.readyState !== "open") {
      toast.error("Conexão não está aberta.");
      return;
    }

    setIsSending(true);
    setSendProgress(0);

    channel.send(JSON.stringify({ type: "file-meta", name: selectedFile.name, size: selectedFile.size }));

    const buffer = await selectedFile.arrayBuffer();
    let offset = 0;

    const sendChunk = () => {
      while (offset < buffer.byteLength) {
        if (channel.bufferedAmount > CHUNK_SIZE * 8) {
          setTimeout(sendChunk, 50);
          return;
        }
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        channel.send(chunk);
        offset += chunk.byteLength;
        setSendProgress(Math.round((offset / buffer.byteLength) * 100));
      }
      channel.send(JSON.stringify({ type: "file-complete" }));
      setIsSending(false);
      toast.success("Arquivo enviado com sucesso!");
    };

    sendChunk();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(localSDP);
    toast.success("SDP copiado!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Zap className="w-8 h-8 text-primary animate-pulse-glow" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
            P2P <span className="text-primary">Transfer</span>
          </h1>
          <Zap className="w-8 h-8 text-primary animate-pulse-glow" />
        </div>
        <p className="text-muted-foreground font-mono text-sm">
          Transferência de arquivos via WebRTC • Sem servidor • Direto ao ponto
        </p>
        {connected && (
          <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-mono font-medium">Conectado</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={createOffer}
            className="flex-1 h-12 font-display font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all"
          >
            <Zap className="w-5 h-5 mr-2" />
            Criar Offer
          </Button>
          <Button
            onClick={setRemote}
            variant="outline"
            className="flex-1 h-12 font-display font-semibold text-base border-accent text-accent hover:bg-accent/10 shadow-glow-accent transition-all"
          >
            <Globe className="w-5 h-5 mr-2" />
            Definir Remote SDP
          </Button>
        </div>

        {/* SDP Local */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">SDP Local</label>
            {localSDP && (
              <button onClick={copyToClipboard} className="text-xs font-mono text-primary hover:text-primary/80 transition-colors">
                [copiar]
              </button>
            )}
          </div>
          <Textarea
            value={localSDP}
            readOnly
            placeholder="O SDP local aparecerá aqui após criar uma offer ou answer..."
            className="min-h-[120px] font-mono text-xs bg-muted border-border focus:border-primary focus:ring-primary/20 resize-none"
          />
        </div>

        {/* SDP Remoto */}
        <div className="space-y-2">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">SDP Remoto</label>
          <Textarea
            value={remoteSDP}
            onChange={(e) => setRemoteSDP(e.target.value)}
            placeholder="Cole o SDP remoto do outro peer aqui..."
            className="min-h-[120px] font-mono text-xs bg-muted border-border focus:border-accent focus:ring-accent/20 resize-none"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* File Upload */}
        <div className="space-y-4">
          <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Arquivo</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-all hover:bg-muted/50 group"
          >
            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
            {selectedFile ? (
              <div>
                <p className="text-foreground font-display font-medium">{selectedFile.name}</p>
                <p className="text-muted-foreground text-sm font-mono mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground font-mono text-sm">Clique para selecionar um arquivo</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            onClick={sendFile}
            disabled={!selectedFile || !connected || isSending}
            className="w-full h-12 font-display font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow disabled:opacity-40 disabled:shadow-none transition-all"
          >
            <Send className="w-5 h-5 mr-2" />
            {isSending ? "Enviando..." : "Enviar Arquivo"}
          </Button>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-muted-foreground">Envio</span>
              <span className="text-sm font-mono text-primary ml-auto">{sendProgress}%</span>
            </div>
            <Progress value={sendProgress} className="h-3 bg-muted [&>div]:bg-primary [&>div]:transition-all" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-accent" />
              <span className="text-sm font-mono text-muted-foreground">Recebimento</span>
              <span className="text-sm font-mono text-accent ml-auto">{receiveProgress}%</span>
            </div>
            <Progress value={receiveProgress} className="h-3 bg-muted [&>div]:bg-accent [&>div]:transition-all" />
          </div>
        </div>
      </div>

      <p className="mt-10 text-xs font-mono text-muted-foreground/50">WebRTC P2P • End-to-End</p>
    </div>

  );
}
