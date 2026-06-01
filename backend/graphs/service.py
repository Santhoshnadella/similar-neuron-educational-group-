import networkx as nx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.models import Content
import logging

logger = logging.getLogger(__name__)

# Global in-memory graph
G = nx.DiGraph()

async def build_graph_from_db(db: AsyncSession):
    """Build the global knowledge graph from the SQLite database."""
    global G
    G.clear()
    
    logger.info("Building Knowledge Graph from database...")
    result = await db.execute(select(Content))
    contents = result.scalars().all()
    
    for content in contents:
        # Link prerequisites -> concepts
        concepts = content.concepts or []
        prereqs = content.prerequisites or []
        
        # Ensure all nodes exist
        for concept in concepts:
            G.add_node(concept, type="concept", domain=content.domain)
        for prereq in prereqs:
            G.add_node(prereq, type="concept", domain=content.domain)
            
        # Add edges for prereq -> concept
        for prereq in prereqs:
            for concept in concepts:
                G.add_edge(prereq, concept)
                
    logger.info(f"Knowledge Graph built with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges.")


def get_subgraph_for_topic(topic: str, radius: int = 2):
    """Return a neighborhood graph around a specific topic, with computed layout."""
    if topic not in G:
        # If topic doesn't exist, we might want to return an empty graph or a single node
        return {"topic": topic, "nodes": [{"id": topic, "label": topic, "type": "root", "x": 0, "y": 0}], "edges": []}
    
    # Get undirected version for neighborhood extraction
    undir_G = G.to_undirected()
    
    # Find all nodes within 'radius' distance
    if topic in undir_G:
        nodes = list(nx.single_source_shortest_path_length(undir_G, topic, cutoff=radius).keys())
    else:
        nodes = [topic]
        
    subG = G.subgraph(nodes)
    
    # Compute positions using spring layout
    pos = nx.spring_layout(subG, scale=300, center=(0,0))
    
    output_nodes = []
    for node in subG.nodes():
        node_type = "root" if node == topic else subG.nodes[node].get("type", "concept")
        output_nodes.append({
            "id": node,
            "label": node,
            "type": node_type,
            "x": pos[node][0] if node in pos else 0,
            "y": pos[node][1] if node in pos else 0,
        })
        
    output_edges = []
    for u, v in subG.edges():
        output_edges.append({
            "source": u,
            "target": v
        })
        
    return {
        "topic": topic,
        "nodes": output_nodes,
        "edges": output_edges
    }
