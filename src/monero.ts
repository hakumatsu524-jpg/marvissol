export type MoneroNetwork = "mainnet" | "stagenet" | "testnet"

const DEFAULT_RPC: Record<MoneroNetwork, string> = {
  mainnet: "https://node.moneroworld.com:18089/json_rpc",
  stagenet: "https://stagenet.community.rino.io/json_rpc",
  testnet: "https://node.moneroworld.com:28089/json_rpc",
}

export function getRpcUrl(network: MoneroNetwork, override?: string) {
  return override ?? DEFAULT_RPC[network]
}

async function rpc<T>(url: string, method: string, params?: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "marvis", method, params }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Monero RPC returned HTTP ${response.status}`)
  const payload = (await response.json()) as { result?: T; error?: { message?: string } }
  if (payload.error) throw new Error(payload.error.message ?? "Monero RPC request failed")
  if (!payload.result) throw new Error("Monero RPC returned no result")
  return payload.result
}

export async function getNetworkInfo(network: MoneroNetwork, rpcUrl?: string) {
  const result = await rpc<{ height: number; target_height: number; difficulty: number; synchronized: boolean }>(getRpcUrl(network, rpcUrl), "get_info")
  return { network, ...result }
}

export async function getTransaction(txid: string, network: MoneroNetwork, rpcUrl?: string) {
  const result = await rpc<{ txs: Array<{ tx_hash: string; block_height?: number; confirmations?: number; double_spend_seen?: boolean; unlock_time?: number }> }>(getRpcUrl(network, rpcUrl), "get_transactions", { txs_hashes: [txid], decode_as_json: true })
  return { network, transaction: result.txs[0] ?? null }
}

export async function inspectMonero(query: string, network: MoneroNetwork, rpcUrl?: string) {
  const normalized = query.trim()
  if (/^[0-9a-fA-F]{64}$/.test(normalized)) return getTransaction(normalized, network, rpcUrl)
  return getNetworkInfo(network, rpcUrl)
}
