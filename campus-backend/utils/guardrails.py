# utils/guardrails.py
def is_blocked(message: str) -> bool:
    banned = ["hack", "exploit", "attack"]
    return any(w in message.lower() for w in banned)
