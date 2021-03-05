import { BigNumber, ContractTransaction, Overrides, utils } from "ethers";
import { CLIError } from "./exceptions";
import { IContext } from "./context";
import { c } from "./colors";

export async function send(
  ctx: IContext,
  sendFunc: (o: Overrides) => Promise<ContractTransaction>,
  estimateFunc: () => Promise<BigNumber>
) {
  const overrides: Overrides = {
    gasPrice: ctx.gasPrice,
  };

  const estimate = await estimateFunc();
  const estimateInEth = utils.formatEther(estimate.mul(ctx.gasPrice));
  console.log(
    "Gas estimation:",
    c.blue(estimate.toString()),
    `(${estimateInEth} Ξ)`
  );

  if (ctx.gasLimit > 0) {
    if (ctx.gasLimit < estimate.toNumber()) {
      throw new CLIError(
        `Gas limit is set to ${
          ctx.gasLimit
        }, but estimate is ${estimate.toString()}`
      );
    } else {
      overrides.gasLimit = ctx.gasLimit;
    }
  } else {
    overrides.gasLimit = estimate;
  }

  if (ctx.send) {
    const tx = await sendFunc(overrides);
    console.log("Transaction hash", c.blue(tx.hash), ctx.url(tx.hash));
    console.log(
      `Waiting ${c.blue(ctx.confirmations.toString())} confirmation(s)`
    );
    const receipt = await tx.wait(ctx.confirmations);
    console.log(
      "Transaction included in block",
      c.blue(receipt.blockNumber.toString())
    );
    return receipt;
  }
}
