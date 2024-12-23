import * as archiver from 'archiver';
import { Readable } from 'stream';

export async function compressBufferToZip(fileBuffer: Buffer, filename: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } }); // High compression level
    const output: Buffer[] = [];

    // Listen to archive events
    archive.on('error', (err) => reject(err));
    archive.on('data', (chunk) => output.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(output)));

    // Pipe a buffer stream to the archive
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null); // Signal end of stream

    archive.append(bufferStream, { name: filename }); // Add buffer with a name
    archive.finalize();
  });
}

