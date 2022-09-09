pragma solidity ^0.5.0;
import "./Folia.sol";
import "./MetadataUpdate.sol";

/*        
By David Rudnick
Produced by Folia.app
*/

contract Shield is Folia {
    constructor(address _metadata) public Folia("Shield", "SHLD", _metadata){}

    function tokenURI(uint _tokenId) external view returns (string memory _infoUrl) {
        return MetadataUpdate(metadata).tokenURI(_tokenId);
    }
}
