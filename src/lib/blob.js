import { put } from '@vercel/blob';

export async function uploadToBlob(file, fileName) {
  try {
    const blob = await put(fileName, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    return blob.url;
  } catch (error) {
    console.error('Erro ao fazer upload para Blob:', error);
    throw new Error('Falha no upload do arquivo');
  }
}