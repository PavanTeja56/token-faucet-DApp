// src/utils/contracts.js
import { ethers } from "ethers";
import TokenArtifact from "./abis/YourToken.json";
import FaucetArtifact from "./abis/TokenFaucet.json";

const TokenABI = TokenArtifact.abi;
const FaucetABI = FaucetArtifact.abi;

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_ADDRESS;
const RPC_URL = import.meta.env.VITE_RPC_URL;

let provider;
let signer;

/* ---------- Provider & Signer ---------- */

export function getProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return provider;
}

export async function getSigner() {
  if (!window.ethereum) throw new Error("Wallet not found");
  const web3Provider = new ethers.BrowserProvider(window.ethereum);
  signer = await web3Provider.getSigner();
  return signer;
}

/* ---------- Contracts ---------- */

export async function getTokenContract(useSigner = false) {
  const p = useSigner ? await getSigner() : getProvider();
  return new ethers.Contract(TOKEN_ADDRESS, TokenABI, p);
}

export async function getFaucetContract(useSigner = false) {
  const p = useSigner ? await getSigner() : getProvider();
  return new ethers.Contract(FAUCET_ADDRESS, FaucetABI, p);
}

/* ---------- Read Functions ---------- */

export async function getBalance(address) {
  const token = await getTokenContract(false);
  const bal = await token.balanceOf(address);
  return bal.toString();
}

export async function canClaim(address) {
  const faucet = await getFaucetContract(false);
  return await faucet.canClaim(address);
}

export async function getRemainingAllowance(address) {
  const faucet = await getFaucetContract(false);
  const rem = await faucet.remainingAllowance(address);
  return rem.toString();
}

/* ✅ ADD THIS (FIXES lastClaimAt ERROR) */
export async function getLastClaimAt(address) {
  const faucet = await getFaucetContract(false);
  const ts = await faucet.lastClaimAt(address); // mapping getter
  return Number(ts);
}

/* ---------- Write Function ---------- */

export async function requestTokens() {
  const faucet = await getFaucetContract(true);
  const tx = await faucet.requestTokens();
  await tx.wait();
  return tx.hash;
}

/* ---------- Helpers ---------- */

export function getContractAddresses() {
  return {
    token: TOKEN_ADDRESS,
    faucet: FAUCET_ADDRESS,
  };
}

export async function listenToEvents(onClaimed) {
  const faucet = await getFaucetContract(false);
  faucet.on("TokensClaimed", (user, amount, timestamp) => {
    onClaimed?.(user, amount.toString(), timestamp.toString());
  });
}

/* ===== REQUIRED FOR EVALUATION ===== */
window.__EVAL__ = {
  connectWallet: async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  },
  requestTokens,
  getBalance,
  canClaim,
  getRemainingAllowance,
  getLastClaimAt,          // ✅ expose for cooldown
  getContractAddresses,
};