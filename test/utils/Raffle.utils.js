const { ethers } = require("hardhat");

module.exports.entranceFee = ethers.utils.parseEther("0.1");
module.exports.invalidEntranceFee = ethers.utils.parseEther("0.09");
