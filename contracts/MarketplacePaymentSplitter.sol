// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MarketplacePaymentSplitter
 * @notice Automatically splits ERC20 token payments between treasury and artist
 * @dev Uses shares-based distribution ($10 treasury, $35 artist from $45 total)
 * 
 * For a $45 USD payment:
 * - Treasury: $10 (22.22%)
 * - Artist: $35 (77.78%)
 * 
 * Shares are calculated as:
 * - Treasury: 10 shares out of 45 total
 * - Artist: 35 shares out of 45 total
 */
contract MarketplacePaymentSplitter is Ownable {
    using SafeERC20 for IERC20;

    // Recipients
    address public treasury;
    address public artist;

    // Shares ($10 treasury, $35 artist = 10:35 ratio = 2:7 ratio)
    uint256 public constant TREASURY_SHARES = 10;
    uint256 public constant ARTIST_SHARES = 35;
    uint256 public constant TOTAL_SHARES = 45;

    // Track total received per token
    mapping(address => uint256) public totalReceived;
    mapping(address => uint256) public totalReleased;

    event PaymentReceived(address indexed token, uint256 amount, address indexed payer);
    event PaymentSplit(
        address indexed token,
        uint256 totalAmount,
        uint256 treasuryAmount,
        uint256 artistAmount
    );
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event ArtistUpdated(address indexed oldArtist, address indexed newArtist);
    event Withdrawn(address indexed token, address indexed to, uint256 amount);

    /**
     * @dev Constructor sets up the splitter with initial recipients
     * @param _treasury Address that receives $10 from each $45 payment (22.22%)
     * @param _artist Address that receives $35 from each $45 payment (77.78%)
     */
    constructor(address _treasury, address _artist) Ownable(msg.sender) {
        require(_treasury != address(0), "invalid treasury");
        require(_artist != address(0), "invalid artist");
        require(_treasury != _artist, "treasury and artist must differ");
        
        treasury = _treasury;
        artist = _artist;
    }

    /**
     * @dev Update treasury address (only owner)
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "invalid treasury");
        require(_treasury != artist, "treasury and artist must differ");
        
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    /**
     * @dev Update artist address (only owner)
     */
    function setArtist(address _artist) external onlyOwner {
        require(_artist != address(0), "invalid artist");
        require(_artist != treasury, "treasury and artist must differ");
        
        address oldArtist = artist;
        artist = _artist;
        emit ArtistUpdated(oldArtist, _artist);
    }

    /**
     * @dev Calculate treasury share of an amount
     */
    function calculateTreasuryShare(uint256 amount) public pure returns (uint256) {
        return (amount * TREASURY_SHARES) / TOTAL_SHARES;
    }

    /**
     * @dev Calculate artist share of an amount
     */
    function calculateArtistShare(uint256 amount) public pure returns (uint256) {
        return (amount * ARTIST_SHARES) / TOTAL_SHARES;
    }

    /**
     * @dev Split ERC20 token payment automatically
     * @param token ERC20 token address
     * @param amount Total amount to split
     */
    function splitPayment(address token, uint256 amount) external {
        require(token != address(0), "invalid token");
        require(amount > 0, "amount must be > 0");

        IERC20 tokenContract = IERC20(token);
        
        // Transfer tokens from caller to this contract
        tokenContract.safeTransferFrom(msg.sender, address(this), amount);

        // Calculate shares
        uint256 treasuryAmount = calculateTreasuryShare(amount);
        uint256 artistAmount = calculateArtistShare(amount);

        // Handle rounding: ensure total matches
        // If there's a remainder due to rounding, add it to artist
        uint256 total = treasuryAmount + artistAmount;
        if (total < amount) {
            artistAmount += (amount - total);
        } else if (total > amount) {
            // This shouldn't happen with proper math, but handle it safely
            artistAmount -= (total - amount);
        }

        // Update tracking
        totalReceived[token] += amount;

        // Distribute funds
        if (treasuryAmount > 0) {
            tokenContract.safeTransfer(treasury, treasuryAmount);
            totalReleased[token] += treasuryAmount;
        }

        if (artistAmount > 0) {
            tokenContract.safeTransfer(artist, artistAmount);
            totalReleased[token] += artistAmount;
        }

        emit PaymentReceived(token, amount, msg.sender);
        emit PaymentSplit(token, amount, treasuryAmount, artistAmount);
    }

    /**
     * @dev Emergency withdrawal function (only owner)
     * @param token Token address to withdraw
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "invalid recipient");
        require(amount > 0, "amount must be > 0");

        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance >= amount, "insufficient balance");

        tokenContract.safeTransfer(to, amount);
        emit Withdrawn(token, to, amount);
    }

    /**
     * @dev Get current balance of a token in the contract
     */
    function getBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @dev Get pending amounts for each recipient (if any)
     */
    function getPendingAmounts(address token) external view returns (uint256 treasuryPending, uint256 artistPending) {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) {
            return (0, 0);
        }
        
        treasuryPending = calculateTreasuryShare(balance);
        artistPending = calculateArtistShare(balance);
        
        // Handle rounding
        uint256 total = treasuryPending + artistPending;
        if (total < balance) {
            artistPending += (balance - total);
        }
    }

    /**
     * @dev Split tokens that were sent directly to the contract
     * This allows splitting tokens that were accidentally sent directly
     * instead of using splitPayment()
     * @param token ERC20 token address
     */
    function splitDirectTransfer(address token) external {
        require(token != address(0), "invalid token");

        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "no tokens to split");

        // Calculate shares
        uint256 treasuryAmount = calculateTreasuryShare(balance);
        uint256 artistAmount = calculateArtistShare(balance);

        // Handle rounding: ensure total matches
        uint256 total = treasuryAmount + artistAmount;
        if (total < balance) {
            artistAmount += (balance - total);
        } else if (total > balance) {
            artistAmount -= (total - balance);
        }

        // Update tracking
        totalReceived[token] += balance;

        // Distribute funds
        if (treasuryAmount > 0) {
            tokenContract.safeTransfer(treasury, treasuryAmount);
            totalReleased[token] += treasuryAmount;
        }

        if (artistAmount > 0) {
            tokenContract.safeTransfer(artist, artistAmount);
            totalReleased[token] += artistAmount;
        }

        emit PaymentReceived(token, balance, msg.sender);
        emit PaymentSplit(token, balance, treasuryAmount, artistAmount);
    }
}

