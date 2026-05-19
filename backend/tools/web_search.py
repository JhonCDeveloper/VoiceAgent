"""
Name: web_search
Description: Search the web for up-to-date travel information and news.
Params:
    query (str): The search query.
Returns:
    dict: A dictionary containing a list of search results under the 'results' key, with title, url, and content.
"""

import os
from tavily import TavilyClient

def web_search(query: str) -> dict:
    """
    Search the web using Tavily Search API.
    
    Args:
        query (str): The search query.
        
    Returns:
        dict: A dictionary containing a list of results, where each result is a dict with
              'title', 'url', and 'content' keys.
    """
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return {"results": [{"title": "Error", "url": "", "content": "Tavily API key is missing."}]}
    
    try:
        client = TavilyClient(api_key=api_key)
        response = client.search(query=query, max_results=4)
        
        results = []
        for r in response.get("results", []):
            results.append({
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", "")
            })
        return {"results": results}
    except Exception as e:
        return {"results": [{"title": "Error", "url": "", "content": f"Search failed: {str(e)}"}]}
