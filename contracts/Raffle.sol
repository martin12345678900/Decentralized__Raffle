// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error Raffle__SendMoreToEnterRaffle();
error Raffle__RaffleNotOpen();
error Raffle__UpkeepNotNeeded();
error Raffle__TransferFailed();

contract Raffle is VRFConsumerBaseV2 {
    enum RaffleState {
        Open,
        Calculating
    }

    uint256 public immutable i_entranceFee;
    uint256 public immutable i_interval;
    uint256 public s_lastTimestampt;
    RaffleState public s_raffleState;
    address payable[] public s_players;
    address payable public s_recentWinner;

    VRFCoordinatorV2Interface public immutable i_vrfCordinator;
    bytes32 public i_gasLane;
    uint64 public i_subscriptionId;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public i_callbackGasLimit;
    uint32 public constant NUM_WORDS = 1;


    event RaffleEntered(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(
        uint256 entranceFee,
        uint256 interval, 
        address vrfCordinatorV2, 
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCordinatorV2) {
        i_entranceFee = entranceFee;
        i_interval = interval;
        s_lastTimestampt = block.timestamp;
        i_vrfCordinator = VRFCoordinatorV2Interface(vrfCordinatorV2); // interface + address = contract
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    function enterRaffle() external payable {
        if (msg.value < i_entranceFee) revert Raffle__SendMoreToEnterRaffle();
        if (s_raffleState != RaffleState.Open) revert Raffle__RaffleNotOpen();

        s_players.push(payable(msg.sender));
        emit RaffleEntered(msg.sender);
    }

    // 1. Be true after some time interval
    // 2. The lottery to be open
    // 3. The contract has ETH
    // 4. Keepers has LINK
    
    function checkUpkeep(bytes memory /* checkData */) public view returns(bool upkeepNeeded, bytes memory /* performData */) {
        bool isOpen = RaffleState.Open == s_raffleState;
        bool timePassed = ((block.timestamp - s_lastTimestampt) > i_interval); // keep track of time
        bool hasBalance = address(this).balance > 0;
        bool hasPlayers = s_players.length > 0;

        //upkeepNeeded = (isOpen && timePassed && hasBalance);
        return ((isOpen && timePassed && hasBalance && hasPlayers), "0x0");
    }

    function performUpkeep(bytes calldata /* performData */) external {
        (bool upkeepNeeded,) = checkUpkeep("0x0");
        if (!upkeepNeeded) revert Raffle__UpkeepNotNeeded();

        s_raffleState = RaffleState.Calculating;
        uint256 requestId = i_vrfCordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_players = new address payable[](0);
        s_raffleState = RaffleState.Open;
        s_lastTimestampt = block.timestamp;
        (bool success, ) = recentWinner.call{ value: address(this).balance }("");
        if (!success) revert Raffle__TransferFailed();
  
        emit WinnerPicked(recentWinner);
    }
}