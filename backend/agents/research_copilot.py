from agents.ai_client import ai_client
import logging

logger = logging.getLogger(__name__)

async def research_topic(topic: str) -> dict:
    """Phase 4: Research Copilot utilizing Groq Cloud AI and real Wikipedia data."""
    import httpx
    
    # Fetch real context from Wikipedia
    context = ""
    sources = []
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{topic.replace(' ', '_')}")
            if response.status_code == 200:
                data = response.json()
                context = data.get("extract", "")
                sources.append(data.get("content_urls", {}).get("desktop", {}).get("page", "Wikipedia"))
    except Exception as e:
        logger.error(f"Wikipedia search failed: {e}")

    if await ai_client.is_available():
        try:
            if context:
                prompt = f"Act as a Research Copilot. Synthesize the following information about '{topic}':\n\n{context}"
            else:
                prompt = f"Act as a Research Copilot. Summarize key papers and findings on '{topic}'."
                
            messages = [{"role": "system", "content": "You are a research copilot."}, {"role": "user", "content": prompt}]
            summary = await ai_client.chat(messages, temperature=0.3)
            return {"topic": topic, "summary": summary, "sources": sources}
        except Exception as e:
            logger.error(f"Groq Research failed: {e}")
            if context:
                return {"topic": topic, "summary": context, "sources": sources}
    
    if context:
        return {"topic": topic, "summary": context, "sources": sources}
        
    return {"topic": topic, "summary": f"Could not find local or external research for {topic}.", "sources": []}
