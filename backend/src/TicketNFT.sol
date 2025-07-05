// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITicketNFT.sol";

/**
 * @title TicketNFT
 * @dev NFT contract for event tickets with burn functionality
 * Each NFT represents a ticket that can be permanently destroyed when used
 */
contract TicketNFT is ERC721, ERC721Enumerable, Ownable, ITicketNFT {
    // Token counter
    uint256 private _currentTokenId;
    
    // Event contract that owns this NFT contract
    address public eventContract;
    
    // Mapping from token ID to ticket metadata
    mapping(uint256 => TicketMetadata) private _ticketMetadata;
    
    // Mapping to track burned tokens
    mapping(uint256 => bool) private _burnedTokens;
    
    // Base URI for metadata
    string private _baseTokenURI;

    // Errors
    error OnlyEventContract();
    error TokenNotFound();
    error TokenAlreadyBurned();

    modifier onlyEventContract() {
        if (msg.sender != eventContract) revert OnlyEventContract();
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _eventContract,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        eventContract = _eventContract;
        _baseTokenURI = baseURI;
        _currentTokenId = 1; // Start from token ID 1
    }

    /**
     * @dev Mint a new ticket NFT
     * @param to Address to mint the NFT to
     * @param tierId Ticket tier ID
     * @return tokenId The minted token ID
     */
    function mint(address to, uint256 tierId) external onlyEventContract returns (uint256) {
        uint256 tokenId = _currentTokenId;
        _currentTokenId++;

        _safeMint(to, tokenId);

        // Set ticket metadata
        _ticketMetadata[tokenId] = TicketMetadata({
            tierId: tierId,
            originalOwner: to,
            currentOwner: to,
            mintTimestamp: block.timestamp,
            burnTimestamp: 0,
            burnedBy: address(0),
            isUsed: false
        });

        emit TicketMinted(to, tokenId, tierId);
        return tokenId;
    }

    /**
     * @dev Burn a ticket NFT permanently
     * @param tokenId Token ID to burn
     */
    function burn(uint256 tokenId) external onlyEventContract {
        if (_ownerOf(tokenId) == address(0)) revert TokenNotFound();
        if (_burnedTokens[tokenId]) revert TokenAlreadyBurned();

        // Mark as burned
        _burnedTokens[tokenId] = true;
        _ticketMetadata[tokenId].isUsed = true;
        _ticketMetadata[tokenId].burnTimestamp = block.timestamp;
        _ticketMetadata[tokenId].burnedBy = tx.origin; // The staff/organizer who initiated burn

        // Burn the NFT
        _burn(tokenId);

        emit TicketBurned(tokenId, tx.origin, block.timestamp);
    }

    /**
     * @dev Alternative burn function for external calls
     */
    function burnTicket(uint256 tokenId) external onlyEventContract {
        if (_ownerOf(tokenId) == address(0)) revert TokenNotFound();
        if (_burnedTokens[tokenId]) revert TokenAlreadyBurned();

        // Mark as burned
        _burnedTokens[tokenId] = true;
        _ticketMetadata[tokenId].isUsed = true;
        _ticketMetadata[tokenId].burnTimestamp = block.timestamp;
        _ticketMetadata[tokenId].burnedBy = tx.origin;

        // Burn the NFT
        _burn(tokenId);

        emit TicketBurned(tokenId, tx.origin, block.timestamp);
    }

    /**
     * @dev Get ticket metadata
     */
    function getTicketMetadata(uint256 tokenId) external view returns (TicketMetadata memory) {
        // Check if token was ever minted
        if (tokenId >= _currentTokenId) revert TokenNotFound();
        
        TicketMetadata memory metadata = _ticketMetadata[tokenId];
        
        // Update current owner if token still exists (not burned)
        if (_ownerOf(tokenId) != address(0)) {
            metadata.currentOwner = ownerOf(tokenId);
        }
        
        return metadata;
    }

    /**
     * @dev Get all tokens owned by an address
     */
    function getTicketsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }

    /**
     * @dev Check if ticket is valid (not burned)
     */
    function isTicketValid(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0) && !_burnedTokens[tokenId];
    }

    /**
     * @dev Get ticket tier ID
     */
    function getTicketTier(uint256 tokenId) external view returns (uint256) {
        if (tokenId >= _currentTokenId) revert TokenNotFound();
        return _ticketMetadata[tokenId].tierId;
    }

    /**
     * @dev Check if token is burned
     */
    function isBurned(uint256 tokenId) external view returns (bool) {
        return _burnedTokens[tokenId];
    }

    /**
     * @dev Get burn timestamp
     */
    function getBurnTimestamp(uint256 tokenId) external view returns (uint256) {
        return _ticketMetadata[tokenId].burnTimestamp;
    }

    /**
     * @dev Get who burned the token
     */
    function getBurnedBy(uint256 tokenId) external view returns (address) {
        return _ticketMetadata[tokenId].burnedBy;
    }

    /**
     * @dev Override _update to track metadata changes (OpenZeppelin v5)
     */
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override(ERC721, ERC721Enumerable) 
        returns (address) 
    {
        address previousOwner = super._update(to, tokenId, auth);
        
        // Update current owner in metadata (only for existing tokens and non-zero destinations)
        if (to != address(0) && tokenId < _currentTokenId && !_burnedTokens[tokenId]) {
            _ticketMetadata[tokenId].currentOwner = to;
        }
        
        return previousOwner;
    }

    /**
     * @dev Override _increaseBalance for ERC721Enumerable compatibility (OpenZeppelin v5)
     */
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Get total number of tokens ever minted (including burned)
     */
    function totalSupplyEver() external view returns (uint256) {
        return _currentTokenId - 1;
    }

    /**
     * @dev Set base URI for metadata
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Get base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override supportsInterface
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}