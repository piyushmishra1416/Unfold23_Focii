import React, { useContext, useState } from "react";
import { ethers } from "ethers";
import {
  IHybridPaymaster,
  SponsorUserOperationDto,
  PaymasterMode,
} from "@biconomy/paymaster";
import { BiconomySmartAccount } from "@biconomy/account";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parseUnits } from "ethers/lib/utils";
import RedPacketABI from "../../contract-ABI/RedPacketABI";
import TokenABI from "../../contract-ABI/TokenAbi";
import WalletContext from "../../context/wallet-context";
function CreatePacket() {
  const [selectedToken, setSelectedToken] = useState("");
  const [tokenContract, setTokenContract] = useState("");
  const [amount, setAmount] = useState(0);
  const [isRandom, setIsRandom] = useState(false);
  const [receiverCount, setReceiverCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [selectedDeadline, setSelectedDeadline] = useState("1 Hour");
  const [deadline, setDeadline] = useState(3600);
  const [sendButton, SetSendButton] = useState("Set token allowance");
  const ctx = useContext(WalletContext);

  const supportedTokens = [
    { name: "WAGMI", address: "0xED988dCaF7fBa5F7b928168b6fbb481d0117F22f" },
    { name: "LUFFY", address: "0x53468aFdE0654D2DADD64f0B7bD0382f27222326" },
  ];

  const supportedDeadlines = [
    { name: "1 Hour", seconds: 3600 },
    { name: "2 Hours", seconds: 7200 },
    { name: "24 Hours", seconds: 86400 },
  ];

  const handleTokenChange = (selectedTokenName) => {
    const selectedToken = supportedTokens.find(
      (token) => token.name === selectedTokenName
    );
    if (selectedToken) {
      setSelectedToken(selectedToken.name);
      setTokenContract(selectedToken.address); // Set the contract address
    }
  };
  const handleDeadlineChange = (option) => {
    const selected = supportedDeadlines.find((d) => d.name === option);
    if (selected) {
      setSelectedDeadline(selected.name);
      setDeadline(selected.seconds);
    }
  };

  const increaseAllowanceFunc = async () => {
    //Token allowance first
    try {
      console.log(tokenContract);
      const contract = new ethers.Contract(
        tokenContract,
        TokenABI,
        ctx.provider
      );
      const tnx1 = contract.populateTransaction.increaseAllowance(
        ctx.RedPacket,
        parseUnits(`${amount}`)
      );
      const tx1 = {
        to: tokenContract,
        data: tnx1.data,
      };
      console.log("This", ctx.smartAccount);
      let userOp = await ctx.smartAccount.buildUserOp([tx1]);
      console.log("here");
      console.log({ userOp });
      //userOp.verificationGasLimit = 32684;
      //   const biconomyPaymaster = ctx.smartAccount.paymaster;
      //   let paymasterServiceData = {
      //     mode: PaymasterMode.SPONSORED,
      //   };
      //   const paymasterAndDataResponse =
      //     await biconomyPaymaster.getPaymasterAndData(
      //       userOp,
      //       paymasterServiceData
      //     );

      //   userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      console.log(ctx.smartAccount);
      const userOpResponse = await ctx.smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);

      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
    } catch (error) {
      console.log(error);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    //Create packet

    try {
      const contract = new ethers.Contract(
        ctx.RedPacket,
        RedPacketABI,
        ctx.provider
      );
      console.log(contract);
      const tnx1 = await contract.populateTransaction.createRedPacketErc(
        tokenContract,
        parseUnits(amount),
        isRandom,
        receiverCount,
        "iidjfbcdjiidd",
        deadline
      );
      console.log(tnx1);
      const tx1 = {
        to: ctx.RedPacket,
        data: tnx1.data,
      };
      let userOp = await ctx.smartAccount.buildUserOp([tx1]);
      console.log("here");
      console.log({ userOp });
      console.log(ctx.smartAccount);
      const userOpResponse = await ctx.smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);

      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
    } catch (error) {
      console.log(error);
    }
  };

  const sendTokens = async () => {
    try {
      console.log(tokenContract);
      const contract = new ethers.Contract(
        tokenContract,
        TokenABI,
        ctx.provider
      );
      const tnx1 = contract.populateTransaction.transfer(
        "0x545cEfaca68FaA6b2D3DE69128c1DA6E447D8c0d",
        parseUnits(`${amount}`)
      );
      const tx1 = {
        to: tokenContract,
        data: tnx1.data,
      };
      console.log("This", ctx.smartAccount);
      let userOp = await ctx.smartAccount.buildUserOp([tx1]);
      console.log("here");
      console.log({ userOp });
      //   userOp.verificationGasLimit = 40680;
      //   const biconomyPaymaster = ctx.smartAccount.paymaster;
      //   let paymasterServiceData = {
      //     mode: PaymasterMode.SPONSORED,
      //     smartAccountInfo: {
      //       name: "BICONOMY",
      //       version: "1.0.0",
      //     },
      //   };
      //   const paymasterAndDataResponse =
      //     await biconomyPaymaster.getPaymasterAndData(
      //       userOp,
      //       paymasterServiceData
      //     );

      //   userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      //   console.log(ctx.smartAccount);
      const userOpResponse = await ctx.smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);

      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      CreatePacket
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Select Token:
              <select
                value={selectedToken}
                onChange={(e) => handleTokenChange(e.target.value)}
              >
                <option value="">Select a token</option>
                {supportedTokens.map((token, index) => (
                  <option key={index} value={token.name}>
                    {token.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              Amount:
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Distribute amount randomly
              <input
                type="checkbox"
                checked={isRandom}
                onChange={() => setIsRandom(!isRandom)}
              />
            </label>
          </div>
          <div>
            <label>
              Number of Receivers:
              <input
                type="number"
                value={receiverCount}
                onChange={(e) => setReceiverCount(e.target.value)}
              />
            </label>
          </div>
          <div>
            {/* <label>
              Red Packet ID:
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </label> */}
          </div>
          <div>
            <label>
              Select Deadline:
              <select
                value={selectedDeadline}
                onChange={(e) => handleDeadlineChange(e.target.value)}
              >
                {supportedDeadlines.map((deadline, index) => (
                  <option key={index} value={deadline.name}>
                    {deadline.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button onClick={increaseAllowanceFunc}>Approve tokens</button>
          <button type="submit">Send tokens</button>
        </form>

        <button onClick={sendTokens}>Send</button>
      </div>
    </div>
  );
}

export default CreatePacket;
