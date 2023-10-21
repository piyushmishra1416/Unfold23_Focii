import { useContext, useState } from "react";
import { ethers } from "ethers";
import {
  IHybridPaymaster,
  SponsorUserOperationDto,
  PaymasterMode,
} from "@biconomy/paymaster";
import { BiconomySmartAccount } from "@biconomy/account";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WalletContext from "../../../context/wallet-context";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import TokenABI from "../../../contract-ABI/TokenAbi";
function SendToken() {
  const [allowanceAmount, setAllowanceAmount] = useState("");
  const [giftAmount, SetGiftAmount] = useState(0);
  const [targetAdd, SetTargetAdd] = useState(null);
  const ctx = useContext(WalletContext);

  const tokenContract = new ethers.Contract(
    ctx.tokenAddress,
    TokenABI,
    ctx.provider
  );
  const increaseAllowance = async (event) => {
    event.preventDefault();
    try {
      const allowanceValue = parseUnits(allowanceAmount); // Convert input to appropriate units
      console.log(allowanceAmount);
      const tx = await tokenContract.populateTransaction.approve(
        ctx.DappContract,
        allowanceValue
      );
      console.log("first");
      const tx1 = {
        to: ctx.tokenAddress,
        data: tx.data,
      };
      console.log("here before userop");
      console.log(ctx.smartAccount.buildUserOp);
      let userOp = await ctx.smartAccount.buildUserOp([tx1]);
      console.log({ userOp });
      const biconomyPaymaster = ctx.smartAccount.paymaster;
      let paymasterServiceData = {
        mode: PaymasterMode.SPONSORED,
      };
      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
        );

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      console.log(ctx.smartAccount);
      const userOpResponse = await ctx.smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      console.log("This");
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);

      console.log("Transaction receipt:", receipt);
    } catch (error) {
      console.error("Error increasing allowance:", error);
    }
  };

  const giftTokens = async (event) => {
    event.preventDefault();
    try {
      toast.info("Sending transaction", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      const amount = parseUnits(giftAmount); // Convert input to appropriate units
      console.log(allowanceAmount);
      const tx = await tokenContract.populateTransaction.transfer(
        targetAdd,
        amount
      );
      const tx1 = {
        to: ctx.tokenAddress,
        data: tx.data,
      };
      console.log("here before userop");
      console.log(ctx.smartAccount.buildUserOp);
      let userOp = await ctx.smartAccount.buildUserOp([tx1]);
      console.log({ userOp });
      userOp.verificationGasLimit = 52000;
      console.log("Final", { userOp });
      const biconomyPaymaster = ctx.smartAccount.paymaster;
      let paymasterServiceData = {
        mode: PaymasterMode.SPONSORED,
      };
      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
        );

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      console.log(ctx.smartAccount);
      const userOpResponse = await ctx.smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      console.log("This");
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      toast.success(`Success! Tokens sent ${receipt.transactionHash} `, {
        position: "top-right",
        autoClose: 18000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      console.log("Transaction receipt:", receipt);
    } catch (error) {
      console.error("Error increasing allowance:", error);
    }
  };
  return (
    <>
      <p>
        Increase allowance
        <form onSubmit={increaseAllowance}>
          <input
            type="number"
            id="amount"
            value={allowanceAmount}
            onChange={(event) => setAllowanceAmount(event.target.value)} // Update the state with input value
          />
          <button type="submit">Increase Allowance</button>
        </form>
      </p>
      <p>
        Send tokens
        <form onSubmit={giftTokens}>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            value={giftAmount}
            onChange={(event) => SetGiftAmount(event.target.value)}
          />

          <label htmlFor="address">Recipient Address:</label>
          <input
            type="text"
            id="address"
            value={targetAdd}
            onChange={(event) => SetTargetAdd(event.target.value)}
          />
          <button type="submit">Send tokens</button>
        </form>
      </p>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default SendToken;
