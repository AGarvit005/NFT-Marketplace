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

async function mintNFT() {
    try {
        const tokenURI = "ipfs://QmQJ9Z7VcLihRKVQsrZPMW7wHSEJQ4MJ1XhbJzrzBT7C3R"; // Replace with your actual IPFS CID
        const price = ethers.parseEther("0.001"); // 0.001 ETH price

        console.log(`🛠️ Minting NFT with metadata: ${tokenURI} and price: ${price.toString()} Wei...`);

        // Call mint function from smart contract
        const tx = await contract.mintNFT(tokenURI, price);
        console.log(`📜 Transaction sent! Hash: ${tx.hash}`);

        // Wait for transaction receipt
        const receipt = await tx.wait();

        // Extract tokenId from Transfer event
        let tokenId = null;
        const transferEvent = receipt.logs.find(log => log.topics[0] === ethers.id("Transfer(address,address,uint256)"));

        if (transferEvent) {
            tokenId = ethers.toNumber(transferEvent.topics[3]);
            console.log(`✅ NFT Minted! Token ID: ${tokenId}`);
        } else {
            console.warn("⚠️ Token ID could not be extracted from transaction logs.");
        }
        
    } catch (error) {
        console.error("❌ Error minting NFT:", error);
    }
}

// Execute the function
mintNFT();

