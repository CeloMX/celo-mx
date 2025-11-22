// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/StorageSlot.sol";

/**
 * @title X402Token
 * @dev ERC20 token with EIP-3009-style transferWithAuthorization and owner-editable symbol/metadata.
 *      Name is fixed at deployment to preserve EIP-712 domain stability; symbol and metadata URI are mutable.
 */
contract X402Token is ERC20, Ownable {
    using ECDSA for bytes32;

    // Mutable token metadata (not part of EIP-712 domain)
    string private _symbolMutable;
    string private _metadataURI;

    // EIP-3009 authorization tracking
    enum AuthorizationState { Unused, Used, Canceled }
    mapping(bytes32 => AuthorizationState) public authorizationStates;

    // EIP-712 domain params (name fixed, version fixed)
    string public constant VERSION = "2";

    // EIP-712 typehash
    bytes32 private constant _TRANSFER_WITH_AUTHORIZATION_TYPEHASH = keccak256(
        "TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
    );

    event MetadataUpdated(string symbol, string metadataURI);
    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);
    event AuthorizationCanceled(address indexed authorizer, bytes32 indexed nonce);

    constructor(string memory name_, string memory symbol_, uint256 initialSupply_, address owner_) ERC20(name_, symbol_) Ownable(owner_) {
        _symbolMutable = symbol_;
        if (initialSupply_ > 0) {
            _mint(owner_, initialSupply_);
        }
    }

    function symbol() public view override returns (string memory) {
        return _symbolMutable;
    }

    function setSymbol(string memory newSymbol) external onlyOwner {
        _symbolMutable = newSymbol;
        emit MetadataUpdated(_symbolMutable, _metadataURI);
    }

    function metadataURI() external view returns (string memory) {
        return _metadataURI;
    }

    function setMetadataURI(string memory newURI) external onlyOwner {
        _metadataURI = newURI;
        emit MetadataUpdated(_symbolMutable, _metadataURI);
    }

    function version() external pure returns (string memory) {
        return VERSION;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp > validAfter, "authorization not yet valid");
        require(block.timestamp < validBefore, "authorization expired");
        require(authorizationStates[nonce] == AuthorizationState.Unused, "authorization reused or canceled");

        bytes32 structHash = keccak256(abi.encode(
            _TRANSFER_WITH_AUTHORIZATION_TYPEHASH,
            from,
            to,
            value,
            validAfter,
            validBefore,
            nonce
        ));

        bytes32 domainSeparator = _domainSeparator();
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        address signer = ECDSA.recover(digest, v, r, s);

        require(signer == from, "invalid signature");

        authorizationStates[nonce] = AuthorizationState.Used;
        emit AuthorizationUsed(from, nonce);

        _transfer(from, to, value);
    }

    function cancelAuthorization(bytes32 nonce) external {
        require(authorizationStates[nonce] == AuthorizationState.Unused, "authorization already used/canceled");
        authorizationStates[nonce] = AuthorizationState.Canceled;
        emit AuthorizationCanceled(msg.sender, nonce);
    }

    function _domainSeparator() internal view returns (bytes32) {
        bytes32 TYPE_HASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
        return keccak256(abi.encode(
            TYPE_HASH,
            keccak256(bytes(name())),
            keccak256(bytes(VERSION)),
            block.chainid,
            address(this)
        ));
    }
}
