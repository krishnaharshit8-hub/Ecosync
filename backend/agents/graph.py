# backend/agents/graph.py
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END


class HouseAgentState(TypedDict):
    house_id: str
    production_kw: float
    consumption_kw: float
    battery_soc: float          # 0-100 %
    net_energy: float           # production - consumption
    priority_class: str         # 'critical' | 'residential' | 'commercial'
    action: str                 # 'SELL' | 'BUY' | 'IDLE'
    bid_price: float            # price willing to pay (BUY)
    ask_price: float            # price willing to sell at (SELL)
    trade_partner: Optional[str]  # house_id of matched partner
    reason: str                 # human-readable explanation
    surplus_kw: float           # positive=surplus, negative=deficit


# ── Node Functions ─────────────────────────────────────────

def assess_energy(state: HouseAgentState) -> HouseAgentState:
    '''Calculate net energy and surplus.'''
    net = state['production_kw'] - state['consumption_kw']
    state['net_energy'] = round(net, 3)
    state['surplus_kw'] = round(net, 3)
    return state


def decide_action(state: HouseAgentState) -> HouseAgentState:
    '''Decide whether to BUY, SELL, or IDLE.'''
    net = state['net_energy']
    batt = state['battery_soc']

    # SELL: significant surplus AND battery above 50%
    if net > 0.3 and batt > 50:
        state['action'] = 'SELL'
        base_price = 0.06
        if batt > 90:
            base_price = 0.04  # Eager to sell
        if state['priority_class'] == 'critical':
            base_price = 0.10
        state['ask_price'] = round(base_price, 4)
        state['reason'] = f'Surplus {net:.2f} kW, battery {batt}% -> SELL at ${base_price}/kWh'

    # BUY: deficit OR battery low
    elif net < -0.3 or batt < 25:
        state['action'] = 'BUY'
        base_price = 0.08
        if state['priority_class'] == 'critical':
            base_price = 0.15
        state['bid_price'] = round(base_price, 4)
        state['reason'] = f'Deficit {net:.2f} kW, battery {batt}% -> BUY at ${base_price}/kWh'

    else:
        state['action'] = 'IDLE'
        state['reason'] = f'Balanced net={net:.2f} kW, battery {batt}%'

    return state


def apply_priority_override(state: HouseAgentState) -> HouseAgentState:
    '''Critical infrastructure always gets highest bid priority.'''
    if state['priority_class'] == 'critical' and state['action'] == 'BUY':
        state['bid_price'] = max(state.get('bid_price', 0.08), 0.15)
        state['reason'] += ' [CRITICAL OVERRIDE: bid boosted]'
    return state


# ── Graph Definition ───────────────────────────────────────

def build_house_graph():
    graph = StateGraph(HouseAgentState)
    graph.add_node('assess', assess_energy)
    graph.add_node('decide', decide_action)
    graph.add_node('priority', apply_priority_override)
    graph.set_entry_point('assess')
    graph.add_edge('assess', 'decide')
    graph.add_edge('decide', 'priority')
    graph.add_edge('priority', END)
    return graph.compile()


house_graph = build_house_graph()
