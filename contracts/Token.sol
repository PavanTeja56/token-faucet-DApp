// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YourToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18;
    address public minter;

    constructor(
        string memory name_,
        string memory symbol_,
        address faucet_
    ) ERC20(name_, symbol_) {
        minter = faucet_;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Not faucet");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}