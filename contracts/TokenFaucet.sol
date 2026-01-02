// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

contract TokenFaucet {
    YourToken public token;

    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18;
    uint256 public constant COOLDOWN_TIME = 24 hours;
    uint256 public constant MAX_CLAIM_AMOUNT = 1000 * 10 ** 18;

    address public admin;
    bool public paused;

    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    constructor(address tokenAddress) {
        token = YourToken(tokenAddress);
        admin = msg.sender;
        paused = false;
    }

    function requestTokens() external {
        require(!paused, "Faucet is paused");
        require(remainingAllowance(msg.sender) >= FAUCET_AMOUNT,
        "Lifetime limit reached"
        );
        require(canClaim(msg.sender), "Cannot claim yet");

        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        token.mint(msg.sender, FAUCET_AMOUNT);

        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    function canClaim(address user) public view returns (bool) {
        if (paused) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return false;
        return true;
    }

    function remainingAllowance(address user) public view returns (uint256) {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) {
            return 0;
        }
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    function setPaused(bool _paused) external {
        require(msg.sender == admin, "Not admin");
        paused = _paused;
        emit FaucetPaused(_paused);
    }

    function isPaused() external view returns (bool) {
        return paused;
    }
    function setToken(address tokenAddress) external {
    require(msg.sender == admin, "Not admin");
    token = YourToken(tokenAddress);
}
}