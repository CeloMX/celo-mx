require('dotenv').config({ path: '.env.local' });

async function main() {
  const hre = require('hardhat');
  const { ethers, network } = hre;
  console.log('🚀 Deploying X402Token to', network.name);

  const name = process.env.X402_TOKEN_NAME || 'X402 Token';
  const symbol = process.env.X402_TOKEN_SYMBOL || 'X402';
  const initialSupply = process.env.X402_TOKEN_INITIAL_SUPPLY || '0';
  const owner = process.env.X402_TOKEN_OWNER || (await ethers.getSigners())[0].address;

  const supply = ethers.parseUnits(initialSupply, 18);

  const Factory = await ethers.getContractFactory('X402Token');
  const contract = await Factory.deploy(name, symbol, supply, owner);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('✅ X402Token deployed:', address);
  console.log('🔗 Explorer:', `https://celoscan.io/address/${address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

