// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct NFT {
        uint256 tokenId;
        address owner;
        uint256 price;
        bool forSale;
    }

    mapping(uint256 => NFT) public nftDetails;

    constructor() ERC721("NFT Marketplace", "NFTM") {}

    function mintNFT(string memory _tokenURI, uint256 _price) public {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        nftDetails[newTokenId] = NFT(newTokenId, msg.sender, _price, false);
    }

    function listNFT(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        nftDetails[_tokenId].forSale = true;
        nftDetails[_tokenId].price = _price;
    }

    function buyNFT(uint256 _tokenId) public payable {
        NFT storage nft = nftDetails[_tokenId];
        require(nft.forSale, "Not for sale");
        require(msg.value >= nft.price, "Insufficient funds");

        address previousOwner = nft.owner;
        payable(previousOwner).transfer(msg.value);

        _transfer(previousOwner, msg.sender, _tokenId);
        nft.owner = msg.sender;
        nft.forSale = false;
    }
    function delistNFT(uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(nftDetails[_tokenId].forSale, "NFT is not listed for sale");

        nftDetails[_tokenId].forSale = false;
        nftDetails[_tokenId].price = 0;
    }
}
