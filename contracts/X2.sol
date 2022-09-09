pragma solidity ^0.5.0;
import "./Folia.sol";
import "./MetadataUpdate.sol";

/*        
By David Rudnick
Produced by Folia.app
*/

contract X2 is Folia {
    constructor(address recipient, address _metadata) public Folia("X2", "X2", _metadata){
        for(uint256 i = 1; i <= 18; i++ ) {
            _mint(recipient, i);
        }
    }

    function tokenURI(uint _tokenId) external view returns (string memory _infoUrl) {
        return MetadataUpdate(metadata).tokenURI(_tokenId);
    }
}
