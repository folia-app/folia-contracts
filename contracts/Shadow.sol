pragma solidity ^0.5.0;
import "./Folia.sol";
import "./IShadowController.sol";
import "./ERC2981ContractWideRoyalties.sol";
import "./MetadataUpdate.sol";

/*

//    .^7??????????????????????????????????????????????????????????????????7!:       .~7????????????????????????????????:
//     :#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@Y   ^#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@5
//    ^@@@@@@#BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB&@@@@@B ~@@@@@@#BBBBBBBBBBBBBBBBBBBBBBBBBBBBB#7
//    Y@@@@@#                                                                ~@@@@@@ P@@@@@G
//    .&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&G~ ~@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@Y :@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&P~
//      J&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#.!B@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@B~   .Y&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@B
//         ...........................B@@@@@5  .7#@@@@@@@#?^....................          ..........................:#@@@@@J
//    ^5YYYJJJJJJJJJJJJJJJJJJJJJJJJJJY&@@@@@?     .J&@@@@@@&5JJJJJJJJJJJJJJJJJJJYYYYYYYYYYJJJJJJJJJJJJJJJJJJJJJJJJJJY@@@@@@!
//    5@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@?         :5&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@7
//    !GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPY~              ^JPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPJ^


// _____________________________________________________ Tomb Series ______________________________________________________

// _____________________________________________________ House SHADOW _____________________________________________________

// _____________________________________________ All artwork by David Rudnick _____________________________________________

// ________________________________________________ Deployed by Folia 2022 ________________________________________________

*/

contract Shadow is Folia, ERC2981ContractWideRoyalties {
    address tombCouncil;

    constructor(address _tombCouncil, address _metadata, address royaltyRecipient) public Folia("House SHADOW", "SHD", _metadata){
        tombCouncil = _tombCouncil;
        _setRoyalties(royaltyRecipient, 1_000); // 1,000 / 10,000 = 10%
    }

    function init() public {
        require(msg.sender == tombCouncil, "Only tombCouncil can init");
         for (uint256 i = 1; i <= 36; i++) {
            _mint(tombCouncil, i);
        }
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId));
        require(!IShadowController(controller).isLocked(from, to, tokenId), "SHADOW is locked");
        _transferFrom(from, to, tokenId);
    }

    function tokenURI(uint _tokenId) external view returns (string memory _infoUrl) {
        return MetadataUpdate(metadata).tokenURI(_tokenId);
    }

    /// @notice Allows to set the royalties on the contract
    /// @dev This function in a real contract should be protected with a onlyOwner (or equivalent) modifier
    /// @param recipient the royalties recipient
    /// @param value royalties value (between 0 and 10000)
    function setRoyalties(address recipient, uint256 value) public onlyAdminOrController {
        _setRoyalties(recipient, value);
    }
}
