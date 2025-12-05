const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying CMTFaucet to Celo Mainnet...");
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "CELO");
  if (parseFloat(ethers.formatEther(balance)) < 1.0) {
    console.error("❌ Insufficient CELO for mainnet deployment (need ≥ 1)");
    process.exit(1);
  }

  const cmtTokenAddress = process.env.CMT_TOKEN_ADDRESS || "0xe8f33f459ffa69314f3d92eb51633ae4946de8f0";
  console.log("Using CMT token:", cmtTokenAddress);

  const CMTFaucet = await ethers.getContractFactory("CMTFaucet");
  const feeData = await deployer.provider.getFeeData();
  const gasPrice = feeData.gasPrice || ethers.parseUnits("2", "gwei");
  const faucet = await CMTFaucet.deploy(cmtTokenAddress, { gasLimit: 2500000, gasPrice });

  console.log("⏳ Waiting for deployment...");
  const tx = faucet.deploymentTransaction();
  console.log("TX:", tx.hash);
  await faucet.waitForDeployment();
  const address = await faucet.getAddress();
  console.log("✅ CMTFaucet deployed:", address);

  const receipt = await tx.wait(3);

  const out = {
    network: "celo-mainnet",
    chainId: 42220,
    contractName: "CMTFaucet",
    address,
    deployer: deployer.address,
    deploymentTx: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed?.toString() || "",
    gasPrice: receipt.gasPrice?.toString() || "",
    explorerUrl: `https://celoscan.io/address/${address}`,
    timestamp: new Date().toISOString(),
  };
  const dir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "cmt-faucet-mainnet.json"), JSON.stringify(out, null, 2));

  console.log("\n📋 NEXT STEPS:");
  console.log(`Set NEXT_PUBLIC_CMT_FAUCET_ADDRESS_MAINNET=${address} in .env.local`);
  console.log("Optionally set faucet amount via setFaucetAmount(amount)");
}

main().catch((err) => { console.error(err); process.exit(1); });

