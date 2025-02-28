import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { StorageInterface } from './StorageInterface';
import { DefaultAzureCredential } from '@azure/identity';

export class AzureStorage implements StorageInterface {
  private containerName = process.env.AZURE_STORAGE_CONTAINER_NAME ?? 'expo-updates';
  private storageClient: ContainerClient;

  constructor() {
    const storageAccountUrl = process.env.AZURE_STORAGE_ACCOUNT_URL;
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    // Use connection string explicitly if provided,
    // otherwise fallback to DefaultAzureCredential which
    // will attempt to use the current runtime environment
    // to authenticate with Azure
    if (connectionString) {
      this.storageClient = BlobServiceClient.fromConnectionString(
        connectionString
      ).getContainerClient(this.containerName);
    } else if (storageAccountUrl) {
      this.storageClient = new BlobServiceClient(
        storageAccountUrl,
        new DefaultAzureCredential()
      ).getContainerClient(this.containerName);
    } else {
      throw new Error(
        'Expected to receive AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_URL'
      );
    }
  }

  async uploadFile(path: string, file: Buffer): Promise<string> {
    await this.storageClient.getBlockBlobClient(path).uploadData(file);

    return path;
  }

  async downloadFile(path: string): Promise<Buffer> {
    return await this.storageClient.getBlockBlobClient(path).downloadToBuffer();
  }

  async fileExists(path: string): Promise<boolean> {
    const result = await this.storageClient
      .listBlobsFlat({
        prefix: path,
      })
      .byPage({ maxPageSize: 1 });

    for await (const page of result) {
      if (page.segment.blobItems.length > 0) {
        return true;
      }
    }

    return false;
  }

  async listFiles(directory: string): Promise<
    {
      name: string;
      updated_at: string;
      created_at: string;
      metadata: { size: number; mimetype: string };
    }[]
  > {
    const files: {
      name: string;
      updated_at: string;
      created_at: string;
      metadata: { size: number; mimetype: string };
    }[] = [];

    for await (const response of this.storageClient
      .listBlobsFlat({
        prefix: directory,
      })
      .byPage({ maxPageSize: 50 })) {
      for (const blob of response.segment.blobItems) {
        files.push({
          name: blob.name.replace(directory, '').substring(1),
          updated_at: blob.properties.lastModified.toISOString(),
          created_at: blob.properties.lastModified.toISOString(),
          metadata: {
            size: blob.properties.contentLength ?? 0,
            mimetype: blob.properties.contentType ?? '',
          },
        });
      }
    }

    return files;
  }

  async listDirectories(directory: string): Promise<string[]> {
    const directories: string[] = [];

    for await (const response of this.storageClient
      .listBlobsByHierarchy('/', {
        prefix: directory,
      })
      .byPage({ maxPageSize: 50 })) {
      for (const segment of response.segment.blobPrefixes ?? []) {
        const withoutPrefix = segment.name.replace(directory, '');

        directories.push(withoutPrefix.substring(0, withoutPrefix.length - 1));
      }
    }

    return directories;
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    const copyOperation = await this.storageClient
      .getBlockBlobClient(destinationPath)
      .beginCopyFromURL(this.storageClient.getBlockBlobClient(sourcePath).url);

    await copyOperation.pollUntilDone();
  }
}
