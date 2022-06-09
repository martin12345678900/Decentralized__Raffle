const { expect, use } = require("chai");
const { deployments, ethers: hardhatEthers } = require("hardhat");
const { ethers } = require("ethers");

const {
  abi: RaffleAbi,
} = require("../artifacts/contracts/Raffle.sol/Raffle.json");
const {
  abi: VrfCoordinatorAbi,
} = require("../artifacts/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol/VRFCoordinatorV2Mock.json");
const { deployVRFCoordinatorV2Mock, deployRaffleMock } = require("./mock/mock");
const { MockProvider, deployContract, solidity } = require("ethereum-waffle");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

use(solidity);

describe("Raffle", async function () {
  let deployer,
    player1,
    player2,
    VrfCoordinatorV2Mock,
    Raffle,
    RaffleContract,
    VrfCoordinatorV2,
    entranceFee;

  beforeEach(async function () {
    [deployer, player1, player2] = await hardhatEthers.getSigners();

    //await deployments.fixture(["mocks", "raffle"]);
    VrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock",
      VrfCoordinatorAbi
    );
    //RaffleContract = await ethers.getContract()

    Raffle = RaffleContract.connect(player1);
    entranceFee = await Raffle.getEntranceFee();
  });

  it("test 1", async function () {
    console.log("EntranceFee: ", entranceFee);
  });
});
