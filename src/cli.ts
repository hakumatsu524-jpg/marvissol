#!/usr/bin/env node
import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { answerQuestion } from "./assistant.js"
import type { MoneroNetwork } from "./monero.js"

const args = process.argv.slice(2)
const networkIndex = args.indexOf("--network")
const network = (networkIndex >= 0 ? args[networkIndex + 1] : "mainnet") as MoneroNetwork
const rpcIndex = args.indexOf("--rpc")
const rpcUrl = rpcIndex >= 0 ? args[rpcIndex + 1] : undefined
const question = args.filter((arg, index) => arg !== "--network" && arg !== "--rpc" && index !== networkIndex + 1 && index !== rpcIndex + 1).join(" ").trim()

if (!["mainnet", "stagenet", "testnet"].includes(network)) {
  console.error("Network must be mainnet, stagenet, or testnet.")
  process.exit(1)
}

console.log("\n  MARVIS — Monero AI research assistant")
console.log(`  ${network} | read-only RPC | no wallet spending\n`)

async function ask(text: string) {
  if (!text.trim()) return
  try {
    console.log(`\n${await answerQuestion(text, network, rpcUrl)}\n`)
  } catch (error) {
    console.error(`\nMarvis error: ${error instanceof Error ? error.message : "unknown error"}\n`)
  }
}

async function main() {
  if (question) {
    await ask(question)
    return
  }

  const rl = createInterface({ input, output })
  console.log("Ask about Monero, blocks, transactions, wallets, or development. Type exit to quit.\n")
  while (true) {
    const text = await rl.question("you> ")
    if (["exit", "quit"].includes(text.trim().toLowerCase())) break
    await ask(text)
  }
  rl.close()
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unexpected Marvis error")
  process.exitCode = 1
})
