/**
 * Generate a new deployer wallet
 * WARNING: Keep the private key secure!
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

function main() {
  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  const privateKey = wallet.privateKey;
  const address = wallet.address;

  console.log("\n=== New Deployer Wallet Generated ===");
  console.log("\n⚠️  IMPORTANT: Save this private key securely!");
  console.log("\n📋 Private Key:");
  console.log(privateKey);
  console.log("\n📍 Address:");
  console.log(address);
  console.log("\n💰 Send CELO to this address to deploy contracts");
  console.log("   (You need at least 0.2 CELO)");
  console.log("\n🔗 View on Celoscan:");
  console.log(`   https://celoscan.io/address/${address}`);
  
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), ".env.local");
  const envExample = `\n# Add this to your .env.local file:\nDEPLOYER_PRIVATE_KEY=${privateKey}\n`;
  
  console.log("\n=== Next Steps ===");
  console.log("1. Copy the private key above");
  console.log("2. Add it to your .env.local file:");
  console.log(envExample);
  console.log("3. Send CELO to the address above");
  console.log("4. Then run the deployment script");
  console.log("\n");
  
  // Ask if they want to update .env.local automatically
  // (We'll do this manually to be safe)
}

main();

