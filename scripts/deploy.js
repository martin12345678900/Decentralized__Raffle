const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const ENTRANCE_FEE = hre.ethers.utils.parseEther("0.1");

async function main() {
  const [deployer] = await ethers.getSigners();

  const args = [
    ENTRANCE_FEE,
    "300",
    "0x6168499c0cffcacd319c818142124b7a15e857ab",
    "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    "6008",
    "500000",
  ];

  const RaffleFactory = await hre.ethers.getContractFactory("Raffle");
  const Raffle = await RaffleFactory.deploy(...args);

  console.log("Deploying contracts with the:", deployer.address);
  console.log("Deploying Raffle to:", Raffle.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => process.exit(1));
