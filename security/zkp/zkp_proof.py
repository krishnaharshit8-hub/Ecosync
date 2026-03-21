# security/zkp/zkp_proof.py
# Hash Commitment ZKP Placeholder
# Proves: 'I have surplus > X kW' without revealing actual production
import hashlib, hmac, secrets


def commit(value: float, secret_key: str) -> str:
    '''Create a commitment to a value without revealing it.
    Returns: hex string commitment.
    '''
    msg = f'{value:.6f}'.encode()
    key = secret_key.encode()
    return hmac.new(key, msg, hashlib.sha256).hexdigest()


def prove_surplus(production_kw: float, threshold_kw: float,
                  secret_key: str) -> dict:
    '''Prove that production_kw > threshold_kw without revealing production_kw.
    Returns proof dict that the verifier checks.
    '''
    assert production_kw > threshold_kw, 'Cannot prove false statement'
    commitment = commit(production_kw, secret_key)
    # The 'proof' is that we can sign both the commitment and the threshold
    nonce = secrets.token_hex(16)
    proof_hash = hashlib.sha256(
        f'{commitment}{threshold_kw}{nonce}'.encode()
    ).hexdigest()

    return {
        'commitment': commitment,
        'threshold': threshold_kw,
        'nonce': nonce,
        'proof': proof_hash,
        'verified': True  # In real ZKP, verifier independently checks this
    }


def verify_proof(proof: dict) -> bool:
    '''Verifier checks the proof without learning the actual value.'''
    expected = hashlib.sha256(
        f"{proof['commitment']}{proof['threshold']}{proof['nonce']}".encode()
    ).hexdigest()
    return expected == proof['proof']
