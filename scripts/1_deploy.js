const { ethers } = require('hardhat');

async function main() {
  const Token = await ethers.getContractFactory('Token');
  const token = await Token.deploy();

  console.log(`Token deployed at: ${token.address}`);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
