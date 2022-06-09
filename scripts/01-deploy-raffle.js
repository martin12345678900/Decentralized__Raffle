const {
  getNamedAccounts,
  deployments,
  network,
  run,
  ethers,
} = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const FUND_AMOUNT = "1000000000000000000000";

async function main() {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let vrfCoordinatorV2MockAddress;

  if (chainId == 31337) {
    const VRFCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2MockAddress = VRFCoordinatorV2Mock.address;
  } else {
    vrfCoordinatorV2MockAddress = networkConfig[chainId]["vrfCoordinatorV2"];
  }

  /*
          uint256 entranceFee,
        address vrfCordinatorV2, 
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
  */
  const args = [
    networkConfig[chainId]["raffleEntranceFee"],
    vrfCoordinatorV2MockAddress,
    networkConfig[chainId]["gasLane"],
    networkConfig[chainId]["subscriptionId"],
    networkConfig[chainId]["callbackGasLimit"],
  ];

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
  });

  console.log("Raffle deployed to: ", raffle.address);
}

module.exports.tags = ["all", "raffle"];

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
