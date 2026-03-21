const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', hre.ethers.formatEther(balance), 'MATIC');

  // Deploy EnergyTrade
  const EnergyTrade = await hre.ethers.getContractFactory('EnergyTrade');
  const trade = await EnergyTrade.deploy();
  await trade.waitForDeployment();
  console.log('EnergyTrade deployed to:', await trade.getAddress());

  // Deploy EnergyToken (1 million initial supply)
  const EnergyToken = await hre.ethers.getContractFactory('EnergyToken');
  const token = await EnergyToken.deploy(1_000_000);
  await token.waitForDeployment();
  console.log('EnergyToken deployed to:', await token.getAddress());

  console.log('');
  console.log('NEXT STEP: Add these to your .env file:');
  console.log('CONTRACT_ADDRESS=' + await trade.getAddress());
  console.log('TOKEN_CONTRACT_ADDRESS=' + await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
