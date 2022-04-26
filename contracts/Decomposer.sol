pragma solidity ^0.5.0;
import "./Folia.sol";

/*
....................................................................................
....................................................................................
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
====================================================================================
====================================================================================
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
      XX       XX      XX      XX   XXXX   X      XXX      XX       X       X      X
  XXX  X  XXXXXX  XXXXXX  XXXX  X    XX    X  XXX  X  XXXX  X  XXXXXX  XXXXXX  XXX  
  XXX  X     XXX  XXXXXX  XXXX  X  X    X  X      XX  XXXX  X       X     XXX      X 
  XXX  X  XXXXXX  XXXXXX  XXXX  X  XX  XX  X  XXXXXX  XXXX  XXXXXX  X  XXXXXX  XXX  
      XX       XX      XX      XX  XXXXXX  X  XXXXXXX      XX       X       X  XXX  

      
          
By Oliver Laric
Produced by Folia.app
*/

contract Decomposer is Folia {
    constructor(address _metadata) public Folia("Decomposer", "DCMP", _metadata){}
}
