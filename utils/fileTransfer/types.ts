export interface FileMeta {
  type: "meta";
  name: string;
  size: number;
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
}
