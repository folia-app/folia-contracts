pragma solidity ^0.5.0;
import "./Folia.sol";

/*

*/

contract LTD is Folia {
    constructor(address _metadata) public Folia("Pixels Rearranged from Lightest to Darkest", "LTD", _metadata){}
}
