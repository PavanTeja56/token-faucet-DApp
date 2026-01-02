const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFaucet", function () {
  let token, faucet;
  let owner, user1, user2;

  const FAUCET_AMOUNT = ethers.utils.parseEther("100");
  const MAX_CLAIM = ethers.utils.parseEther("1000");
  const DAY = 24 * 60 * 60;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
  
    // 1. Deploy TokenFaucet FIRST (temporary token address)
    const Faucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await Faucet.deploy(ethers.constants.AddressZero);
    await faucet.deployed();
  
    // 2. Deploy Token with faucet as minter
    const Token = await ethers.getContractFactory("YourToken");
    token = await Token.deploy(
      "DemoToken",
      "DMT",
      faucet.address
    );
    await token.deployed();
  
    // 3. Update faucet token reference (add this function if not present)
    await faucet.setToken(token.address);
  });

  it("deploys with correct initial state", async () => {
    expect(await faucet.isPaused()).to.equal(false);
  });

  it("allows successful token claim", async () => {
    await expect(faucet.connect(user1).requestTokens())
      .to.emit(faucet, "TokensClaimed");

    const balance = await token.balanceOf(user1.address);
    expect(balance).to.equal(FAUCET_AMOUNT);
  });

  it("reverts if claimed before cooldown", async () => {
    await faucet.connect(user1).requestTokens();

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Cannot claim yet");
  });

  it("allows claim after 24 hours", async () => {
    await faucet.connect(user1).requestTokens();

    await ethers.provider.send("evm_increaseTime", [DAY]);
    await ethers.provider.send("evm_mine");

    await expect(faucet.connect(user1).requestTokens())
      .to.emit(faucet, "TokensClaimed");
  });

  it("enforces lifetime limit", async () => {
    for (let i = 0; i < 10; i++) {
      await faucet.connect(user1).requestTokens();
      await ethers.provider.send("evm_increaseTime", [DAY]);
      await ethers.provider.send("evm_mine");
    }

    expect(await faucet.remainingAllowance(user1.address)).to.equal(0);

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Lifetime limit reached");
  });

  it("pauses and unpauses correctly", async () => {
    await faucet.connect(owner).setPaused(true);

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Faucet is paused");

    await faucet.connect(owner).setPaused(false);

    await expect(faucet.connect(user1).requestTokens())
      .to.emit(faucet, "TokensClaimed");
  });

  it("only admin can pause", async () => {
    await expect(
      faucet.connect(user1).setPaused(true)
    ).to.be.revertedWith("Not admin");
  });

  it("multiple users claim independently", async () => {
    await faucet.connect(user1).requestTokens();
    await faucet.connect(user2).requestTokens();

    expect(await token.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
    expect(await token.balanceOf(user2.address)).to.equal(FAUCET_AMOUNT);
  });
});