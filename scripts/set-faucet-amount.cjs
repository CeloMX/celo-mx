const { ethers } = require('hardhat');

async function main() {
  const faucetAddress = process.env.NEXT_PUBLIC_CMT_FAUCET_ADDRESS_MAINNET;
  if (!faucetAddress || faucetAddress.length !== 42) {
    throw new Error('Faucet address missing or invalid. Set NEXT_PUBLIC_CMT_FAUCET_ADDRESS_MAINNET');
  }

  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  const bal = await deployer.provider.getBalance(deployer.address);
  console.log('Balance:', ethers.formatEther(bal), 'CELO');

  const faucet = await ethers.getContractAt('CMTFaucet', faucetAddress);
  const amountWei = ethers.parseUnits('5', 18);
  console.log('Setting faucet amount to:', amountWei.toString(), '(wei)');

  const feeData = await deployer.provider.getFeeData();
  const gasPrice = feeData.gasPrice || ethers.parseUnits('2', 'gwei');

  const tx = await faucet.setFaucetAmount(amountWei, { gasPrice });
  console.log('TX:', tx.hash);
  const rcpt = await tx.wait(2);
  console.log('✅ Faucet amount set. Block:', rcpt.blockNumber);
}

main().catch((e) => { console.error(e); process.exit(1); });

