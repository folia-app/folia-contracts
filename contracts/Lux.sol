pragma solidity ^0.5.0;
import "./Folia.sol";
import "./MetadataUpdate.sol";
/*        
By David Rudnick
Produced by Folia.app
*/

contract Lux is Folia {
    constructor(address _metadata) public Folia("Lux", "LUX", _metadata){}

    function tokenURI(uint _tokenId) external view returns (string memory _infoUrl) {
        return MetadataUpdate(metadata).tokenURI(_tokenId);
    }
}
