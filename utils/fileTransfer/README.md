# File Transfer Utils

Sistema modular de transferência de arquivos via WebRTC adaptado para React.

## Estrutura

```
utils/fileTransfer/
├── constants.ts        # Constantes (CHUNK_SIZE, MAX_BUFFER, etc)
├── types.ts           # Tipos TypeScript
├── peerConnection.ts  # Funções de PeerConnection
├── channel.ts         # Configuração de DataChannel
├── signaling.ts       # Offer/Answer/SDP
├── sendFile.ts        # Lógica de envio
├── receiveFile.ts     # Lógica de recepção
├── download.ts        # Download de arquivo
├── useFileTransfer.ts # Hook React principal
└── index.ts           # Exportações
```

## Como Usar

### Importar o Hook

```tsx
import { useFileTransfer } from "@/utils/fileTransfer";
```

### Exemplo de Componente

```tsx
"use client";

import { useFileTransfer } from "@/utils/fileTransfer";

export function MyComponent() {
  const {
    localSDP,
    remoteSDP,
    sendProgress,
    receiveProgress,
    isConnected,
    error,
    initPeerConnection,
    createOffer,
    setRemote,
    sendFile,
    reset,
  } = useFileTransfer();

  // Seu código aqui...
}
```

## API do Hook

### Estado

- `localSDP: string` - SDP local para compartilhar
- `remoteSDP: string` - SDP remoto configurado
- `sendProgress: number` - Progresso do envio (0-100)
- `receiveProgress: number` - Progresso da recepção (0-100)
- `isConnected: boolean` - Se o canal está aberto
- `error: string | null` - Mensagem de erro se houver

### Métodos

- `initPeerConnection()` - Inicializa a PeerConnection
- `createOffer()` - Cria e envia um offer
- `setRemote(sdp: string)` - Define o SDP remoto
- `sendFile(file: File)` - Envia um arquivo
- `reset()` - Reseta a conexão

## Fluxo de Uso

### Como Remetente (quem envia)

1. Clique em "Iniciar como Remetente"
2. Copie o SDP local gerado
3. Compartilhe com o receptor
4. Cole o SDP remoto do receptor
5. Selecione um arquivo para enviar

### Como Receptor (quem recebe)

1. Clique em "Inicializar Conexão"
2. Copie o SDP local gerado
3. Compartilhe com o remetente
4. Cole o SDP remoto do remetente
5. Aguarde o arquivo ser enviado (será baixado automaticamente)

## Constantes

```typescript
export const CHUNK_SIZE = 16 * 1024; // 16 KB
export const MAX_BUFFER = 64 * 1024; // 64 KB
export const STUN_SERVER = "stun:stun.l.google.com:19302";
export const CHANNEL_NAME = "file";
```

Pode ajustar conforme necessário para sua aplicação.

## Tipos

```typescript
interface FileMeta {
  type: "meta";
  name: string;
  size: number;
}

interface FileTransferState {
  localSDP: string;
  remoteSDP: string;
  sendProgress: number;
  receiveProgress: number;
  isConnected: boolean;
  error: string | null;
}
```

## Notas

- O protocolo usa `RTCPeerConnection` e `RTCDataChannel` nativos do navegador
- Todos os chunks são enviados ou recebidos em binário (ArrayBuffer)
- Metadados são enviados em JSON antes do arquivo
- Suporta arquivos de qualquer tamanho (envia em chunks)
- O download é automático ao receber um arquivo completo
- Erros são capturados e armazenados no estado
