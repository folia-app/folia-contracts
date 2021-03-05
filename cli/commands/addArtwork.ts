import { IContext } from "../context";
import { send } from "../send";
import { c } from "../colors";

export default async function addArtwork(
  ctx: IContext,
  address: string,
  editions: number,
  price: number,
  pause: boolean
) {
  const { foliaControllerContract } = ctx;
  console.log(
    "Call",
    c.blue`addArtwork(${address}, ${editions}, ${price}, ${pause})`
  );

  const receipt = await send(
    ctx,
    (overrides) =>
      foliaControllerContract.addArtwork(
        address,
        editions,
        price,
        pause,
        overrides
      ),
    () =>
      foliaControllerContract.estimateGas.addArtwork(
        address,
        editions,
        price,
        pause
      )
  );

  if (receipt) {
    // FIXME: not sure that's the most idiomatic way to do it. Plus it doesn't
    // leverage TypeScript.
    const [event] = receipt.events.filter((e) => e.event === "newWork");
    const workId = event.args[0].toString();
    console.log("Artwork minted with id", c.blue(workId));
  }
}
