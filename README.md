# 🚀 P2P File Transfer

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P-FF6B00?style=flat-square&logo=webrtc)](https://webrtc.org/)
[![Encryption](https://img.shields.io/badge/Encryption-AES--256--GCM-FF6B6B?style=flat-square&logo=lock)](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Secure P2P file transfer via WebRTC with end-to-end AES-256-GCM encryption

[Features](#-features) • [Installation](#-installation) • [How to Use](#-how-to-use) • [Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

## 📋 About the Project

**P2P File Transfer** is a modern web application for transferring files directly between two peers using WebRTC, eliminating the need for a centralized server. All data is encrypted end-to-end with AES-256-GCM, ensuring total privacy and security.

### Why use it?

- ✅ **Zero Server** - No server storing your files
- ✅ **Military Grade Encryption** - AES-256-GCM provides military-level security
- ✅ **Privacy** - Only peers with the correct key can access
- ✅ **Fast** - Direct P2P connection minimizes latency
- ✅ **No Size Limit** - Transfers in chunks, no file size limit
- ✅ **Open Source** - Fully auditable and modifiable

---

## ⚡ Features

### 🔗 P2P Connectivity

- Automatic WebRTC connection establishment
- Google STUN ICE candidates support
- Manual SDP signaling for maximum privacy
- Automatic reconnection on failures

### 🔐 Security

- **AES-256-GCM** - NIST approved encryption standard
- Keys generated locally in the browser
- Random IV (Initialization Vector) per chunk
- No unauthorized key sharing

### 📦 Transfer

- Parallel chunks for better performance
- Real-time progress bar
- Intelligent buffer (64KB) to optimize throughput
- Automatic encryption detection

### 🎨 Interface

- Modern and responsive design
- Automatic light/dark theme
- Real-time visual feedback
- Beginner-friendly interface

---

## 🛠️ Tech Stack

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>

- **Next.js 16.2.1** - Full-stack React framework
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
- **SQLite** - Lightweight database

</td>
</tr>
<tr>
<td><strong>P2P & Security</strong></td>
<td>

- **WebRTC** - Native P2P connection in browser
- **Web Crypto API** - Native browser cryptography
- **AES-256-GCM** - Encryption algorithm

</td>
</tr>
</table>

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm or bun

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/seu-usuario/file-transfer.git
cd file-transfer
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
pnpm install
bun install
```

3. **Configure environment variables**

```bash
cp .env.example .env.local
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
pnpm dev
bun dev
```

5. **Open in browser**

```
http://localhost:3000
```

---

## 🚀 How to Use

### Transfer Flow

#### 1️⃣ **Sender Side (Who sends)**

```
1. Click "Start as Sender"
2. Copy the generated Local SDP
3. Share with receiver via email/chat/etc
4. Receive the receiver's remote SDP and paste it
5. Generate an encryption key
6. Share your key with the receiver
7. Paste the receiver's key
8. Select the file and send
```

#### 2️⃣ **Receiver Side (Who receives)**

```
1. Click "Initialize Connection"
2. Copy the generated Local SDP
3. Share with sender
4. Paste the sender's remote SDP
5. Generate an encryption key
6. Share your key with the sender
7. Paste the sender's key
8. Await the file (automatic download)
```

### Code Example

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
        Generate Key
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

## 📁 Project Structure

```
file-transfer/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Main layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
│
├── components/
│   ├── FileTransferComponent.tsx # Main component
│   └── ui/                       # Shadcn/UI Components
│       ├── button.tsx
│       ├── progress.tsx
│       ├── textarea.tsx
│       └── sonner.tsx
│
├── utils/fileTransfer/           # Lógica de transferência
│   ├── index.ts                 # Exports
│   ├── types.ts                 # Type definitions
│   ├── constants.ts             # Constants (CHUNK_SIZE, etc)
│   ├── encryption.ts            # AES-256-GCM encryption functions
│   ├── keyManagement.ts         # Key management
│   ├── peerConnection.ts        # WebRTC RTCPeerConnection
│   ├── channel.ts               # RTCDataChannel setup
│   ├── signaling.ts             # SDP Offer/Answer
│   ├── sendFile.ts              # Send logic
│   ├── receiveFile.ts           # Receive logic
│   ├── download.ts              # File download
│   ├── useFileTransfer.ts       # Main React hook
│   └── README.md                # Detailed documentation
│
├── __tests__/                    # Jest test suites
│   ├── app/
│   │   └── page.test.tsx        # Home page tests
│   └── utils/fileTransfer/
│       ├── constants.test.ts
│       ├── encryption.test.ts
│       ├── keyManagement.test.ts
│       ├── download.test.ts
│       ├── channel.test.ts
│       ├── receiveFile.test.ts
│       ├── sendFile.test.ts
│       ├── peerConnection.test.ts
│       └── signaling.test.ts
│
├── public/                       # Static files
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
└── README.md                   # This file
```

---

## 🔐 Security & Encryption

### How Encryption Works

1. **Key Generation**: Each peer generates an AES-256 key locally
2. **Key Sharing**: Keys are exchanged manually via SDP (out of band)
3. **Encryption**: Each chunk is encrypted with the key + random IV
4. **Decryption**: Receiver decrypts with the received key

### Data Flow

```
Original File
    ↓
[Split into chunks]
    ↓
[Each chunk: Encrypted with AES-256-GCM + random IV]
    ↓
[Transmitted via WebRTC DataChannel]
    ↓
[Receiver receives encrypted chunk]
    ↓
[Decrypts with imported key]
    ↓
[Reconstructs original file]
    ↓
Automatic Download
```

### Security Standards

- ✅ **AES-256-GCM**: 256-bit symmetric encryption with Galois/Counter Mode
- ✅ **Web Crypto API**: Native browser cryptography (no libraries)
- ✅ **Random IV**: New IV per chunk prevents patterns
- ✅ **Base64 Encoding**: Shareable keys via text

---

## 📊 Performance

### Default Configuration

| Property   | Value       | Description                |
| ---------- | ----------- | -------------------------- |
| CHUNK_SIZE | 16 KB       | Size of each block         |
| MAX_BUFFER | 64 KB       | Max buffer before pause    |
| IV Length  | 12 bytes    | Initialization Vector size |
| Algorithm  | AES-256-GCM | Encryption algorithm       |

### Benchmarks (Estimated)

- ✅ Small files (< 10 MB): 1-2 seconds
- ✅ Medium files (10-100 MB): 10-30 seconds
- ✅ Large files (> 100 MB): Depends on network connection

---

## 🐛 Troubleshooting

### Issue: "Connection not established"

**Solution:**

1. Check if both peers are on compatible networks
2. Some firewalls may block WebRTC
3. Try using a VPN or proxy

### Issue: "Decryption error"

**Solution:**

1. Make sure you imported the correct key
2. The key must be exactly the same on both sides
3. Check if the key wasn't modified when copying

### Issue: "File did not arrive"

**Solution:**

1. Check your network connection
2. See if the progress bar reached 100%
3. Try again with a smaller file

---

## � Testing

The project uses **Jest** with **React Testing Library** for unit and component tests.

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

### Test Coverage

| Module                              | What's Tested                                                            |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `app/page.tsx`                      | Rendering, heading, subtitle, footer, child components                   |
| `utils/fileTransfer/constants`      | Values and relationships between constants                               |
| `utils/fileTransfer/encryption`     | Key generation, export/import, AES-256-GCM encrypt/decrypt, JSON helpers |
| `utils/fileTransfer/keyManagement`  | Key creation, key-exchange message, `isValidKeyString`                   |
| `utils/fileTransfer/download`       | Object URL lifecycle, anchor attributes                                  |
| `utils/fileTransfer/channel`        | Channel readiness, message routing, `ondatachannel` setup                |
| `utils/fileTransfer/receiveFile`    | State initialization, chunk accumulation, progress, blob assembly        |
| `utils/fileTransfer/sendFile`       | Progress calculation, metadata, chunked sending, multi-chunk files       |
| `utils/fileTransfer/peerConnection` | RTCPeerConnection creation, ICE candidate callback                       |
| `utils/fileTransfer/signaling`      | `createOffer`, `createAnswer`, `setRemoteDescription`                    |

### Test Setup

The setup file (`jest.setup.ts`) provides polyfills required in the jsdom environment:

- **`TextEncoder` / `TextDecoder`** — from `node:util`
- **`globalThis.crypto`** — from `node:crypto`, exposes `crypto.subtle` for Web Crypto API tests
- **`Blob.prototype.arrayBuffer`** — polyfilled via `FileReader` for file chunk tests

---

## �🤝 Contributing

We love contributions! Please follow these steps:

### How to Contribute

1. **Fork the project**

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

### Report Bugs

Found a bug? Open an issue describing:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, browser, Node.js version)

---

## � Deployment

### GitHub Pages Setup

This project is configured for automatic deployment to GitHub Pages using GitHub Actions. For complete setup instructions, see [GITHUB_PAGES_DEPLOYMENT.md](GITHUB_PAGES_DEPLOYMENT.md).

### GitHub Configuration Files

The repository includes professional GitHub configuration files:

- **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)** - Automated CI/CD pipeline
- **[.github/dependabot.yml](.github/dependabot.yml)** - Automatic dependency updates
- **[.github/CODEOWNERS](.github/CODEOWNERS)** - Code review assignments
- **[.github/pull_request_template.md](.github/pull_request_template.md)** - PR guidelines
- **[.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/)** - Issue templates

For detailed explanation of all configuration files, see [GITHUB_CONFIG_GUIDE.md](GITHUB_CONFIG_GUIDE.md).

### Quick Deploy

1. Push to `main` branch:

```bash
git push origin main
```

2. Workflow automatically:
   - Tests on Node 18.x and 20.x
   - Builds the application
   - Deploys to GitHub Pages

3. View progress in **Actions** tab

4. Access your site at `https://username.github.io/file-transfer`

---

## �📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

You are free to:

- ✅ Use commercially
- ✅ Modify the code
- ✅ Distribute
- ✅ Use privately

Under the conditions:

- ⚠️ Include copyright notice
- ⚠️ Include copy of the license

---

## 👨‍💻 Author

Developed with ❤️ for the open-source community.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - Amazing framework
- [WebRTC](https://webrtc.org/) - P2P communication
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - Native encryption
- [Shadcn/UI](https://ui.shadcn.com/) - Beautiful components
- Open-source community

---

<div align="center">

**[⬆ Back to top](#-p2p-file-transfer)**

If this project was useful, leave a ⭐ to show your support!

</div>
