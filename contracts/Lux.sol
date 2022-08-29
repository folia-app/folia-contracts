pragma solidity ^0.5.0;
import "./Folia.sol";

/*        
By David Rudnick
Produced by Folia.app
*/

contract Lux is Folia {
    constructor(address _metadata) public Folia("Lux", "LUX", _metadata){}
}
