"""
Memory Agent — Handles Spaced Repetition (Forgetting Curve) scheduling.
"""
from typing import List, Tuple
from datetime import datetime
import math
import logging

logger = logging.getLogger(__name__)

def calculate_next_review(quality: int, repetitions: int, easiness: float, interval: int) -> Tuple[int, float, int]:
    """
    SuperMemo-2 (SM-2) algorithm implementation for spaced repetition.
    quality: 0-5 scale (0 = blackout, 5 = perfect recall)
    """
    if quality < 3:
        repetitions = 0
        interval = 1
    else:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = math.ceil(interval * easiness)
        repetitions += 1
        
    # Update easiness factor
    easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    easiness = max(1.3, easiness) # Cannot go below 1.3
    
    return repetitions, easiness, interval

def get_due_items(user_items: List[dict]) -> List[dict]:
    """
    Returns a list of items that are due for review based on their next_review_date.
    """
    now = datetime.utcnow()
    due_items = []
    for item in user_items:
        next_date = item.get('next_review_date')
        if next_date and next_date <= now:
            due_items.append(item)
    return due_items
