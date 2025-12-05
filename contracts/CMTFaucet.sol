// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * CMT Faucet
 * - Holds CMT tokens (ERC20) and lets users claim a configurable amount
 * - Starts empty; deployer will transfer tokens later
 * - Deployer/owner can set faucet amount and cooldown
 */
contract CMTFaucet is Ownable {
    IERC20 public token;
    uint256 public faucetAmount; // amount dispensed per claim
    uint256 public cooldown; // seconds between claims per address
    mapping(address => uint256) public lastClaimed;

    event FaucetAmountUpdated(uint256 amount);
    event CooldownUpdated(uint256 cooldown);
    event TokenUpdated(address token);
    event Claimed(address indexed user, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "invalid token");
        token = IERC20(_token);
        faucetAmount = 0; // deployer will set later
        cooldown = 1 days; // default 24h
    }

    function setToken(address _token) external onlyOwner {
        require(_token != address(0), "invalid token");
        token = IERC20(_token);
        emit TokenUpdated(_token);
    }

    function setFaucetAmount(uint256 amount) external onlyOwner {
        faucetAmount = amount;
        emit FaucetAmountUpdated(amount);
    }

    function setCooldown(uint256 seconds_) external onlyOwner {
        cooldown = seconds_;
        emit CooldownUpdated(seconds_);
    }

    function balance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function claim() external {
        require(faucetAmount > 0, "faucet off");
        require(balance() >= faucetAmount, "insufficient faucet balance");
        uint256 last = lastClaimed[msg.sender];
        require(block.timestamp >= last + cooldown, "cooldown active");
        lastClaimed[msg.sender] = block.timestamp;
        bool ok = token.transfer(msg.sender, faucetAmount);
        require(ok, "transfer failed");
        emit Claimed(msg.sender, faucetAmount);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "invalid to");
        bool ok = token.transfer(to, amount);
        require(ok, "withdraw failed");
        emit Withdrawn(to, amount);
    }
}

