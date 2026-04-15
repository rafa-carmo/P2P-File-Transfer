export interface FileMeta {
  type: "meta";
  name: string;
  size: number;
  encrypted?: boolean;
}

export interface FileEnd {
  type: "end";
}

export type DataChannelMessage = FileMeta | FileEnd;

export interface FileTransferState {
  localSDP: string;
  remoteSDP: string;
  sendProgress: number;
  receiveProgress: number;
  isConnected: boolean;
  error: string | null;
  encryptionKey: string; // Base64 encoded encryption key
  remoteEncryptionKey: string; // Base64 of remote's encryption key
  isEncryptionEnabled: boolean;
}
