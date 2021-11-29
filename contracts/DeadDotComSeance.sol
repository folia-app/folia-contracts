pragma solidity ^0.5.0;
import "./Folia.sol";

/*
 ______   _______  _______  ______  
(  __  \ (  ____ \(  ___  )(  __  \ 
| (  \  )| (    \/| (   ) || (  \  )
| |   ) || (__    | (___) || |   ) |
| |   | ||  __)   |  ___  || |   | |
| |   ) || (      | (   ) || |   ) |
| (__/  )| (____/\| )   ( || (__/  )
(______/ (_______/|/     \|(______/ 
                                    
 ______   _______ _________ _______  _______  _______ 
(  __  \ (  ___  )\__   __/(  ____ \(  ___  )(       )
| (  \  )| (   ) |   ) (   | (    \/| (   ) || () () |
| |   ) || |   | |   | |   | |      | |   | || || || |
| |   | || |   | |   | |   | |      | |   | || |(_)| |
| |   ) || |   | |   | |   | |      | |   | || |   | |
| (__/  )| (___) |   | |   | (____/\| (___) || )   ( |
(______/ (_______)   )_(   (_______/(_______)|/     \|
                                                      
 _______  _______  _______  _        _______  _______ 
(  ____ \(  ____ \(  ___  )( (    /|(  ____ \(  ____ \
| (    \/| (    \/| (   ) ||  \  ( || (    \/| (    \/
| (_____ | (__    | (___) ||   \ | || |      | (__    
(_____  )|  __)   |  ___  || (\ \) || |      |  __)   
      ) || (      | (   ) || | \   || |      | (      
/\____) || (____/\| )   ( || )  \  || (____/\| (____/\
\_______)(_______/|/     \||/    )_)(_______/(_______/
                                                      

"There are no bad ideas in tech, only bad timing"
- Marc Andreessen

Dead DotCom Seance — Simon Denny, Guile Twardowski, Cosmographia (David Holz)
Published in partnership wth Folia (Billy Rennenkamp, Dan Denorch, Everett Williams)
*/

contract DeadDotComSeance is Folia {
    constructor(address _metadata) public Folia("Dead DotCom Seance", "DOTCOM", _metadata){}

}
