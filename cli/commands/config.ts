import { IContext } from "../context";
import { c } from "../colors";

export default async function config(ctx: IContext) {
  console.log("Configuration for network", c.blue(ctx.network));
  console.log("Endpoint:", c.blue(ctx.endpoint));
  console.log("Private key:", c.blue("*".repeat(ctx.privateKey.length)));
  console.log(
    "Folia address:",
    c.blue(ctx.foliaAddress),
    ctx.url(ctx.foliaAddress)
  );
  console.log(
    "FoliaController address:",
    c.blue(ctx.foliaControllerAddress),
    ctx.url(ctx.foliaControllerAddress)
  );
  console.log(
    "Metadata address:",
    c.blue(ctx.metadataAddress),
    ctx.url(ctx.metadataAddress)
  );
}
