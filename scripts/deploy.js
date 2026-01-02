// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy Faucet FIRST with dummy token address
  const FaucetFactory = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await FaucetFactory.deploy(
    hre.ethers.constants.AddressZero
  );
  await faucet.deployed();

  // 2. Deploy Token with faucet as minter
  const TokenFactory = await hre.ethers.getContractFactory("YourToken");
  const token = await TokenFactory.deploy(
    "DemoToken",
    "DMT",
    faucet.address
  );
  await token.deployed();

  // 3. Set token address in faucet
  await faucet.setToken(token.address);

  console.log("Token deployed at:", token.address);
  console.log("Faucet deployed at:", faucet.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});