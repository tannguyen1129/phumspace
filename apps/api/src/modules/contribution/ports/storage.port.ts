export interface StoredFileMetadata {
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
}

export interface StoragePort {
  saveFile(file: Express.Multer.File): Promise<StoredFileMetadata>;
  deleteFile(storageKey: string): Promise<void>;
  getFileStream(storageKey: string): Promise<NodeJS.ReadableStream | null>;
}
