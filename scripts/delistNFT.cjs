const { ethers } = require("ethers");
require("dotenv").config();

// Load environment variables
const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NEXT_PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

if (!ALCHEMY_API_URL || !PRIVATE_KEY || !MARKETPLACE_CONTRACT_ADDRESS) {
    console.error("❌ Missing environment variables. Check .env file.");
    process.exit(1);
}

// Set up provider and signer
const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Define ABI to decode logs (Transfer and NFTListed events)
const abi = [
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event NFTListed(address indexed owner, uint256 indexed tokenId, uint256 price)",
    "function delistNFT(uint256 tokenId) public"
];

const iface = new ethers.Interface(abi);
const marketplaceContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, abi, wallet);

// Get transaction hash from command line arguments
const txHash = process.argv[2];

if (!txHash) {
    console.error("❌ Please provide a transaction hash.");
    process.exit(1);
}

(async () => {
    try {
        console.log(`🔍 Fetching transaction receipt for: ${txHash}`);
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
            console.error("❌ Transaction not found. Ensure it's a valid transaction hash.");
            process.exit(1);
        }

        console.log(`✅ Transaction found! Checking logs...`);

        let foundTokenId = null;

        for (const log of receipt.logs) {
            try {
                const parsedLog = iface.parseLog(log);
                console.log(`🔹 Found event: ${parsedLog.name}`, parsedLog.args);

                if (parsedLog.name === "Transfer" || parsedLog.name === "NFTListed") {
                    foundTokenId = parsedLog.args.tokenId.toString();
                    console.log(`✅ Extracted Token ID: ${foundTokenId}`);
                    break; // Stop once we find the Token ID
                }
            } catch (error) {
                // Ignore logs that don’t match the expected ABI
            }
        }

        if (!foundTokenId) {
            console.error("❌ No NFT Transfer or Listing event found in this transaction.");
            process.exit(1);
        }

        console.log(`🎯 Delisting NFT with Token ID: ${foundTokenId}`);

        // Call the smart contract function to delist the NFT
        const tx = await marketplaceContract.delistNFT(foundTokenId);
        console.log("⏳ Transaction sent... Waiting for confirmation.");
        await tx.wait();
        console.log(`✅ NFT with Token ID ${foundTokenId} has been delisted.`);

        process.exit(0);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
})();
