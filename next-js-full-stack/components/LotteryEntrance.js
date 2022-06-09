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
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);

  const [admin, setAdmin] = useState(false);

  // View functions
  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  const { runContractFunction: getAdmin } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "i_admin",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: closeRaffle } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "closeRaffle",
    params: {},
  });

  useEffect(() => {
    const isAdmin = async function () {
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAdmin(account.toLowerCase() === (await getAdmin()).toLowerCase());
    };

    isAdmin();
  }, []);

  useEffect(() => {
    const getWinner = async function () {
      if (isWeb3Enabled) {
        const recentWinnerFromCall = await getRecentWinner();
        setRecentWinner(recentWinnerFromCall);
      }
    };

    getWinner();
  }, [isWeb3Enabled]);

  useEffect(() => {
    getNumberOfPlayers().then((result) =>
      setNumberOfPlayers(result.toString())
    );
  }, []);

  return (
    <div>
      <button
        onClick={async () => {
          await enterRaffle();
        }}
        className="rounded ml-auto font-bold bg-blue-500 p-2 mt-4"
      >
        Enter Lottery
      </button>
      <div>The Recent Winner is: {recentWinner}</div>
      <div>Number of players: {numberOfPlayers}</div>

      <div>
        {admin && (
          <button
            className="rounded ml-auto bg-red-400 p-2 mt-5"
            onClick={async () => {
              await closeRaffle();
            }}
          >
            Close Lottery
          </button>
        )}
      </div>
    </div>
  );
}
