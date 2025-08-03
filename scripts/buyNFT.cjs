require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Load environment variables
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// Read compiled contract ABI
const contractABI = JSON.parse(fs.readFileSync("./artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json")).abi;

// Create contract instance
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

async function buyNFT(tokenId, price) {
    try {
        const priceInWei = ethers.parseEther(price.toString());
        console.log(`Buying NFT ${tokenId} for ${price} ETH...`);

        const tx = await contract.buyNFT(tokenId, { value: priceInWei });
        await tx.wait(); // Wait for transaction to complete

        console.log(`✅ NFT ${tokenId} bought for ${price} ETH! Transaction Hash: ${tx.hash}`);
    } catch (error) {
        console.error("❌ Error buying NFT:", error);
    }
}

// Example usage: Replace `1` with your actual token ID
buyNFT(1, 0.0005);
