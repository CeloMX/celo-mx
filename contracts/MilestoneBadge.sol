// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MilestoneBadge is ERC1155, Ownable {
    mapping(address => mapping(uint256 => bool)) public claimed;
    
    constructor(string memory uri_) ERC1155(uri_) Ownable(msg.sender) {}
    
    function claim(uint256 tokenId) external {
        require(!claimed[msg.sender][tokenId], "Already claimed");
        claimed[msg.sender][tokenId] = true;
        _mint(msg.sender, tokenId, 1, "");
    }
}
