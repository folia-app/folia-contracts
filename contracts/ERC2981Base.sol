// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import './ERC165.sol';
import './IERC2981Royalties.sol';

/// @dev This is a contract used to add ERC2981 support to ERC721 and 1155
contract ERC2981Base is ERC165, IERC2981Royalties {
    struct RoyaltyInfo {
        address recipient;
        uint24 amount;
    }

    /// bytes4(keccak256("royaltyInfo(uint256,uint256)")) == 0x2a55205a
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    constructor() public {
      _registerInterface(_INTERFACE_ID_ERC2981);
    }
}