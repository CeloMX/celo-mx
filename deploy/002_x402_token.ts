import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const name = process.env.X402_TOKEN_NAME || 'X402 Token';
  const symbol = process.env.X402_TOKEN_SYMBOL || 'X402';
  const initialSupply = process.env.X402_TOKEN_INITIAL_SUPPLY || '0';
  const owner = process.env.X402_TOKEN_OWNER || deployer;

  log(`Deploying X402Token to ${network.name} with:`);
  log(`- name: ${name}`);
  log(`- symbol: ${symbol}`);
  log(`- initialSupply: ${initialSupply}`);
  log(`- owner: ${owner}`);

  const supply = ethers.parseUnits(initialSupply, 18);

  const result = await deploy('X402Token', {
    from: deployer,
    args: [name, symbol, supply, owner],
    log: true,
  });

  log(`X402Token deployed at: ${result.address}`);
};

export default func;
func.tags = ['X402Token'];

