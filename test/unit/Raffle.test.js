const { expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

const {
  entranceFee: raffleEntranceFee,
  invalidEntranceFee,
} = require("../utils/Raffle.utils");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async function () {
      let deployer, player, Raffle, VRFCoordinatorV2Mock, admin, entranceFee;

      beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        player = accounts[1];
        //await deployments.fixture(["all"]);
        Raffle = await ethers.getContract("Raffle", deployer.address);
        VRFCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer.address
        );
        entranceFee = await Raffle.getEntranceFee();
        admin = await Raffle.i_admin();
      });

      it("test constructor", async function () {
        expect(entranceFee.toString()).to.be.equal(raffleEntranceFee);
        expect(admin).to.be.equal(deployer.address);
      });

      it("test enterRaffle positive case", async function () {
        expect(
          await Raffle.connect(player).enterRaffle({ value: raffleEntranceFee })
        ).to.emit(Raffle, "RaffleEntered");
        //const newPlayer = await Raffle.getPlayer(0);
        expect(await Raffle.getPlayer(0)).to.be.equal(player.address);
        expect(await Raffle.getNumberOfPlayers()).to.be.equal(1);
      });

      it("test enterRaffle negative case", async function () {
        expect(
          Raffle.connect(player).enterRaffle({
            value: invalidEntranceFee,
          })
        ).to.be.revertedWith("Raffle__SendMoreToEnterRaffle");
      });
    });
