pragma solidity ^0.5.0;
import "./Folia.sol";
import "./MetadataUpdate.sol";
/*        
By David Rudnick
Produced by Folia.app
*/

contract ShieldChild is Folia {
    address public childChainManagerProxy;

    constructor(address _metadata, address _childChainManagerProxy) public Folia("Shield", "SHLD", _metadata){
          childChainManagerProxy = _childChainManagerProxy;
    }

    // being proxified smart contract, most probably childChainManagerProxy contract's address
    // is not going to change ever, but still, lets keep it 
    function updateChildChainManager(address newChildChainManagerProxy) external onlyOwner {
        require(newChildChainManagerProxy != address(0), "Bad ChildChainManagerProxy address");

        childChainManagerProxy = newChildChainManagerProxy;
    }

    function deposit(address user, bytes calldata depositData) external {
        require(msg.sender == childChainManagerProxy, "You're not allowed to deposit");

        uint256 tokenId = abi.decode(depositData, (uint256));
        _mint(user, tokenId);
    }

    function withdraw(uint256 tokenId) external {
        require(msg.sender == ownerOf(tokenId), "ChildERC721: INVALID_TOKEN_OWNER");
        _burn(tokenId);
    }

    function tokenURI(uint _tokenId) external view returns (string memory _infoUrl) {
        return MetadataUpdate(metadata).tokenURI(_tokenId);
    }
    
}
