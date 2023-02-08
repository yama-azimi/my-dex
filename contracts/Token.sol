// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Token {
    string public name;
    string public symbol;
    uint public decimals = 18;
    uint public totalSupply;

    constructor(
            string memory _name, 
            string memory _symbol, 
            uint _totalSupply
        )
         
        {
            name = _name;
            symbol = _symbol;
            totalSupply = _totalSupply * (10 ** decimals);
        }
}