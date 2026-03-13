// Criptografia simétrica para guardar API keys dos usuários no banco.
// Usa AES-256-GCM via Web Crypto API (disponível no Edge Runtime da Vercel).

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

async function getKey(): Promise<CryptoKey> {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY deve ter no mínimo 32 caracteres. Verifique as variáveis de ambiente.')
  }
  const raw = Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf-8')
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

export async function encrypt(text: string): Promise<string> {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(text)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  const result = new Uint8Array(iv.byteLength + ciphertext.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(ciphertext), iv.byteLength)
  return Buffer.from(result).toString('base64')
}

export async function decrypt(data: string): Promise<string> {
  const key = await getKey()
  const bytes = Buffer.from(data, 'base64')
  const iv = bytes.slice(0, 12)
  const ciphertext = bytes.slice(12)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new TextDecoder().decode(decrypted)
}
