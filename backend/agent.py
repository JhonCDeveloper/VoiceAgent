import os
import json
import logging
import httpx
from openai import OpenAI
from tools.web_search import web_search
from tools.currency import currency_convert
from rag.pipeline import retrieve

logger = logging.getLogger(__name__)

# System Prompt with at least 7 numbered instructions
SYSTEM_PROMPT = """You are Nomad AI, a professional, minimal, and serious voice-enabled travel assistant.
Here are your strict operating instructions:
1. Role and Scope: You assist users with travel planning, local guides, weather, news, and exchange rates. Refuse tasks unrelated to travel.
2. Tone: Speak in a professional, polite, concise, and direct manner. Avoid verbose pleasantries or conversational filler.
3. Web Search Tool: Use the `web_search` tool whenever the user asks about real-time events, current weather, local updates, or details not present in the RAG context.
4. Currency Converter Tool: Use the `currency_convert` tool whenever the user asks for converting money or currency rates. Do not try to guess or use outdated rates.
5. Context/RAG: Utilize the retrieved document context provided at the beginning of the message to answer specific questions about the destination (e.g. Japan).
6. Language Match: Always respond in the same language that the user used to message you (e.g., if they speak Spanish, respond in Spanish; if English, respond in English).
7. Response Format: Provide clean, clear, markdown-formatted answers. If voice mode is active, ensure the text is readable and easily spoken. Keep it concise.
"""

# Global memory map: session_id -> list of messages
sessions_memory = {}

def trim_to_visible_limit(memory_list, limit=7):
    """
    Keeps the last `limit` visible messages (user + assistant text),
    along with any internal tool messages that occurred between them,
    and ensures the resulting history doesn't start with orphaned tool calls.
    """
    if not memory_list:
        return []
        
    visible_count = 0
    start_idx = 0
    for i in range(len(memory_list)-1, -1, -1):
        msg = memory_list[i]
        if msg["role"] == "user":
            visible_count += 1
        elif msg["role"] == "assistant" and msg.get("content"):
            visible_count += 1
            
        if visible_count == limit:
            start_idx = i
            break
            
    sliced = memory_list[start_idx:]
    
    # Safe slice to prevent orphaned tool messages at the cut point
    while sliced:
        first = sliced[0]
        if first["role"] == "tool":
            sliced.pop(0)
        elif first["role"] == "assistant" and first.get("tool_calls"):
            if len(sliced) > 1 and sliced[1]["role"] == "tool":
                break
            else:
                sliced.pop(0)
        else:
            break
            
    return sliced

def run_agent(session_id: str, message_text: str) -> dict:
    """
    Run the GPT-4o agent loop with tool-calling and RAG context integration.
    
    Args:
        session_id (str): Unique session identifier.
        message_text (str): The raw text message from the user.
        
    Returns:
        dict: A response containing 'reply', 'tool_used', and 'tool_name'.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {
            "reply": "Error: OpenAI API key is missing on the server.",
            "tool_used": False,
            "tool_name": None
        }

    # Initialize memory if not exists
    if session_id not in sessions_memory:
        sessions_memory[session_id] = []
    
    memory = sessions_memory[session_id]
    
    # 1. Retrieve context from RAG
    rag_context = retrieve(message_text, k=3)
    if rag_context:
        formatted_message = f"RAG Local Destination Context:\n{rag_context}\n\nUser Message: {message_text}"
    else:
        formatted_message = message_text
        
    # Append user message to memory
    memory.append({"role": "user", "content": formatted_message})
    
    client = OpenAI(api_key=api_key, http_client=httpx.Client())
    
    # Define tool configurations for OpenAI
    tools_config = [
        {
            "type": "function",
            "function": {
                "name": "web_search",
                "description": "Search the web for up-to-date travel information and news.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query to run on the web."
                        }
                    },
                    "required": ["query"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "currency_convert",
                "description": "Convert currency amounts based on real-time exchange rates.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "amount": {
                            "type": "number",
                            "description": "The amount to convert."
                        },
                        "from_currency": {
                            "type": "string",
                            "description": "Three-letter currency code to convert from (e.g., USD)."
                        },
                        "to_currency": {
                            "type": "string",
                            "description": "Three-letter currency code to convert to (e.g., EUR)."
                        }
                    },
                    "required": ["amount", "from_currency", "to_currency"]
                }
            }
        }
    ]
    
    tool_used = False
    tool_name = None
    
    # Tool-calling loop
    max_loops = 5
    loop_count = 0
    
    while loop_count < max_loops:
        loop_count += 1
        # Compile system message + conversation history (max 7 visible messages)
        history = trim_to_visible_limit(memory, limit=7)
        
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history
        
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=tools_config,
                tool_choice="auto"
            )
            
            choice = response.choices[0]
            response_msg = choice.message
            
            # If model wants to call tools
            if response_msg.tool_calls:
                tool_used = True
                
                # Format assistant tool call message to append to memory
                assistant_call = {
                    "role": "assistant",
                    "content": response_msg.content,
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": tc.type,
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments
                            }
                        } for tc in response_msg.tool_calls
                    ]
                }
                memory.append(assistant_call)
                
                # Process each tool call
                for tc in response_msg.tool_calls:
                    f_name = tc.function.name
                    f_args = json.loads(tc.function.arguments)
                    tool_name = f_name
                    
                    logger.info(f"Agent invoked tool '{f_name}' with args {f_args}")
                    
                    if f_name == "web_search":
                        result = web_search(query=f_args.get("query", ""))
                    elif f_name == "currency_convert":
                        result = currency_convert(
                            amount=float(f_args.get("amount", 0)),
                            from_currency=f_args.get("from_currency", ""),
                            to_currency=f_args.get("to_currency", "")
                        )
                    else:
                        result = {"error": f"Unknown tool '{f_name}'"}
                        
                    # Append tool result to memory
                    memory.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "name": f_name,
                        "content": json.dumps(result)
                    })
            else:
                # Normal final response
                reply = response_msg.content or ""
                memory.append({"role": "assistant", "content": reply})
                
                # Enforce global max 7 visible memory limit
                sessions_memory[session_id] = trim_to_visible_limit(memory, limit=7)
                
                return {
                    "reply": reply,
                    "tool_used": tool_used,
                    "tool_name": tool_name
                }
                
        except Exception as e:
            logger.error(f"Error in agent run: {str(e)}")
            return {
                "reply": f"An error occurred while processing your request: {str(e)}",
                "tool_used": tool_used,
                "tool_name": tool_name
            }
            
    return {
        "reply": "Agent execution loop limit reached.",
        "tool_used": tool_used,
        "tool_name": tool_name
    }
