async function main() {
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.waitForDeployment(); // ✅ FIXED
    console.log(`Contract deployed at: ${nftMarketplace.target}`); // ✅ Updated for ethers v6
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
