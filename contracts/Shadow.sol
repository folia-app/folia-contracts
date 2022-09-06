pragma solidity ^0.5.0;
import "./Folia.sol";
import "./IShadowController.sol";
import "./MetadataUpdate.sol";

/*        
By David Rudnick
Produced by Folia.app
*/

contract Shadow is Folia {
    address tombCouncil;

    constructor(address _tombCouncil, address _metadata) public Folia("House SHADOW", "SHD", _metadata){
        tombCouncil = _tombCouncil;
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
}
