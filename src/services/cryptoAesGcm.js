const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(uint8) {
  let binary = '';
  const bytes = uint8 instanceof Uint8Array ? uint8 : new Uint8Array(uint8);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function fromBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function generateAesGcmKey() {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportAesKeyRaw(key) {
  const exported = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

export async function importAesKeyRaw(rawBytes) {
  return crypto.subtle.importKey(
    'raw',
    rawBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJsonWithAesGcm(payload) {
  const key = await generateAesGcmKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = encoder.encode(JSON.stringify(payload));

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return {
    algorithm: 'AES-GCM',
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(cipherBuffer)),
    key,
    rawKey: await exportAesKeyRaw(key),
  };
}

export async function decryptJsonWithAesGcm({ ciphertext, iv, rawKey }) {
  const key = await importAesKeyRaw(rawKey);
  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(iv) },
    key,
    fromBase64(ciphertext)
  );

  return JSON.parse(decoder.decode(new Uint8Array(plainBuffer)));
}

export const base64Utils = {
  toBase64,
  fromBase64,
};
