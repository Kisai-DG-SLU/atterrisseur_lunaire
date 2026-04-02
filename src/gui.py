"""
Interface Streamlit pour jouer avec l'agent Eagle-1
"""

import streamlit as st
import numpy as np
from stable_baselines3 import PPO
import gymnasium as gym
import time

st.set_page_config(page_title="Eagle-1 Controller", page_icon="🚀")

MODEL_PATH = "models/ppo_lunar_lander"

@st.cache_resource
def load_model():
    return PPO.load(MODEL_PATH)

st.title("🚀 Eagle-1 LunarLander Controller")
st.markdown("Contrôlez l'atterrisseur lunaire avec l'agent IA!")

model = load_model()

col1, col2 = st.columns(2)

with col1:
    st.header("Contrôles")
    speed = st.slider("Vitesse de simulation", 0.01, 0.5, 0.05)
    deterministic = st.checkbox("Mode déterministe", value=True)
    
    if st.button("▶️ Démarrer", type="primary"):
        st.session_state.running = True
    if st.button("⏹️ Arrêter"):
        st.session_state.running = False
    if st.button("🔄 Reset"):
        st.session_state.running = False
        st.session_state.episode += 1

with col2:
    st.header("Métriques")
    total_reward_placeholder = st.empty()
    steps_placeholder = st.empty()

if "running" not in st.session_state:
    st.session_state.running = False
if "episode" not in st.session_state:
    st.session_state.episode = 0

frame_placeholder = st.empty()

if st.session_state.running:
    env = gym.make("LunarLander-v3", render_mode="rgb_array")
    observation, info = env.reset()
    
    total_reward = 0
    steps = 0
    
    while st.session_state.running:
        action, _ = model.predict(observation, deterministic=deterministic)
        observation, reward, terminated, truncated, info = env.step(action)
        total_reward += reward
        steps += 1
        
        frame = env.render()
        frame_placeholder.image(frame, channels="RGB")
        
        total_reward_placeholder.metric("Reward Total", f"{total_reward:.1f}")
        steps_placeholder.metric("Steps", steps)
        
        if terminated or truncated:
            st.session_state.running = False
            st.success(f"Épisode terminé ! Reward: {total_reward:.1f}")
            break
        
        time.sleep(speed)
    
    env.close()
else:
    frame_placeholder.info("Cliquez sur 'Démarrer' pour voir l'agent piloter Eagle-1")
