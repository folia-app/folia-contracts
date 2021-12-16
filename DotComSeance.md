# DotComSeance Deploy Sequence

## This Repo

Deploy NFT Contract, Controller Contract and Metadata Contract from `accounts[0]`

```
npx truffle migrate  --f 9 --to 9 --network <network>
```

extract the new deployment locations to the networks file
```
yarn networks-extract
```

Flatten and verify all 3 contracts

```
./flatten.sh
```

Compiler version is 0.5.0+commit.1d4f565a.Emscripten.clang  
Runs are 2000000

Configure the contract from `accounts[0]`

```
npx truffle migrate  --f 11 --to 11 --network <network>
```

This command does the following:

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
* buy work id #0 edition id #1 from the contract for pets.com
  * buy it for `account[1]`
  * work id 0
  * edition id 1
  * value 1 ether
* pause the controller globally


## The Subdomain Registrar Repo

[link](https://github.com/folia-app/subdomain-registrar)

Update artifacts in subdomain registrar with deploy info from folia-contracts

```
cp ./build/contracts/DotComSeance.json ../subdomain-registrar/build/contracts
```

Run the deploy script for subdomain registrar from the `accounts[0]` (owns the ENS names)

```
npx truffle migrate --f 2 --to 2 --network <network>
```

This will deploy the registrar, give it the dotcomseance nft address for perms, and set the controller for each of the ENS names to be the new subdomain registrar contract address.

Flatten the contracts and verify them

```
./flatten.sh
```

Compiler version is 0.5.16+commit.9c3226ce.Emscripten.clang
Runs are off

To confirm that the owner of the NFT can set permissions, let `accounts[1]` try configuring the pets.com address.

When sale is ready to go live, unpause the dotcomseacncecontroller contract on Etherscan.

If there are any subdomains registered that shouldn't be you can edit the `3_test.js` file in the subdomain-registrar repo and execute from the ENS name owner account (`accounts[0]`) to `unregister()` the name.