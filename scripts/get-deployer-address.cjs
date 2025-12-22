/**
 * Get the deployer address from DEPLOYER_PRIVATE_KEY
 */

require("dotenv").config({ path: ".env.local" });
const { ethers } = require("ethers");

async function main() {
  const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

  if (!DEPLOYER_PRIVATE_KEY) {
    console.error("❌ DEPLOYER_PRIVATE_KEY not found in .env.local");
    console.log("\nPlease add your private key to .env.local:");
    console.log("DEPLOYER_PRIVATE_KEY=0x...");
    process.exit(1);
  }

  try {
    // Create wallet from private key
    const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY);
    const address = wallet.address;

    console.log("\n=== Deployer Wallet Information ===");
    console.log("Address:", address);
    console.log("\n📝 Send CELO to this address to deploy contracts");
    console.log("\n💡 You can send CELO from:");
    console.log("   - Valora wallet");
    console.log("   - MetaMask");
    console.log("   - Any Celo wallet");
    console.log("\n💰 You need at least 0.2 CELO for deployment");
    console.log("\n🔗 View on Celoscan:");
    console.log(`   https://celoscan.io/address/${address}`);
    console.log("\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\nMake sure DEPLOYER_PRIVATE_KEY is a valid private key (starts with 0x)");
    process.exit(1);
  }
}

main();

