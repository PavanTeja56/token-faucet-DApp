// src/utils/wallet.js

let currentAccount = null;

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  currentAccount = accounts[0];
  return currentAccount;
}

export function getCurrentAccount() {
  return currentAccount;
}

export function listenWalletChanges(onChange) {
  if (!window.ethereum) return;

  window.ethereum.on("accountsChanged", (accounts) => {
    currentAccount = accounts.length ? accounts[0] : null;
    onChange?.(currentAccount);
  });

  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}

export function disconnectWallet() {
  currentAccount = null;
}