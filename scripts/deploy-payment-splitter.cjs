/**
 * Deployment script for MarketplacePaymentSplitter contract
 * 
 * Usage:
 *   TREASURY_ADDRESS=0x... ARTIST_ADDRESS=0x... npx hardhat run scripts/deploy-payment-splitter.js --network alfajores
 *   TREASURY_ADDRESS=0x... ARTIST_ADDRESS=0x... npx hardhat run scripts/deploy-payment-splitter.js --network celo
 */

const hre = require("hardhat");

async function main() {
  // Get addresses from environment variables
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  const ARTIST_ADDRESS = process.env.ARTIST_ADDRESS;

  if (!TREASURY_ADDRESS || !TREASURY_ADDRESS.startsWith('0x')) {
    throw new Error("TREASURY_ADDRESS environment variable must be set (e.g., 0x...)");
  }

  if (!ARTIST_ADDRESS || !ARTIST_ADDRESS.startsWith('0x')) {
    throw new Error("ARTIST_ADDRESS environment variable must be set (e.g., 0x...)");
  }

  if (TREASURY_ADDRESS.toLowerCase() === ARTIST_ADDRESS.toLowerCase()) {
    throw new Error("TREASURY_ADDRESS and ARTIST_ADDRESS must be different");
  }

  const network = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log("\n=== Deploying MarketplacePaymentSplitter ===");
  console.log("Network:", network);
  console.log("Chain ID:", chainId.toString());
  console.log("Treasury Address:", TREASURY_ADDRESS);
  console.log("Artist Address:", ARTIST_ADDRESS);
  console.log("Split Ratio: $10 Treasury / $35 Artist (22.22% / 77.78%)\n");

  // Get the contract factory
  const MarketplacePaymentSplitter = await hre.ethers.getContractFactory(
    "MarketplacePaymentSplitter"
  );

  // Get current gas price from network
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  console.log("Current gas price:", gasPrice?.toString(), "wei");

  // Deploy the contract
  console.log("Deploying contract...");
  const splitter = await MarketplacePaymentSplitter.deploy(
    TREASURY_ADDRESS,
    ARTIST_ADDRESS,
    {
      gasPrice: gasPrice,
      gasLimit: 5000000, // Set a higher gas limit
    }
  );

  await splitter.waitForDeployment();
  const address = await splitter.getAddress();

  console.log("\n✅ PaymentSplitter deployed successfully!");
  console.log("Contract Address:", address);
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", network);
  console.log("Chain ID:", chainId.toString());
  console.log("Contract:", address);
  console.log("Treasury:", TREASURY_ADDRESS);
  console.log("Artist:", ARTIST_ADDRESS);
  console.log("Owner:", await splitter.owner());

  // Verify the configuration
  const treasury = await splitter.treasury();
  const artist = await splitter.artist();
  console.log("\n=== Contract Configuration ===");
  console.log("Treasury (from contract):", treasury);
  console.log("Artist (from contract):", artist);
  console.log("Treasury Shares: 10 ($10 from $45)");
  console.log("Artist Shares: 35 ($35 from $45)");
  console.log("Total Shares: 45");

  console.log("\n=== Next Steps ===");
  console.log("1. Verify the contract on Celoscan:");
  if (chainId === 42220n) {
    console.log(`   https://celoscan.io/address/${address}#code`);
  } else if (chainId === 44787n) {
    console.log(`   https://alfajores.celoscan.io/address/${address}#code`);
  }
  console.log("\n2. Set environment variable:");
  if (chainId === 42220n) {
    console.log(`   NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_MAINNET=${address}`);
  } else if (chainId === 44787n) {
    console.log(`   NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS_ALFAJORES=${address}`);
  }
  console.log("\n3. Test with a small payment");
  console.log("4. Monitor the contract on Celoscan");
  console.log("\n=== Deployment Complete ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

