// Rate limiter em memória — melhor esforço por instância.
// Em deploys serverless com múltiplas réplicas, cada instância mantém seu próprio
// contador. Para rate limit centralizado em produção, use Redis (ex: Upstash).
const requestLog = new Map<string, number[]>()

/**
 * Verifica se a chave dada está dentro do limite de requisições.
 * @param key       Identificador único (ex: userId)
 * @param maxReqs   Número máximo de requisições permitidas no intervalo
 * @param windowMs  Janela de tempo em milissegundos (padrão: 1 min)
 * @returns true se a requisição for permitida, false se exceder o limite
 */
export function checkRateLimit(key: string, maxReqs = 20, windowMs = 60_000): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(key) ?? []).filter(t => t > now - windowMs)
  if (timestamps.length >= maxReqs) return false
  timestamps.push(now)
  requestLog.set(key, timestamps)
  return true
}
