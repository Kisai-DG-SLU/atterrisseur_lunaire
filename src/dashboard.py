"""
Dashboard Streamlit pour les métriques de performance
"""

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from stable_baselines3 import PPO
import gymnasium as gym

st.set_page_config(page_title="Eagle-1 Dashboard", page_icon="📊")

st.title("📊 Eagle-1 Performance Dashboard")

@st.cache_data
def run_evaluation(n_episodes=100):
    model = PPO.load("models/ppo_lunar_lander")
    env = gym.make("LunarLander-v3")
    
    rewards = []
    steps_per_episode = []
    
    for _ in range(n_episodes):
        obs, info = env.reset()
        total_reward = 0
        steps = 0
        terminated = truncated = False
        
        while not (terminated or truncated):
            action, _ = model.predict(obs, deterministic=True)
            obs, reward, terminated, truncated, info = env.step(action)
            total_reward += reward
            steps += 1
        
        rewards.append(total_reward)
        steps_per_episode.append(steps)
    
    env.close()
    return rewards, steps_per_episode

st.header("1. Statistiques Globales")

if st.button("🚀 Lancer l'évaluation (100 épisodes)"):
    with st.spinner("Évaluation en cours..."):
        rewards, steps = run_evaluation()
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Reward Moyen", f"{np.mean(rewards):.1f}")
    col2.metric("Médiane", f"{np.median(rewards):.1f}")
    col2.metric("Std", f"{np.std(rewards):.1f}")
    col4.metric("Steps Moyen", f"{np.mean(steps):.1f}")
    
    st.session_state.rewards = rewards
    st.session_state.steps = steps

st.header("2. Distribution des Rewards")

if "rewards" in st.session_state:
    rewards = st.session_state.rewards
    
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    
    axes[0].hist(rewards, bins=20, edgecolor='black', alpha=0.7)
    axes[0].axvline(np.mean(rewards), color='red', linestyle='--', linewidth=2)
    axes[0].axvline(200, color='green', linestyle='--', linewidth=2, label='Cible: 200')
    axes[0].set_xlabel('Reward')
    axes[0].set_ylabel('Fréquence')
    axes[0].set_title('Distribution')
    axes[0].legend()
    
    axes[1].boxplot(rewards, vert=True)
    axes[1].axhline(200, color='green', linestyle='--')
    axes[1].set_ylabel('Reward')
    axes[1].set_title('Boxplot')
    
    st.pyplot(fig)
    
    success_rate = sum(1 for r in rewards if r > 200) / len(rewards) * 100
    st.metric("Taux de succès (>200)", f"{success_rate:.1f}%")
else:
    st.info("Lancez l'évaluation pour voir les métriques")

st.header("3. Historique des Runs")

if "rewards" in st.session_state:
    df = pd.DataFrame({
        "Episode": range(1, len(rewards) + 1),
        "Reward": rewards,
        "Steps": st.session_state.steps
    })
    
    st.dataframe(df.head(20), use_container_width=True)
    
    fig, ax = plt.subplots()
    ax.plot(df["Episode"], df["Reward"], alpha=0.5)
    ax.axhline(200, color='green', linestyle='--', label='Cible')
    ax.axhline(np.mean(rewards), color='red', linestyle='--', label='Moyenne')
    ax.set_xlabel('Épisode')
    ax.set_ylabel('Reward')
    ax.set_title('Progression')
    ax.legend()
    st.pyplot(fig)
else:
    st.info("Lancez l'évaluation pour voir l'historique")

st.markdown("---")
st.caption("Eagle-1 LunarLander Dashboard | AstroDynamics © 2026")
