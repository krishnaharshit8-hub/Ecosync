# backend/blockchain/web3_client.py
from web3 import Web3
from backend.config import settings
import json, os, logging

logger = logging.getLogger('web3_client')

# ABI for EnergyTrade.sol (only the functions we call)
ENERGY_TRADE_ABI = json.loads('[{"inputs":[{"internalType":"address","name":"_seller","type":"address"},{"internalType":"address","name":"_buyer","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"executeTrade","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}]')

w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))
account = w3.eth.account.from_key(settings.PRIVATE_KEY)
contract = w3.eth.contract(
    address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
    abi=ENERGY_TRADE_ABI
)

def execute_trade(seller_addr: str, buyer_addr: str,
                  amount_kw: float, price_per_kwh: float) -> str:
    '''Execute energy trade on Polygon. Returns tx_hash string.'''
    try:
        amount_wei = int(amount_kw * 1000)  # Store as milliwatts
        price_wei = int(price_per_kwh * 1e18)  # Store as wei
        nonce = w3.eth.get_transaction_count(account.address)
        txn = contract.functions.executeTrade(
            Web3.to_checksum_address(seller_addr),
            Web3.to_checksum_address(buyer_addr),
            amount_wei, price_wei
        ).build_transaction({
            'chainId': 80001,  # Mumbai testnet
            'gas': 200000,
            'gasPrice': w3.to_wei('30', 'gwei'),
            'nonce': nonce,
        })
        signed = w3.eth.account.sign_transaction(txn, settings.PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
        logger.info(f'Trade executed: {tx_hash.hex()}')
        return tx_hash.hex()
    except Exception as e:
        logger.error(f'Blockchain trade failed: {e}')
        raise
