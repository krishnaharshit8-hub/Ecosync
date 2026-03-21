# backend/agents/orchestrator.py
import asyncio, logging
from backend.agents.graph import house_graph, HouseAgentState
from backend.models.lstm_model import get_prediction
from backend.db.database import SessionLocal
from backend.db.schemas import House, EnergyReading, Trade, AgentLog
from backend.blockchain.web3_client import execute_trade
from sqlalchemy import desc
from datetime import datetime

logger = logging.getLogger('orchestrator')

HOUSE_IDS = ['H1', 'H2', 'H3', 'H4', 'H5']

# Map house_id to blockchain wallet address (set these in config)
HOUSE_WALLETS = {
    'H1': '0xAbCd...1111',
    'H2': '0xAbCd...2222',
    'H3': '0xAbCd...3333',
    'H4': '0xAbCd...4444',
    'H5': '0xAbCd...5555',
}


async def run_orchestrator_loop(manager):
    '''Main loop: runs every 30 seconds.'''
    while True:
        await asyncio.sleep(30)
        await tick(manager)


async def tick(manager):
    db = SessionLocal()
    try:
        houses = db.query(House).all()
        states = []

        for house in houses:
            pred = get_prediction(house.id)
            if pred is None:
                continue

            last = db.query(EnergyReading).filter_by(
                house_id=house.id).order_by(desc('timestamp')).first()
            battery = last.battery_soc_percent if last else 50.0

            state = HouseAgentState(
                house_id=house.id,
                production_kw=pred['pred_production_kw'],
                consumption_kw=pred['pred_consumption_kw'],
                battery_soc=battery,
                net_energy=0, surplus_kw=0,
                priority_class=house.priority_class,
                action='IDLE', bid_price=0.08, ask_price=0.08,
                trade_partner=None, reason=''
            )
            result = house_graph.invoke(state)
            states.append(result)

            db.add(AgentLog(house_id=house.id, action=result['action'],
                            reason=result['reason'], timestamp=datetime.now()))
            db.commit()

        # Match sellers with buyers
        sellers = sorted([s for s in states if s['action'] == 'SELL'],
                         key=lambda x: x['ask_price'])
        buyers = sorted([s for s in states if s['action'] == 'BUY'],
                        key=lambda x: x['bid_price'], reverse=True)

        for buyer in buyers:
            for seller in sellers:
                if seller.get('matched'):
                    continue
                if buyer['bid_price'] >= seller['ask_price']:
                    amount = min(abs(buyer['surplus_kw']), seller['surplus_kw'])
                    try:
                        tx = execute_trade(
                            HOUSE_WALLETS[seller['house_id']],
                            HOUSE_WALLETS[buyer['house_id']],
                            amount, seller['ask_price']
                        )
                    except Exception as e:
                        logger.error(f'Trade failed: {e}')
                        tx = None

                    trade = Trade(
                        seller_id=seller['house_id'],
                        buyer_id=buyer['house_id'],
                        amount_kw=amount,
                        price_per_kwh=seller['ask_price'],
                        tx_hash=tx,
                        status='confirmed' if tx else 'failed'
                    )
                    db.add(trade)
                    db.commit()

                    seller['matched'] = True
                    await manager.broadcast({
                        'type': 'new_trade',
                        'data': {
                            'seller': seller['house_id'],
                            'buyer': buyer['house_id'],
                            'amount_kw': amount,
                            'tx_hash': tx or 'pending',
                            'timestamp': datetime.now().isoformat()
                        }
                    })
                    break
    finally:
        db.close()
