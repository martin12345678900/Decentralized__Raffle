const { deployments, network, ethers, getNamedAccounts } = require("hardhat");

const BASE_FEE = "250000000000000000"; // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9; // link per gas, is this the gas lane? // 0.000000001 LINK per gas

async function main() {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  console.log({ isLocalhost: chainId == 31337 });
  if (chainId == 31337) {
    console.log("deploying");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    });

    console.log("Deployed :)");
  }
}

module.exports.tags = ["all", "mocks"];

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
