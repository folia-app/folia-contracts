# DeadDotComSeance

```
npx truffle migrate  --f 9 --to 9 --network <network>
yarn networks-extract
```

* verify contracts
* with deployer account do the following:
   * pause the controller globally
   * mint a new artwork with following parameters
    * <artist-address> (simon denny's)
    * <editions> total number of dotcom works
    * <price> `100000000000000000` = `1 * 10^18` = `1_000_000_000_000_000_000` = `1 ETH`
    * <paused> `false`
    * <saleType> `1` this allows the works to be bought by ID
  * mint a new artwork for each of the dotcom works (aka the `<editions>` from above)
    * <artist-address> (simon denny's)
    * <editions> total number of this dotcom work
    * <price> `10000000000000000` = `0.1 * 10^18` = `100_000_000_000_000_000` = `0.1 ETH`
    * <paused> `false`
    * <saleType> `0` this allows the works to be bought incrementally
  * buy artwork #0 edition #1 from the contract
    