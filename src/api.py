"""
API FastAPI pour le LunarLander Eagle-1
Endpoint principal: POST /play
"""

from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from stable_baselines3 import PPO
import gymnasium as gym

app = FastAPI(title="Eagle-1 LunarLander API", version="1.0.0")

MODEL_PATH = "models/ppo_lunar_lander"
model = None


class StateInput(BaseModel):
    observation: list[float]


class ActionOutput(BaseModel):
    action: int
    action_name: str


def load_model():
    global model
    if model is None:
        model = PPO.load(MODEL_PATH)
    return model


@app.on_event("startup")
async def startup_event():
    load_model()


@app.get("/")
async def root():
    return {"message": "Eagle-1 LunarLander API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/play", response_model=ActionOutput)
async def play(state_input: StateInput):
    model = load_model()
    observation = np.array(state_input.observation)
    action, _ = model.predict(observation, deterministic=True)
    
    action_names = {
        0: "Ne rien faire",
        1: "Moteur principal",
        2: "Moteur gauche",
        3: "Moteur droit"
    }
    
    return ActionOutput(
        action=int(action),
        action_name=action_names.get(int(action), "Inconnu")
    )


@app.post("/reset")
async def reset():
    env = gym.make("LunarLander-v3")
    observation, info = env.reset()
    env.close()
    return {"observation": observation.tolist()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
