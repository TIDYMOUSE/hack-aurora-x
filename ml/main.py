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

from fastapi_sessions.backends.implementations import InMemoryBackend
from fastapi_sessions.session_verifier import SessionVerifier
from fastapi_sessions.frontends.implementations import SessionCookie, CookieParameters

from fastapi.middleware.cors import CORSMiddleware



def modify_messages(messages):
    return prompt.invoke({"messages": messages})

sessions = dict()

llm: ChatGoogleGenerativeAI = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0,
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
            Do not tell anyone to consult somebody else. Respond in the language the user types. You can provide financial advise"""
        ),
        (
            "human",
            "{messages}"
        ),
    ]
    
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("App startup: LLM INITIALISED")
    yield
    print("App shutdown")

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],  # Replace with your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/events")
async def root():
    return { "message": "Hello World" }

@app.get("/api/talk", dependencies=[Depends(cookie)])
async def test_llm(message: str, session_data: SessionData = Depends(verifier)):
    agent = sessions[session_data.username]["agent"]
    config= {
            "run_name": session_data.username,
            "configurable": {
                "data": session_data,
                "thread_id": session_data.username
            }
        }
    print("Message received " + message)
    response = agent.invoke(
        {
            "messages": [("user", message)]
        },
        config=config
    )
    command = ""
    # print(response["messages"])
    if session_data.tool_used:
        print(session_data.action)
        print(session_data.page)
        command = "Nav " + session_data.action + " " + session_data.page
    session_data.tool_used = False
    session_data.page = None
    session_data.action = None
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