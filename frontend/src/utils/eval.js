// src/utils/eval.js
import {
    getBalance,
    canClaim,
    getRemainingAllowance,
    requestTokens,
    getContractAddresses,
  } from "./contracts";
  
  // REQUIRED evaluation interface
  window.__EVAL__ = {
    connectWallet: async () => {
      if (!window.ethereum) {
        throw new Error("Wallet not found");
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!accounts || !accounts.length) {
        throw new Error("Wallet connection failed");
      }
      return accounts[0]; // string
    },
  
    requestTokens: async () => {
      try {
        const txHash = await requestTokens();
        return txHash; // string
      } catch (err) {
        throw new Error(err.reason || err.message || "Request failed");
      }
    },
  
    getBalance: async (address) => {
      try {
        return await getBalance(address); // string (base units)
      } catch (err) {
        throw new Error(err.message || "Balance query failed");
      }
    },
  
    canClaim: async (address) => {
      try {
        return await canClaim(address); // boolean
      } catch (err) {
        throw new Error(err.message || "Eligibility check failed");
      }
    },
  
    getRemainingAllowance: async (address) => {
      try {
        return await getRemainingAllowance(address); // string
      } catch (err) {
        throw new Error(err.message || "Allowance query failed");
      }
    },
  
    getContractAddresses: async () => {
      return getContractAddresses(); // { token, faucet }
    },
  };