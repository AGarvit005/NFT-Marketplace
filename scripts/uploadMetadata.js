import 'dotenv/config';
import axios from 'axios';

const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_JWT) {
    console.error("❌ Error: Missing PINATA_JWT. Set it in the .env file.");
    process.exit(1);
}

async function uploadMetadata() {
    const metadata = {
        name: "NFT Art",
        description: "A unique piece of NFT Art",
        image: "ipfs://bafkreig2czjrel4ssnyiepqzvcoeuqa5g2muj4z6pazdanuk4cextbcuvm"
    };

    try {
        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            metadata,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${PINATA_JWT}`
                }
            }
        );

        console.log("✅ Metadata uploaded successfully!");
        console.log(`🔗 IPFS URL: ipfs://${response.data.IpfsHash}`);
    } catch (error) {
        console.error("❌ Error uploading metadata:", error.response?.data || error.message);
    }
}

uploadMetadata();
