from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from threading import Thread
import time

# Import the LangGraph workflow and state
from ollama_deep_researcher.graph import graph
from ollama_deep_researcher.state import SummaryStateInput
from langchain_core.runnables import RunnableConfig

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

@app.post("/api/generate")
def generate_roadmap(req: QueryRequest):
    try:
        # Define input state
        initial_state = SummaryStateInput(research_topic=req.query)
        
        # Configure settings for execution
        config = RunnableConfig(
            configurable={
                "search_api": "duckduckgo",
                "max_web_research_loops": 1,
                "generate_roadmap": True,
                "generate_mermaid_diagram": True,
                "llm_provider": "ollama",
                "local_llm": "llama3.2:1b"
            }
        )
        
        # Run graph
        result = graph.invoke(initial_state, config)
        
        return {
            "success": True,
            "summary": result.get("running_summary", ""),
            "roadmap": result.get("roadmap", ""),
            "mermaid_diagram": result.get("mermaid_diagram", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount frontend files
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
