import { generateText } from "ai"
import { gateway } from "@ai-sdk/gateway"
import { inspectMonero, type MoneroNetwork } from "./monero.js"

const SYSTEM_PROMPT = `You are Marvis, a careful Monero research assistant. Explain Monero clearly for developers and curious users. Be precise about privacy, wallets, daemon RPC, fees, confirmations, and consensus. Never invent chain data. You can use safe read-only live data supplied in the context. Never request seed phrases, private keys, passwords, or payment details. You do not send transactions or control wallets. If something is uncertain, say so.`

export async function answerQuestion(question: string, network: MoneroNetwork, rpcUrl?: string) {
  let liveContext = "No live chain lookup was needed."
  if (/height|block|sync|network|daemon|tx|transaction|confirm|hash/i.test(question)) {
    try {
      liveContext = JSON.stringify(await inspectMonero(question, network, rpcUrl))
    } catch (error) {
      liveContext = `Live lookup unavailable: ${error instanceof Error ? error.message : "unknown error"}`
    }
  }

  const result = await generateText({
    model: gateway("google/gemini-3-flash"),
    system: SYSTEM_PROMPT,
    prompt: `User question: ${question}\n\nRead-only Monero context:\n${liveContext}`,
    temperature: 0.2,
  })
  return result.text
}
