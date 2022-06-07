import { useState, useEffect } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";

import { abi, contractAddress } from "../constants/abi.json";

export default function LotteryEntrance() {
  const { isWeb3Enabled } = useMoralis();
  const { runContractFunction: enterRaffle } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "enterRaffle",
    msgValue: "100000000000000000",
    params: {},
  });

  const [recentWinner, setRecentWinner] = useState("");
  const [numPlayer, setNumPlayers] = useState(0);

  // View functions
  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "s_recentWinner",
    params: {},
  });

  useEffect(() => {
    const getWinner = async function () {
      if (isWeb3Enabled) {
        const recentWinnerFromCall = await getRecentWinner();
        setRecentWinner(recentWinnerFromCall);
      }
    };

    getWinner();
  }, [isWeb3Enabled]);

  return (
    <div>
      <button
        onClick={async () => {
          await enterRaffle();
        }}
        className="rounded ml-auto font-bold bg-blue-500 p-2"
      >
        Enter Lottery
      </button>
      <div>The Recent Winner is: {recentWinner}</div>
    </div>
  );
}
