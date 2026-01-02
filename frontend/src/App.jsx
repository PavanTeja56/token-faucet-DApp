// src/App.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  getBalance,
  canClaim,
  getRemainingAllowance,
  requestTokens,
  getLastClaimAt,
} from "./utils/contracts";
import { connectWallet, listenWalletChanges } from "./utils/wallet";

const COOLDOWN_TIME = 24 * 60 * 60; // 24 hours

export default function App() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState("0");
  const [eligible, setEligible] = useState(false);
  const [remaining, setRemaining] = useState("0");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData(addr) {
    if (!addr) return;

    const [bal, can, rem, last] = await Promise.all([
      getBalance(addr),
      canClaim(addr),
      getRemainingAllowance(addr),
      getLastClaimAt(addr),
    ]);

    // Convert wei → token
    setBalance(ethers.formatEther(bal));
    setRemaining(ethers.formatEther(rem));
    setEligible(can);

    if (last === 0) {
      setCooldown(0);
    } else {
      const now = Math.floor(Date.now() / 1000);
      const remainingTime = Math.max(
        last + COOLDOWN_TIME - now,
        0
      );
      setCooldown(remainingTime);
    }
  }

  async function handleConnect() {
    try {
      const addr = await connectWallet();
      setAddress(addr);
      await loadData(addr);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleClaim() {
    try {
      setLoading(true);
      setMessage("");

      await requestTokens();
      setMessage("✅ Tokens claimed successfully");

      await loadData(address);
    } catch (err) {
      setMessage(err.reason || err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    listenWalletChanges((addr) => {
      setAddress(addr);
      if (addr) loadData(addr);
    });
  }, []);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h2>Token Faucet</h2>

      {!address && (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}

      {address && (
        <>
          <p><b>Address:</b> {address}</p>
          <p><b>Balance:</b> {balance} tokens</p>
          <p><b>Remaining Allowance:</b> {remaining} tokens</p>
          <p>
            <b>Status:</b>{" "}
            {eligible ? "Eligible to claim" : "Not eligible"}
          </p>
          <p>
            <b>Cooldown:</b>{" "}
            {cooldown > 0 ? `${cooldown}s remaining` : "Ready"}
          </p>

          <button
            onClick={handleClaim}
            disabled={!eligible || cooldown > 0 || loading}
          >
            {loading ? "Claiming..." : "Claim Tokens"}
          </button>
        </>
      )}

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}