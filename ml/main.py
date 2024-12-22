from fastapi import FastAPI, HTTPException, Response, Depends
from contextlib import asynccontextmanager
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from langgraph.graph.state import CompiledGraph
import tools
from pydantic import BaseModel
from uuid import UUID, uuid4
from fastapi.middleware.cors import CORSMiddleware
from fastapi_sessions.backends.implementations import InMemoryBackend
from fastapi_sessions.session_verifier import SessionVerifier
from fastapi_sessions.frontends.implementations import SessionCookie, CookieParameters

def modify_messages(messages):
    return prompt.invoke({"messages": messages})

class Simple(BaseModel):
    message: str

sessions = dict()

llm: ChatGoogleGenerativeAI = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    temperature=0.2,
    max_tokens=None,
    timeout=None,
    max_retries=2
    )

class SessionData(BaseModel):
    username: str
    tool_used: bool = ""
    page: str = ""
    action: str = ""



cookie_params = CookieParameters()

# Uses UUID
cookie = SessionCookie(
    cookie_name="cookie",
    identifier="general_verifier",
    auto_error=True,
    secret_key="DONOTUSE",
    cookie_params=cookie_params,
)
backend = InMemoryBackend[UUID, SessionData]()

class BasicVerifier(SessionVerifier[UUID, SessionData]):
    def __init__(
        self,
        *,
        identifier: str,
        auto_error: bool,
        backend: InMemoryBackend[UUID, SessionData],
        auth_http_exception: HTTPException,
    ):
        self._identifier = identifier
        self._auto_error = auto_error
        self._backend = backend
        self._auth_http_exception = auth_http_exception

    @property
    def identifier(self):
        return self._identifier

    @property
    def backend(self):
        return self._backend

    @property
    def auto_error(self):
        return self._auto_error

    @property
    def auth_http_exception(self):
        return self._auth_http_exception

    def verify_session(self, model: SessionData) -> bool:
        """If the session exists, it is valid"""
        return True


verifier = BasicVerifier(
    identifier="general_verifier",
    auto_error=True,
    backend=backend,
    auth_http_exception=HTTPException(status_code=403, detail="invalid session"),
)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a helpful assistant for a website with vast knowledge of indian finance and finance in general
            , you have many tools at your 
            disposal which can help you navigate a website and you should use it when you 
            feel a user wants to navigate to a specific page. Always respond in brief concise paragraphs. Do not say you cannot provide financial advice. 
            Do not tell anyone to consult somebody else. Respond in the language the user types. You can provide financial advise. Remember that you have tools to help you do things like creating an account for the user."""
        ),
        (
            "human",
            "{messages}"
        ),
    ]
    
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    session = uuid4()
    data = SessionData(username="warren")
    sessions[data.username] = {"memory": MemorySaver(), "agent": None}
    sessions[data.username]["agent"] = create_react_agent(llm, tools=tools.tools, checkpointer=sessions[data.username]["memory"], messages_modifier=modify_messages)
    await backend.create(session, data)
    print("App startup: LLM INITIALISED")
    yield
    print("App shutdown")

app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow specific origins
    allow_credentials=True,  # Allow cookies and authentication
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
async def root():
    return { "message": "Hello World" }

@app.post("/api/talk")
async def test_llm(message: Simple):
    print(message)
    agent = sessions["warren"]["agent"]
    dummy = SessionData(username="warren")

    config= {
            "run_name": "warren",
            "configurable": {
                "data": dummy,
                "thread_id": "warren"
            }
        }
    print("Message received " + message.message)
    response = agent.invoke(
        {
            "messages": [("user", message.message)]
        },
        config=config
    )
    command = ""
    # print(response["messages"])
    if dummy.tool_used:
        if dummy.action == "":
            command = "Nav " + dummy.page
        else:
            if "Dialog" in dummy.action:
                command = "Dig " + dummy.action
            else:
                command = "Act " + dummy.action
    dummy.tool_used = False
    dummy.page = ""
    dummy.action = ""
    return { "response": response["messages"][-1].content, "command": command}


@app.post("/create_session/{name}")
async def create_session(name: str, response: Response):
    session = uuid4()
    data = SessionData(username=name)
    sessions[data.username] = {"memory": MemorySaver(), "agent": None}
    sessions[data.username]["agent"] = create_react_agent(llm, tools=tools.tools, checkpointer=sessions[data.username]["memory"], messages_modifier=modify_messages)
    await backend.create(session, data)
    cookie.attach_to_response(response, session)

    return f"created session for {name}"


@app.get("/whoami", dependencies=[Depends(cookie)])
async def whoami(session_data: SessionData = Depends(verifier)):
    return session_data


@app.post("/delete_session")
async def del_session(response: Response, session_id: UUID = Depends(cookie)):
    await backend.delete(session_id)
    cookie.delete_from_response(response)
    return "deleted session"