// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Token {
    string public name;
    string public symbol;
    uint public decimals = 18;
    uint public totalSupply;

    mapping(address => uint) public balanceOf; 

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint _value
    );
    constructor(
            string memory _name, 
            string memory _symbol, 
            uint _totalSupply
        )
         
        {
            name = _name;
            symbol = _symbol;
            totalSupply = _totalSupply * (10 ** decimals);
            balanceOf[msg.sender] = totalSupply; 
        }

    function transfer(address _to, uint _value) public returns (bool success) {
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value; 
        balanceOf[_to] = balanceOf[_to] + _value; 

        emit Transfer(msg.sender, _to, _value);

        return true;  
    }
}
