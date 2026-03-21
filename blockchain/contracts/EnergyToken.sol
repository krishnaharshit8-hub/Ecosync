// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EnergyToken (EKWH)
 * @notice ERC-20 token representing 1 kilowatt-hour of energy credit.
 */
contract EnergyToken {
    string public name = 'EcoSync Energy Token';
    string public symbol = 'EKWH';
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public minter;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 _initialSupply) {
        minter = msg.sender;
        _mint(msg.sender, _initialSupply * 10 ** decimals);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, 'Insufficient balance');
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, 'Insufficient balance');
        require(allowance[from][msg.sender] >= amount, 'Not approved');
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, 'Only minter');
        _mint(to, amount);
    }
}
