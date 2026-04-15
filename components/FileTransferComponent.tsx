"use client";

import { useRef } from "react";
import { useFileTransfer } from "@/utils/fileTransfer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export function FileTransferComponent() {
  const {
    localSDP,
    remoteSDP,
    sendProgress,
    receiveProgress,
    isConnected,
    error,
    encryptionKey,
    remoteEncryptionKey,
    isEncryptionEnabled,
    initPeerConnection,
    createOffer,
    setRemote,
    sendFile,
    reset,
    generateEncryptionKey,
    importRemoteEncryptionKey,
    copyEncryptionKeyToClipboard,
  } = useFileTransfer();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const remoteSDPRef = useRef<HTMLTextAreaElement>(null);
  const remoteEncryptionKeyRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await sendFile(file);
    }
  };

  const handleSetRemote = async () => {
    const sdp = remoteSDPRef.current?.value;
    if (sdp) {
      await setRemote(sdp);
    }
  };

  const handleImportRemoteKey = async () => {
    const keyString = remoteEncryptionKeyRef.current?.value;
    if (keyString) {
      await importRemoteEncryptionKey(keyString);
    }
  };

  const handleCopyLocalSDP = () => {
    navigator.clipboard.writeText(localSDP);
  };

  const handleCopyEncryptionKey = () => {
    if (copyEncryptionKeyToClipboard()) {
      // Show feedback
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">WebRTC File Transfer</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isConnected}
              disabled
              className="w-4 h-4"
            />
            <span>Conectado: {isConnected ? "Sim" : "Não"}</span>
          </label>
        </div>
      </div>

      {/* Seção de Sinalização */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-xl font-semibold">Sinalização (SDP)</h3>

        <div className="space-y-2">
          <Button
            onClick={() => {
              initPeerConnection();
              createOffer();
            }}
            className="w-full"
          >
            Iniciar como Remetente
          </Button>

          <Button
            onClick={initPeerConnection}
            variant="outline"
            className="w-full"
          >
            Inicializar Conexão
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">SDP Local:</label>
          <Textarea
            value={localSDP}
            readOnly
            rows={6}
            className="font-mono text-xs"
          />
          <Button onClick={handleCopyLocalSDP} variant="outline" className="w-full">
            Copiar SDP Local
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">SDP Remoto:</label>
          <Textarea
            ref={remoteSDPRef}
            placeholder="Cole o SDP remoto aqui"
            rows={6}
            className="font-mono text-xs"
          />
          <Button onClick={handleSetRemote} variant="outline" className="w-full">
            Configurar SDP Remoto
          </Button>
        </div>
      </div>

      {/* Seção de Criptografia */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-xl font-semibold">🔐 Criptografia P2P</h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium mb-2">Sobre criptografia:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Criptografa o arquivo antes de enviar</li>
            <li>Apenas com a chave correta é possível descriptografar</li>
            <li>Ambos os lados precisam compartilhar suas chaves</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Button
            onClick={generateEncryptionKey}
            className="w-full"
            variant={isEncryptionEnabled ? "secondary" : "default"}
          >
            {isEncryptionEnabled
              ? "✓ Chave de Criptografia Gerada"
              : "Gerar Chave de Criptografia"}
          </Button>
        </div>

        {encryptionKey && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Sua Chave de Criptografia:</label>
            <Textarea
              value={encryptionKey}
              readOnly
              rows={3}
              className="font-mono text-xs bg-gray-50"
            />
            <Button
              onClick={handleCopyEncryptionKey}
              variant="outline"
              className="w-full"
            >
              Copiar Chave de Criptografia
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium">Chave de Criptografia Remota:</label>
          <Textarea
            ref={remoteEncryptionKeyRef}
            placeholder="Cole a chave de criptografia do outro peer aqui"
            rows={3}
            className="font-mono text-xs"
          />
          <Button
            onClick={handleImportRemoteKey}
            variant="outline"
            className="w-full"
            disabled={!remoteEncryptionKeyRef.current?.value}
          >
            Importar Chave Remota
          </Button>
        </div>

        {remoteEncryptionKey && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-sm text-green-800">
            ✓ Chave remota importada com sucesso
          </div>
        )}
      </div>

      {/* Seção de Envio */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-xl font-semibold">
          Enviar Arquivo {isEncryptionEnabled && "🔒"}
        </h3>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={!isConnected}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {sendProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Envio:</span>
              <span>{Math.round(sendProgress)}%</span>
            </div>
            <Progress value={sendProgress} className="w-full" />
          </div>
        )}
      </div>

      {/* Seção de Recepção */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-xl font-semibold">Receber Arquivo</h3>

        {receiveProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da Recepção:</span>
              <span>{Math.round(receiveProgress)}%</span>
            </div>
            <Progress value={receiveProgress} className="w-full" />
          </div>
        )}
      </div>

      {/* Seção de Ações */}
      <div className="space-y-2 border-t pt-6">
        <Button onClick={reset} variant="destructive" className="w-full">
          Resetar Conexão
        </Button>
      </div>
    </div>
  );
}
