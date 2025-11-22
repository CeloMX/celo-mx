require('dotenv').config({ path: '.env.local' });

async function main() {
  const hre = require('hardhat');
  const { ethers, network } = hre;
  const tokenAddress = process.env.X402_TOKEN_ADDRESS || '0x91D2db99f8c96bDfdACB3C7268cdEbdA7A476449';
  const to = process.env.X402_MINT_TO || '0xff1cb5151d8d3843bc254c468116101e24c63e63';
  const amount = process.env.X402_MINT_AMOUNT || '10';
  console.log('🔨 Minting', amount, 'tokens to', to, 'on', network.name);

  const supplyWei = ethers.parseUnits(amount, 18);
  const factory = await ethers.getContractFactory('X402Token');
  const token = factory.attach(tokenAddress);
  const tx = await token.mint(to, supplyWei);
  console.log('⏳ Mint tx sent:', tx.hash);
  const receipt = await tx.wait();
  console.log('✅ Mint confirmed in block', receipt.blockNumber);
  console.log('🔗 Explorer:', `https://celoscan.io/tx/${tx.hash}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

