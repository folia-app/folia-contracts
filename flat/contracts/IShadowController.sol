// File: contracts/IShadowController.sol

pragma solidity ^0.5.0;
/**
 * The Controller is an upgradeable endpoint for controlling Folia.sol
 */


interface IShadowController {
    function isLocked(address from, address to, uint256 tokenId) external view returns (bool);
}
