// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EnergyTrade
 * @notice Manages peer-to-peer energy trades for EcoSync microgrids.
 * @dev Deployed on Polygon Mumbai testnet for HACK4IMPACT demo.
 */
contract EnergyTrade {
    // ── State Variables ───────────────────────────────────
    address public owner;
    bool public paused;
    uint256 public tradeCount;
    mapping(address => bool) public authorizedAgents;

    // ── Structs ───────────────────────────────────────────
    struct Trade {
        uint256 tradeId;
        address seller;
        address buyer;
        uint256 amountMilliWatts; // amount × 1000 to avoid decimals
        uint256 priceWei;         // price per kWh in wei
        uint256 timestamp;
        bool settled;
    }

    // ── Storage ───────────────────────────────────────────
    mapping(uint256 => Trade) public trades;
    mapping(address => uint256[]) public sellerTrades;
    mapping(address => uint256[]) public buyerTrades;

    // ── Events ────────────────────────────────────────────
    event TradeExecuted(
        uint256 indexed tradeId,
        address indexed seller,
        address indexed buyer,
        uint256 amountMilliWatts,
        uint256 priceWei,
        uint256 timestamp
    );
    event AgentAuthorized(address agent, bool status);
    event ContractPaused(bool paused);

    // ── Modifiers ─────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, 'Not owner');
        _;
    }
    modifier onlyAgent() {
        require(authorizedAgents[msg.sender] || msg.sender == owner,
                'Not authorized agent');
        _;
    }
    modifier notPaused() {
        require(!paused, 'Contract is paused');
        _;
    }

    // ── Constructor ───────────────────────────────────────
    constructor() {
        owner = msg.sender;
        authorizedAgents[msg.sender] = true;
        paused = false;
        tradeCount = 0;
    }

    // ── Core Function ─────────────────────────────────────
    /**
     * @notice Execute an energy trade between two houses.
     * @param _seller Address of the energy-selling building
     * @param _buyer Address of the energy-buying building
     * @param _amount Amount in milliwatts (kW × 1000)
     * @param _price Price per kWh in wei
     * @return tradeId The ID of the created trade record
     */
    function executeTrade(
        address _seller,
        address _buyer,
        uint256 _amount,
        uint256 _price
    ) external onlyAgent notPaused returns (uint256) {
        require(_seller != address(0), 'Invalid seller');
        require(_buyer != address(0), 'Invalid buyer');
        require(_seller != _buyer, 'Seller cannot buy from self');
        require(_amount > 0, 'Amount must be positive');

        tradeCount++;
        trades[tradeCount] = Trade({
            tradeId: tradeCount,
            seller: _seller,
            buyer: _buyer,
            amountMilliWatts: _amount,
            priceWei: _price,
            timestamp: block.timestamp,
            settled: true
        });

        sellerTrades[_seller].push(tradeCount);
        buyerTrades[_buyer].push(tradeCount);

        emit TradeExecuted(tradeCount, _seller, _buyer, _amount, _price, block.timestamp);

        return tradeCount;
    }

    // ── View Functions ────────────────────────────────────
    function getTrade(uint256 _id) external view returns (Trade memory) {
        return trades[_id];
    }
    function getSellerTrades(address _seller) external view returns (uint256[] memory) {
        return sellerTrades[_seller];
    }
    function getBuyerTrades(address _buyer) external view returns (uint256[] memory) {
        return buyerTrades[_buyer];
    }

    // ── Admin Functions ───────────────────────────────────
    function setAgent(address _agent, bool _status) external onlyOwner {
        authorizedAgents[_agent] = _status;
        emit AgentAuthorized(_agent, _status);
    }
    function emergencyPause(bool _paused) external onlyOwner {
        paused = _paused;
        emit ContractPaused(_paused);
    }
}
