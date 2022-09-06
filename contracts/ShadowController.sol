pragma solidity ^0.5.0;
/**
 * The Controller is an upgradeable endpoint for controlling Folia.sol
 */

import "./LuxChildERC20.sol";
import "./ShieldChild.sol";
import "./Shadow.sol";
import "./IShadowController.sol";
import "./SafeMath.sol";
import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./IERC721.sol";
import "./IERC165.sol";

contract ShadowController is Ownable, ReentrancyGuard, IShadowController {

    using SafeMath for uint256;
    Shadow public shadow;
    ShieldChild public shieldChild;
    LuxChildERC20 public luxChildERC20;

    bool public paused;
    bool[] public claimed;
    uint256 pauseStart;
    uint256 luxLocked;

    modifier notPaused() {
        require(!paused, "Must not be paused");
        _;
    }

    constructor(
        Shadow _shadow,
        ShieldChild _shieldChild,
        LuxChildERC20 _luxChildERC20
    ) public {
        shadow = _shadow;
        shieldChild = _shieldChild;
        luxChildERC20 = _luxChildERC20;
        pauseStart = now;
    }

    // this function will be replaced by LUX ERC20 logic eventually
    function isLocked(address from, address to, uint256 tokenId) public view returns (bool) {
        if (shieldChild.balanceOf(from) > 0) {
            return paused; // shield owners can override isLocked but can't override "paused"
        }
        if(now < pauseStart.add(luxLocked)) {
            return true;
        }
        return paused;
    }

    function increaseLock(uint256 value) public {
        luxChildERC20.adminTransfer(msg.sender, address(this), value);
        luxLocked = value.mul(60).mul(60).div(10^18); // convert 18 decimals so that it's back to hours then convert to seconds (do multiplication first to preserve accuracy)
        pauseStart = now;
    }

    function updatePaused(bool _paused) public onlyOwner {
        paused = _paused;
    }
}
