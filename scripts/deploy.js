const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

const ENTRANCE_FEE = hre.ethers.utils.parseEther("0.1");
const BASE_FEE = "250000000000000000"; // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9; // link per gas, is this the gas lane? // 0.000000001 LINK per gas

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = hre.network.config.chainId;

  const args = [
    ENTRANCE_FEE,
    "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    "6008",
    "500000",
  ];

  const RaffleFactory = await hre.ethers.getContractFactory("Raffle");
  const Raffle = await RaffleFactory.deploy(...args);

  console.log("Deploying contracts with the:", deployer.address);
  console.log("Deploying Raffle to:", Raffle.address);
  //console.log("Deploying Vrf Coordinator to:", VrfCoordinator.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => process.exit(1));
