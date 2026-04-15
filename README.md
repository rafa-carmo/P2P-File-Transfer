# 🚀 P2P File Transfer

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P-FF6B00?style=flat-square&logo=webrtc)](https://webrtc.org/)
[![Encryption](https://img.shields.io/badge/Encryption-AES--256--GCM-FF6B6B?style=flat-square&logo=lock)](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Transferência de arquivos P2P segura via WebRTC com criptografia end-to-end AES-256-GCM

[Features](#-features) • [Instalação](#-instalação) • [Como Usar](#-como-usar) • [Estrutura](#-estrutura-do-projeto) • [Contribuição](#-contribuição)

</div>

---

## 📋 Sobre o Projeto

**P2P File Transfer** é uma aplicação web moderna para transferência de arquivos diretamente entre dois peers usando WebRTC, eliminando a necessidade de um servidor centralizado. Todos os dados são criptografados end-to-end com AES-256-GCM, garantindo privacidade e segurança total.

### Por que usar?

- ✅ **Zero Servidor** - Não há servidor armazenando seus arquivos
- ✅ **Criptografia Militar** - AES-256-GCM oferece segurança de nível militar
- ✅ **Privacidade** - Apenas os peers com a chave correta podem acessar
- ✅ **Rápido** - Conexão direta P2P minimiza latência
- ✅ **Sem Limite de Tamanho** - Transferências em chunks, sem limite de arquivo
- ✅ **Código Aberto** - Totalmente audível e modificável

---

## ⚡ Features

### 🔗 Conectividade P2P

- Estabelecimento automático de conexão WebRTC
- Suporte a ICE candidates do Google STUN
- Sinalização SDP manual para máxima privacidade
- Reconexão automática em caso de falhas

### 🔐 Segurança

- **AES-256-GCM** - Padrão de encriptação NIST aprovado
- Chaves geradas localmente no navegador
- IV (Initialization Vector) aleatório por chunk
- Nenhum compartilhamento de chaves não-autorizado

### 📦 Transferência

- Chunks paralelos para melhor performance
- Progress bar em tempo real
- Buffer intelligente (64KB) para otimizar throughput
- Detecção automática de criptografia

### 🎨 Interface

- Design moderno e responsivo
- Tema claro/escuro automático
- Feedback visual em tempo real
- Interface intuitiva para iniciantes

---

## 🛠️ Tech Stack

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>

- **Next.js 16.2.1** - Framework React full-stack
- **React 19.2.4** - UI Components
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4** - Styling
- **Shadcn/UI** - UI Components
- **Lucide React** - Icons
- **Sonner** - Notifications

</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>

- **Next.js API Routes** - Serverless backend
- **Prisma 7.6.0** - Database ORM
- **SQLite** - Lightweight database

</td>
</tr>
<tr>
<td><strong>P2P & Segurança</strong></td>
<td>

- **WebRTC** - Conexão P2P nativa do navegador
- **Web Crypto API** - Criptografia nativa do browser
- **AES-256-GCM** - Algoritmo de encriptação

</td>
</tr>
</table>

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm, yarn, pnpm ou bun

### Passos

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/file-transfer.git
cd file-transfer
```

2. **Instale as dependências**

```bash
npm install
# ou
yarn install
pnpm install
bun install
```

3. **Configure variáveis de ambiente**

```bash
cp .env.example .env.local
```

4. **Execute o servidor de desenvolvimento**

```bash
npm run dev
# ou
yarn dev
pnpm dev
bun dev
```

5. **Abra no navegador**

```
http://localhost:3000
```

---

## 🚀 Como Usar

### Fluxo de Transferência

#### 1️⃣ **Lado do Remetente (Quem envia)**

```
1. Clique em "Iniciar como Remetente"
2. Copie o SDP Local gerado
3. Compartilhe com o receptor via email/chat/etc
4. Receba o SDP remoto do receptor e cole
5. Gere uma chave de criptografia
6. Compartilhe sua chave com o receptor
7. Cole a chave do receptor
8. Selecione o arquivo e envie
```

#### 2️⃣ **Lado do Receptor (Quem recebe)**

```
1. Clique em "Inicializar Conexão"
2. Copie o SDP Local gerado
3. Compartilhe com o remetente
4. Cole o SDP remoto do remetente
5. Gere uma chave de criptografia
6. Compartilhe sua chave com o remetente
7. Cole a chave do remetente
8. Aguarde o arquivo (download automático)
```

### Exemplo de Código

```typescript
import { useFileTransfer } from "@/utils/fileTransfer";

export function MyComponent() {
  const {
    localSDP,
    isConnected,
    isEncryptionEnabled,
    sendFile,
    generateEncryptionKey,
    importRemoteEncryptionKey,
  } = useFileTransfer();

  return (
    <div>
      <button onClick={generateEncryptionKey}>
        Gerar Chave
      </button>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) sendFile(file);
        }}
      />
    </div>
  );
}
```

---

## 📁 Estrutura do Projeto

```
file-transfer/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Página inicial
│   └── globals.css              # Estilos globais
│
├── components/
│   ├── FileTransferComponent.tsx # Componente principal
│   └── ui/                       # Componentes Shadcn/UI
│       ├── button.tsx
│       ├── progress.tsx
│       ├── textarea.tsx
│       └── sonner.tsx
│
├── utils/fileTransfer/           # Lógica de transferência
│   ├── index.ts                 # Exports
│   ├── types.ts                 # Type definitions
│   ├── constants.ts             # Constantes (CHUNK_SIZE, etc)
│   ├── encryption.ts            # Funções de criptografia AES-256-GCM
│   ├── keyManagement.ts         # Gerenciamento de chaves
│   ├── peerConnection.ts        # WebRTC RTCPeerConnection
│   ├── channel.ts               # RTCDataChannel setup
│   ├── signaling.ts             # SDP Offer/Answer
│   ├── sendFile.ts              # Lógica de envio
│   ├── receiveFile.ts           # Lógica de recepção
│   ├── download.ts              # Download dos arquivos
│   ├── useFileTransfer.ts       # Hook React principal
│   └── README.md                # Documentação detalhada
│
├── prisma/
│   ├── schema.prisma            # Schema do banco
│   └── migrations/              # Migrations
│
├── public/                       # Arquivos estáticos
├── package.json                 # Dependências
├── tsconfig.json               # Config TypeScript
├── next.config.ts              # Config Next.js
└── README.md                   # Este arquivo
```

---

## 🔐 Segurança & Criptografia

### Como Funciona a Criptografia

1. **Geração de Chave**: Cada peer gera uma chave AES-256 localmente
2. **Compartilhamento**: As chaves são trocadas manualmente via SDP (fora da band)
3. **Encriptação**: Cada chunk é encriptado com a chave + IV aleatório
4. **Descriptografia**: O receptor descriptografa com a chave recebida

### Fluxo de Dados

```
Arquivo Original
    ↓
[Dividido em chunks]
    ↓
[Cada chunk: Encriptado com AES-256-GCM + IV aleatório]
    ↓
[Transmitido via WebRTC DataChannel]
    ↓
[Receptor recebe chunk encriptado]
    ↓
[Descriptografa com a chave importada]
    ↓
[Reconstrói o arquivo original]
    ↓
Download Automático
```

### Padrões de Segurança

- ✅ **AES-256-GCM**: Encriptação simétrica de 256 bits com Galois/Counter Mode
- ✅ **Web Crypto API**: Criptografia nativa do navegador (sem bibliotecas)
- ✅ **IV Aleatório**: Novo IV para cada chunk previne padrões
- ✅ **Base64 Encoding**: Chaves compartilháveis via texto

---

## 📊 Performance

### Configuração Padrão

| Propriedade | Valor       | Descrição                      |
| ----------- | ----------- | ------------------------------ |
| CHUNK_SIZE  | 16 KB       | Tamanho de cada bloco          |
| MAX_BUFFER  | 64 KB       | Buffer máximo antes de pausar  |
| IV Length   | 12 bytes    | Initialization Vector para GCM |
| Algorithm   | AES-256-GCM | Encriptação                    |

### Benchmarks (Estimado)

- ✅ Arquivos pequenos (< 10 MB): 1-2 segundos
- ✅ Arquivos médios (10-100 MB): 10-30 segundos
- ✅ Arquivos grandes (> 100 MB): Depende da conexão de rede

---

## 🐛 Troubleshooting

### Problema: "Conexão não estabelecida"

**Solução:**

1. Verifique se ambos os peers estão em redes competíveis
2. Alguns firewalls podem bloquear WebRTC
3. Tente usar um VPN ou proxy

### Problema: "Erro ao descriptografar"

**Solução:**

1. Certifique-se de que importou a chave correta
2. A chave deve ser exatamente igual em ambos os lados
3. Verifique se a chave não foi modificada ao copiar

### Problema: "Arquivo não chegou"

**Solução:**

1. Verifique a conexão de rede
2. Veja se a barra de progresso alcançou 100%
3. Tente novamente com um arquivo menor

---

## 🤝 Contribuição

Adoramos contribuições! por favor siga estes passos:

### Como Contribuir

1. **Fork o projeto**

```bash
git clone https://github.com/seu-usuario/file-transfer.git
cd file-transfer
git checkout -b feature/MinhaFeature
```

2. **Faça suas alterações**

```bash
# Edite os arquivos
git add .
git commit -m "feat: descrição clara da mudança"
```

3. **Push para o branch**

```bash
git push origin feature/MinhaFeature
```

4. **Abra um Pull Request**

- Descreva suas mudanças em detalhes
- Explique por que essa mudança é necessária
- Referenças issues relacionados

### Diretrizes de Código

- ✅ Use TypeScript
- ✅ Mantenha a formatação com Prettier
- ✅ Escreva commits descritivos
- ✅ Teste suas mudanças localmente
- ✅ Atualize a documentação se necessário

### Áreas para Contribução

- 🔍 Melhorias de performance
- 🎨 Melhorias na UI/UX
- 🌐 Suporte a múltiplos idiomas
- 📈 Melhor gerenciamento de memória
- 🐛 Correção de bugs
- 📚 Documentação
- ♿ Acessibilidade
- 🔐 Segurança

### Reportar Bugs

Encontrou um bug? Abra uma issue descrevendo:

- Passos para reproduzir
- Comportamento esperado
- Comportamento atual
- Screenshots (se aplicável)
- Seu ambiente (OS, navegador, versão Node.js)

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

### Resumo MIT

Você é livre para:

- ✅ Usar comercialmente
- ✅ Modificar o código
- ✅ Distribuir
- ✅ Usar privadamente

Sob as condições:

- ⚠️ Incluir aviso de copyright
- ⚠️ Incluir cópia da licença

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para a comunidade open-source.

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework incrível
- [WebRTC](https://webrtc.org/) - Comunicação P2P
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - Criptografia nativa
- [Shadcn/UI](https://ui.shadcn.com/) - Componentes bonitos
- Comunidade open-source

---

<div align="center">

**[⬆ Voltar ao topo](#-p2p-file-transfer)**

Se este projeto foi útil, deixe uma ⭐ para mostrar seu apoio!

</div>
