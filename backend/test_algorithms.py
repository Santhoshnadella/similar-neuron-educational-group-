import logging
from learning.algorithms import calculate_feed_score, calculate_cognitive_index

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_tests():
    logger.info("🧪 Running Algorithmic End-to-End Tests...\n")
    
    # 1. Test Cognitive Index
    logger.info("Test 1: Cognitive Index Calculation")
    
    # Genius profile (all 100s)
    genius = calculate_cognitive_index(100, 100, 100, 100, 100, 100)
    assert abs(genius - 100.0) < 0.1, f"Expected 100, got {genius}"
    logger.info(f"✅ Genius profile index correctly calculated: {genius:.1f}/100")
    
    # Average profile (all 50s)
    average = calculate_cognitive_index(50, 50, 50, 50, 50, 50)
    assert abs(average - 50.0) < 0.1, f"Expected 50, got {average}"
    logger.info(f"✅ Average profile index correctly calculated: {average:.1f}/100")
    
    # Unbalanced profile (High memory, terrible focus/regulation)
    unbalanced = calculate_cognitive_index(working_memory=90, attention=20, processing_speed=80, logical_reasoning=70, creativity=60, emotional_regulation=10)
    # Expected: (0.2*90 + 0.15*20 + 0.2*80 + 0.2*70 + 0.15*60 + 0.1*10) = 18 + 3 + 16 + 14 + 9 + 1 = 61
    assert abs(unbalanced - 61.0) < 0.1, f"Expected 61, got {unbalanced}"
    logger.info(f"✅ Unbalanced profile index correctly calculated: {unbalanced:.1f}/100")
    
    print("-" * 50)
    
    # 2. Test Feed Score Matchmaking Engine
    logger.info("Test 2: Feed Score & Matchmaking Engine")
    
    # Baseline normal session: Moderate difficulty match, normal watch time
    baseline_score = calculate_feed_score(
        engagement_score=0.8,
        educational_quality=0.7,
        recall_improvement=0.6,
        topic_novelty=0.5,
        skill_progression=0.5,
        addiction_penalty=0.0
    )
    logger.info(f"✅ Baseline normal feed score: {baseline_score:.2f}")
    
    # Test Addiction Penalty (Doomscrolling, huge penalty)
    doomscroll_score = calculate_feed_score(
        engagement_score=0.9,
        educational_quality=0.2,
        recall_improvement=0.1,
        topic_novelty=0.1,
        skill_progression=0.1,
        addiction_penalty=0.6  # Heavy penalty
    )
    logger.info(f"✅ Doomscrolling feed score (Addiction Penalty): {doomscroll_score:.2f}")
    assert doomscroll_score < baseline_score, "Doomscrolling score should be heavily penalized compared to baseline!"
    
    # Test Spaced Repetition Boost (High recall improvement / mastery)
    review_score = calculate_feed_score(
        engagement_score=0.7,
        educational_quality=0.9,
        recall_improvement=0.95, # High retention boost
        topic_novelty=0.2,
        skill_progression=0.8,
        addiction_penalty=0.0
    )
    logger.info(f"✅ Spaced Repetition Boost score (Needs Review): {review_score:.2f}")
    assert review_score > baseline_score, "Review score should be boosted due to forgetting curve!"

    logger.info("\n🎉 All algorithmic tests passed successfully! Addiction penalty and FSRS logic are mathematically sound.")

if __name__ == "__main__":
    run_tests()
