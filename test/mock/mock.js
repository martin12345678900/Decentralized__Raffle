const VRFCoordinatorV2Mock = require("../../artifacts/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol/VRFCoordinatorV2Mock.json");
const Raffle = require("../../artifacts/contracts/Raffle.sol/Raffle.json");
const { MockProvider } = require("ethereum-waffle");

module.exports.deployVRFCoordinatorV2Mock = async () => {
  const [wallet] = new MockProvider().getWallets();
  return waffle.deployMockContract(wallet, VRFCoordinatorV2Mock.abi);
};

module.exports.deployRaffleMock = async () => {
  const [wallet] = new MockProvider().getWallets();
  return await waffle.deployMockContract(wallet, Raffle.abi);
};
