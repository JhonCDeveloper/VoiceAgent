# PROJECT TITLE AND OVERVIEW

**Nomad AI**

Nomad AI is an intelligent, multimodal travel assistant designed to provide international travelers with real-time logistical support, localized destination insights, and interactive voice responses. The primary use case is to act as a hands-free, autonomous travel guide. A user can interact with the agent via standard text chat or voice commands to ask about current weather, search for live travel news, convert currency based on real-time forex rates, or inquire about local customs and itineraries. From start to finish, the user inputs their query, the agent autonomously routes the request to the appropriate external APIs or local vector database, synthesizes a context-aware response, and outputs both a clean markdown response and a synthesized audio stream for hands-free consumption.

# DEPLOYMENT

- **Live Application URL:** [Insert Vercel/Railway Link Here]
- **GitHub Repository:** [Insert Repository Link Here]

# TECH STACK

**Frontend:**
- React 18
- Vite
- TypeScript
- Tailwind CSS v3

**Backend:**
- Python 3.11
- FastAPI
- Uvicorn

**AI Framework and Integrations:**
- OpenAI API (GPT-4o)
- LangChain
- FAISS (Vector Database)
- BeautifulSoup4 (Web Scraping)
- Tavily Search API
- ExchangeRate-API v6

**TTS Service:**
- OpenAI TTS (tts-1)

# SYSTEM PROMPT DESIGN

The agent is governed by a strict system prompt that enforces its behavior and limitations. The prompt contains the following core instructions:

- **Role and Scope:** The agent is strictly a travel assistant and local guide. It must refuse any tasks or questions unrelated to travel, logistics, or destination information.
- **Tone:** The agent must communicate in a professional, polite, concise, and direct manner, avoiding unnecessary conversational filler.
- **Web Search Tool Activation:** The agent is instructed to autonomously use the web search tool whenever the user asks about real-time events, current weather, or details not present in the internal knowledge base.
- **Currency Converter Tool Activation:** The agent is instructed to use the currency converter tool exclusively when the user requests money conversion, rather than attempting to guess outdated forex rates.
- **Language Match:** The agent must always detect the language of the user's prompt and respond in that exact same language to maintain a seamless user experience.
- **Response Format:** The agent must provide clean, markdown-formatted answers that are easily readable and optimized for text-to-speech synthesis.

# CORE FEATURES AND TOOLS DOCUMENTATION

**Contextual Memory Retention**
The system is engineered to maintain a rolling conversational context, ensuring coherent multi-turn interactions. The backend strictly preserves a context window of the last 7 consecutive visible messages (user inputs and assistant text responses). Internal tool execution metadata is filtered out of the counting mechanism, preventing context loss and ensuring the agent remembers the user's exact preferences, budgets, and constraints throughout a standard conversational flow.

**Tool 1: Web Search**
- **Description:** Scours the internet for up-to-date travel news, local events, and real-time weather data.
- **Parameters Required:**
  - query (Type: string) - The exact search query to be executed on the web.

**Tool 2: Currency Converter**
- **Description:** Performs real-time currency conversions using live forex market rates.
- **Parameters Required:**
  - amount (Type: float) - The numerical amount of money to convert.
  - from_currency (Type: string) - The three-letter ISO currency code to convert from (e.g., USD).
  - to_currency (Type: string) - The three-letter ISO currency code to convert to (e.g., EUR).

# INSTALLATION AND SETUP GUIDE

Follow these steps to deploy the project in a local environment.

1. Clone the repository and navigate into the root directory:
```bash
git clone <repository-url>
cd <repository-directory>
```

2. Set up the environment variables:
Rename the `.env.example` file to `.env` in the root directory. Open the file and populate it with your actual API keys. The project is securely configured via `.gitignore` to ensure real API keys are never exposed in version control.

3. Install backend dependencies:
Open a terminal, navigate to the backend folder, create a virtual environment, and install the requirements:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

4. Install frontend dependencies:
Open a second terminal window, navigate to the frontend folder, and install the Node modules:
```bash
cd frontend
npm install
```

5. Run the application (Parallel Execution):
If you prefer to start both the frontend and backend simultaneously using a single command from the root directory, use:
```bash
cd backend && source .venv/bin/activate && uvicorn main:app --reload & cd frontend && npm run dev
```
*(Alternatively, you can run `uvicorn main:app --reload` in the backend terminal and `npm run dev` in the frontend terminal).*

# VERIFICATION AND TESTING

To ensure the system is operating correctly, perform the following verifications in the user interface:

- **Mode Switching:** Locate the toggle button in the application header. Switch between Text and Voice modes and verify that the agent's response behavior adapts accordingly.
- **Tool Visualization:** Ask a prompt that requires real-time data (e.g., converting a currency). Verify that an immersive loading card appears during execution, and that a permanent tool indicator badge remains visible in the chat history after the response is generated.
- **TTS Playback:** In voice mode, send a message to the agent. Verify that the synthesized audio plays automatically upon receiving the response, and that the audio player component is visible and interactive.

# BONUS: RAG IMPLEMENTATION

The application features a built-in Retrieval-Augmented Generation (RAG) pipeline to bootstrap the agent with specialized local knowledge. On backend startup, the system automatically fetches HTML content from a configurable URL defined in the environment variables. 

- **Target Scraping URL:** [https://wikitravel.org/en/Japan](https://wikitravel.org/en/Japan)

It uses BeautifulSoup to scrape the text, applies a RecursiveCharacterTextSplitter for intelligent chunking, and generates vector embeddings using the `text-embedding-3-small` model. These embeddings are indexed into an in-memory FAISS vector database. When a user asks a destination-specific question, the agent queries this database to retrieve the most relevant local context before generating its final answer.
