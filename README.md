# Marvis

A medium-sized TypeScript CLI research assistant for Monero.

Marvis answers Monero questions with an AI model and can optionally inspect live, **read-only** daemon data. It does not control wallets, sign transactions, move funds, or ask for private keys.

## Features

- Interactive terminal chat or one-shot questions
- Monero-focused system prompt with safety boundaries
- Mainnet, stagenet, and testnet support
- Read-only daemon lookups for network status and 64-character transaction IDs
- Custom RPC endpoint support for your own node

## Setup

Requires Node.js 22+ and a Vercel AI Gateway environment.

```bash
pnpm install
export AI_GATEWAY_API_KEY=your_key
pnpm marvis
```

Or ask one question:

```bash
pnpm marvis "What is a Monero view key?"
pnpm marvis --network stagenet "Is the network synchronized?"
pnpm marvis "Check transaction 0000000000000000000000000000000000000000000000000000000000000000"
```

Use your own daemon when possible:

```bash
pnpm marvis --rpc http://127.0.0.1:18081/json_rpc "What is the current height?"
```

## Safety

The first version intentionally exposes only read-only daemon RPC methods: `get_info` and `get_transactions`. Wallet RPC, seed phrases, private keys, transaction signing, and spending are out of scope.

## Project layout

- `src/cli.ts` — terminal interface and argument parsing
- `src/assistant.ts` — Marvis prompt and AI response generation
- `src/monero.ts` — typed, read-only Monero RPC client

## License

MIT
