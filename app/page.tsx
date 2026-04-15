"use client"

import { Zap, Globe } from "lucide-react";
import { FileTransferComponent } from "@/components/FileTransferComponent";

export default function Home() {
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
      </div>

      <div className="w-full max-w-3xl">
        <FileTransferComponent />
      </div>

      <p className="mt-10 text-xs font-mono text-muted-foreground/50">WebRTC P2P • End-to-End</p>
    </div>
  );
}
