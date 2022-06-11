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

      describe("enterRaffle", async function () {
        it("test enterRaffle positive case", async function () {
          expect(
            await Raffle.connect(player).enterRaffle({
              value: raffleEntranceFee,
            })
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

      describe("closeRaffle", async function () {
        it("test closeRaffle with non-admin account", async function () {
          expect(Raffle.connect(player).closeRaffle()).to.be.revertedWith(
            "Raffle__NotAdmin"
          );
        });

        it("test closeRaffle with non-upkeep state", async function () {
          expect(Raffle.connect(deployer).closeRaffle()).to.be.revertedWith(
            "Raffle__UpkeepNotNeeded"
          );
        });

        it("test closeRaffle with correct values", async function () {
          await Raffle.connect(player).enterRaffle({
            value: raffleEntranceFee,
          });
          const txResponse = await Raffle.connect(deployer).closeRaffle();
          const txReceipt = await txResponse.wait(1);
          const requestId = txReceipt.events[1].args.requestId;

          expect(Raffle.connect(deployer).closeRaffle()).to.emit(
            Raffle,
            "RequestedRaffleWinner"
          );
          expect(Number(requestId.toString())).to.be.above(0);
          expect(await Raffle.getRaffleState()).to.be.equal(2);
        });
      });

      describe("fullfillRandomWords", async function () {
        it("non-existent request", async function () {
          expect(
            VRFCoordinatorV2Mock.fulfillRandomWords(0, Raffle.address)
          ).to.be.revertedWith("nonexistent request");
          expect(
            VRFCoordinatorV2Mock.fulfillRandomWords(1, Raffle.address)
          ).to.be.revertedWith("nonexistent request");
        });
        it("selecting winner, trading the ethers to the winner account", async function () {
          const prevPlayerBalance = await player.getBalance();
          await Raffle.connect(player).enterRaffle({
            value: raffleEntranceFee,
          });

          await new Promise(async (resolve, reject) => {
            Raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event happened");
              try {
                const recentWinner = await Raffle.getRecentWinner();
                const numberOfPlayers = await Raffle.getNumberOfPlayers();
                const raffleState = await Raffle.getRaffleState();

                expect(recentWinner).to.be.equal(player.address);
                expect(numberOfPlayers.toString()).to.be.equal("0");
                expect(raffleState.toString()).to.be.equal("0");
                const newPlayerBalance = await player.getBalance();
                /* expect(newPlayerBalance.toString()).to.be.equal(
                  prevPlayerBalance.add(raffleEntranceFee).toString()
                ); */

                resolve();
              } catch (err) {
                reject(err);
              }
            });

            const txResponse = await Raffle.connect(deployer).closeRaffle();
            const txReceipt = await txResponse.wait(1);
            await VRFCoordinatorV2Mock.fulfillRandomWords(
              txReceipt.events[1].args.requestId,
              Raffle.address
            );
          });
        });
      });
    });
