def calculate_cognitive_index(
    working_memory: float,
    attention: float,
    processing_speed: float,
    logical_reasoning: float,
    creativity: float,
    emotional_regulation: float
) -> float:
    """
    Evaluates overall Cognitive Index based on the exact weights from the design doc.
    """
    return (
        0.2 * working_memory +
        0.15 * attention +
        0.2 * processing_speed +
        0.2 * logical_reasoning +
        0.15 * creativity +
        0.1 * emotional_regulation
    )


def calculate_feed_score(
    engagement_score: float,
    educational_quality: float,
    recall_improvement: float,
    topic_novelty: float,
    skill_progression: float,
    addiction_penalty: float
) -> float:
    """
    Calculates the Feed Score for ranking educational content.
    
    Weights (adjustable based on platform goals):
    - EngagementWeight: 0.2
    - LearningValueWeight: 0.3
    - RetentionWeight: 0.2
    - CuriosityWeight: 0.15
    - MasteryWeight: 0.15
    """
    engagement_weight = 0.2
    learning_value_weight = 0.3
    retention_weight = 0.2
    curiosity_weight = 0.15
    mastery_weight = 0.15
    
    score = (
        engagement_weight * engagement_score +
        learning_value_weight * educational_quality +
        retention_weight * recall_improvement +
        curiosity_weight * topic_novelty +
        mastery_weight * skill_progression
    ) - addiction_penalty
    
    return max(0.0, score)  # Prevent negative scores

