pragma solidity ^0.5.0;
import "./ERC721Full.sol";
import "./IERC20.sol";
import "./Ownable.sol";
import "./Roles.sol";
import "./Metadata.sol";



/**
 * Folia contract is a Full ERC721 that has external metadata and controller contracts that can be updated by admin addresses or the current controller itself.
 * Admin addresses can be updated by the owner address.
 * Eth or ERC20s that have been sent to the contract can be moved out by an Admin or the controller contract.
 */
contract Folia is ERC721Full, Ownable {
    using Roles for Roles.Role;
    Roles.Role private _admins;
    uint8 admins;

    address public metadata;
    address public controller;

    modifier onlyAdminOrController() {
        require((_admins.has(msg.sender) || msg.sender == controller), "DOES_NOT_HAVE_ADMIN_OR_CONTROLLER_ROLE");
        _;
    }

    constructor(string memory name, string memory symbol, address _metadata) public ERC721Full(name, symbol) {
        metadata = _metadata;
        _admins.add(msg.sender);
        admins += 1;
    }

    function mint(address recipient, uint256 tokenId) public onlyAdminOrController {
        _mint(recipient, tokenId);
    }
    function burn(uint256 tokenId) public onlyAdminOrController {
        _burn(ownerOf(tokenId), tokenId);
    }
    function updateMetadata(address _metadata) public onlyAdminOrController {
        metadata = _metadata;
    }
    function updateController(address _controller) public onlyAdminOrController {
        controller = _controller;
    }

    function addAdmin(address _admin) public onlyOwner {
        _admins.add(_admin);
        admins += 1;
    }
    function removeAdmin(address _admin) public onlyOwner {
        require(admins > 1, "CANT_REMOVE_LAST_ADMIN");
        _admins.remove(_admin);
        admins -= 1;
    }

    function tokenURI(uint _tokenId) external view returns (string memory _infoUrl) {
        return Metadata(metadata).tokenURI(_tokenId);
    }

    /**
    * @dev Moves Eth to a certain address for use in the FoliaController
    * @param _to The address to receive the Eth.
    * @param _amount The amount of Eth to be transferred.
    */
    function moveEth(address payable _to, uint256 _amount) public onlyAdminOrController {
        require(_amount <= address(this).balance);
        _to.transfer(_amount);
    }
    /**
    * @dev Moves Token to a certain address for use in the FoliaController
    * @param _to The address to receive the Token.
    * @param _amount The amount of Token to be transferred.
    * @param _token The address of the Token to be transferred.
    */
    function moveToken(address _to, uint256 _amount, address _token) public onlyAdminOrController returns (bool) {
        require(_amount <= IERC20(_token).balanceOf(address(this)));
        return IERC20(_token).transfer(_to, _amount);
    }

}
