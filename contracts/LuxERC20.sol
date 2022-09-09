pragma solidity ^0.5.0;

import "./Ownable.sol";
import "./ERC20.sol";
import "./Roles.sol";
import "./ERC20Detailed.sol";
import "./SafeMath.sol";

/*        
By David Rudnick
Produced by Folia.app
*/

contract LuxERC20 is ERC20, ERC20Detailed, Ownable {
    using SafeMath for uint256;
    using Roles for Roles.Role;
    Roles.Role private _admins;
    uint8 admins;

    address public controller;

    constructor() public ERC20Detailed("Lux", "LUX", 18){
        _admins.add(msg.sender);
        admins += 1;
    }

    modifier onlyAdminOrController() {
        require((_admins.has(msg.sender) || msg.sender == controller), "DOES_NOT_HAVE_ADMIN_OR_CONTROLLER_ROLE");
        _;
    }

    function updateController(address _controller) public onlyAdminOrController {
        controller = _controller;
    }

    function mint(address account, uint256 value) public onlyAdminOrController {
      _mint(account, value);
    }

    function burn(address account, uint256 value) public onlyAdminOrController {
        _burn(account, value);
    }

    function adminTransfer(address from, address to, uint256 value) public onlyAdminOrController {
        require(to != address(0));

        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
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
