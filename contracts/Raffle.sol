// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error Raffle__SendMoreToEnterRaffle();
error Raffle__RaffleNotOpen();
error Raffle__UpkeepNotNeeded();
error Raffle__TransferFailed();
error Raffle__NotAdmin();

contract Raffle is VRFConsumerBaseV2 {
    enum RaffleState {
        Open,
        Closed,
        Calculating
    }

    uint256 public immutable i_entranceFee;
    RaffleState public s_raffleState;
    address payable[] public s_players;
    address payable public s_recentWinner;
    address public i_admin;

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
        address vrfCordinatorV2, 
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCordinatorV2) {
        i_admin = msg.sender;
        i_entranceFee = entranceFee;
        i_vrfCordinator = VRFCoordinatorV2Interface(vrfCordinatorV2); // interface + address = contract
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    /// @notice first line checks if there is enough deposited ether in the function to enter the raffle
    /// @dev if yes we push the current player in our array
    /// @dev emitting an event
    
    function enterRaffle() external payable {
        if (msg.value < i_entranceFee) revert Raffle__SendMoreToEnterRaffle();
        //if (s_raffleState != RaffleState.Open) revert Raffle__RaffleNotOpen();

        s_players.push(payable(msg.sender));
        emit RaffleEntered(msg.sender);
    }

    function closeRaffle() external adminOnly() {
        bool upKeepNeeded = checkUpKeep();
        if (!upKeepNeeded) revert Raffle__UpkeepNotNeeded();

        s_raffleState = RaffleState.Calculating;
        uint requestId = i_vrfCordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }

    // 1. Be true after some time interval
    // 2. The lottery to be open
    // 3. The contract has ETH
    // 4. Keepers has LINK

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_players = new address payable[](0);
        s_raffleState = RaffleState.Closed;
        (bool success, ) = recentWinner.call{ value: address(this).balance }("");
        if (!success) revert Raffle__TransferFailed();
  
        emit WinnerPicked(recentWinner);
    }

    /// @notice checks if the raffle state is open
    /// @notice checks if there is any balance deposited in the contract
    /// @notice checks if there are any players
    /// @return bool checks if all conditions are true

    function checkUpKeep() public view returns(bool) {
         bool isOpen = s_raffleState == RaffleState.Open;
         bool hasBalance = address(this).balance > 0;
         bool hasPlayers = s_players.length > 0;

        return (isOpen && hasBalance && hasPlayers);
    }

    modifier adminOnly() {
        if (msg.sender != i_admin) revert Raffle__NotAdmin();
        _;
    }

    /** Getter Functions */

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }
}