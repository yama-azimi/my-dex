// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import './Token.sol'; 

contract Exchange {
    address public feeAccount; 
    uint public feePercent; 

    mapping(address => mapping(address => uint)) public tokens; 

    constructor(address _feeAccount, uint _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint _amount) public {
        Token(_token).transferFrom(msg.sender, address(this), _amount);

        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount; 
    }
}