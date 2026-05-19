import os
import logging
import requests
from bs4 import BeautifulSoup
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

logger = logging.getLogger(__name__)

# Global in-memory vector store
_vector_store = None

def ingest(url: str = None) -> dict:
    """
    Scrape a URL, parse with BeautifulSoup, split text into chunks,
    generate embeddings with text-embedding-3-small, and index them in FAISS.
    
    Args:
        url (str, optional): Target URL to ingest. If None, retrieves from RAG_SOURCE_URL.
        
    Returns:
        dict: A dictionary containing the number of chunks indexed.
    """
    global _vector_store
    
    if not url:
        url = os.getenv("RAG_SOURCE_URL")
        
    if not url:
        logger.warning("RAG URL is not set. Skipping ingestion.")
        return {"chunks_indexed": 0}
        
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY is not set. Skipping ingestion.")
        return {"chunks_indexed": 0}
        
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        text = soup.get_text(separator=" ", strip=True)
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_text(text)
        
        if not chunks:
            logger.warning("No text extracted to index.")
            return {"chunks_indexed": 0}
            
        embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=api_key
        )
        
        _vector_store = FAISS.from_texts(chunks, embeddings)
        logger.info(f"Ingested RAG source. Indexed {len(chunks)} chunks.")
        return {"chunks_indexed": len(chunks)}
        
    except Exception as e:
        logger.error(f"Error during RAG ingestion: {str(e)}")
        raise e

def retrieve(query: str, k: int = 3) -> str:
    """
    Search the vector store for documents matching the query.
    
    Args:
        query (str): The search query.
        k (int): Number of top results to return.
        
    Returns:
        str: Concatenated matching text chunks or an empty string.
    """
    global _vector_store
    
    if _vector_store is None:
        logger.warning("Vector store is not initialized. No context retrieved.")
        return ""
        
    try:
        docs = _vector_store.similarity_search(query, k=k)
        retrieved_texts = [doc.page_content for doc in docs]
        return "\n\n".join(retrieved_texts)
    except Exception as e:
        logger.error(f"Error during RAG retrieval: {str(e)}")
        return ""
