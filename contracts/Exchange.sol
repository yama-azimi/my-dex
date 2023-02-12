// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Exchange {
    address public feeAccount; 
    uint public feePercent; 

    constructor(address _feeAccount, uint _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
} 