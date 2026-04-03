#!/usr/bin/env python3
"""
Script pour ajouter des cellules d'enregistrement vidéo aux notebooks.
Exécute ce script depuis le dossier notebooks/ après un git pull.
"""
import json
import os
import sys

def add_video_cell(notebook_path, env_name, n_episodes, agent_type="random", model_path=None, video_prefix=None):
    """Ajoute une cellule d'enregistrement vidéo à un notebook."""
    
    if video_prefix is None:
        video_prefix = f"video_{env_name.lower().replace('-', '_').replace(' ', '_')}"
    
    with open(notebook_path, 'r') as f:
        nb = json.load(f)
    
    # Construire le code selon le type d'agent
    if agent_type == "random":
        code = f'''from gymnasium.wrappers import RecordVideo
from IPython.display import Video

env = gym.make("{env_name}", render_mode='rgb_array')
video_folder = "./videos"
os.makedirs(video_folder, exist_ok=True)

env = RecordVideo(
    env,
    video_folder=video_folder,
    name_prefix="{video_prefix}",
    episode_trigger=lambda e: e < {n_episodes}
)

print("🎬 Enregistrement de {n_episodes} épisode(s)...")

for episode in range({n_episodes}):
    state, info = env.reset()
    total_reward = 0
    terminated = truncated = False
    
    while not (terminated or truncated):
        action = env.action_space.sample()
        state, reward, terminated, truncated, info = env.step(action)
        total_reward += reward
    
    print(f"Épisode {{episode+1}}: {{total_reward:.1f}} points")

env.close()

video_path = f"{{video_folder}}/{video_prefix}-ep0.mp4"
print(f"\\n✅ Vidéo enregistrée: {{video_path}}")
Video(video_path, embed=True, width=640)'''
    elif agent_type == "qtable":
        code = f'''from gymnasium.wrappers import RecordVideo
from IPython.display import Video
import numpy as np

env = gym.make("{env_name}", render_mode='rgb_array')
video_folder = "./videos"
os.makedirs(video_folder, exist_ok=True)

env = RecordVideo(
    env,
    video_folder=video_folder,
    name_prefix="{video_prefix}",
    episode_trigger=lambda e: e < {n_episodes}
)

print("🎬 Enregistrement de {n_episodes} épisode(s) avec l'agent Q-Learning...")

for episode in range({n_episodes}):
    state, info = env.reset()
    total_reward = 0
    terminated = truncated = False
    
    while not (terminated or truncated):
        action = np.argmax(q_table[state])  # Politique apprise
        state, reward, terminated, truncated, info = env.step(action)
        total_reward += reward
    
    print(f"Épisode {{episode+1}}: {{'Succès!' if total_reward > 0 else 'Échec'}} (reward={{total_reward}})")

env.close()

video_path = f"{{video_folder}}/{video_prefix}-ep0.mp4"
print(f"\\n✅ Vidéo enregistrée: {{video_path}}")
Video(video_path, embed=True, width=640)'''
    else:  # model
        code = f'''from gymnasium.wrappers import RecordVideo
from stable_baselines3 import {model_path.split('_')[0].upper()}
from IPython.display import Video

model = {model_path.split('_')[0].upper()}.load("{model_path}")

env = gym.make("{env_name}", render_mode='rgb_array')
video_folder = "./videos"
os.makedirs(video_folder, exist_ok=True)

env = RecordVideo(
    env,
    video_folder=video_folder,
    name_prefix="{video_prefix}",
    episode_trigger=lambda e: e < {n_episodes}
)

print("🎬 Enregistrement de {n_episodes} épisode(s) avec l'agent entraîné...")

for episode in range({n_episodes}):
    state, info = env.reset()
    total_reward = 0
    terminated = truncated = False
    
    while not (terminated or truncated):
        action, _ = model.predict(state, deterministic=True)
        state, reward, terminated, truncated, info = env.step(action)
        total_reward += reward
    
    print(f"Épisode {{episode+1}}: {{total_reward:.1f}} points")

env.close()

video_path = f"{{video_folder}}/{video_prefix}-ep0.mp4"
print(f"\\n✅ Vidéo enregistrée: {{video_path}}")
Video(video_path, embed=True, width=640)'''
    
    # Trouver le bon endroit pour insérer (avant "Conclusion" ou fin du notebook)
    insert_idx = len(nb['cells'])
    for i, cell in enumerate(nb['cells']):
        if cell['cell_type'] == 'markdown':
            source = ''.join(cell.get('source', []))
            if 'Conclusion' in source and 'Livrables' in source:
                insert_idx = i
                break
    
    markdown_cell = {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "---\n",
            "\n",
            "## 🎬 Enregistrement vidéo\n",
            "\n",
            f"Regardons l'agent {'aléatoire' if agent_type == 'random' else 'Q-Learning' if agent_type == 'qtable' else 'entraîné'} jouer en temps réel.\n"
        ]
    }
    
    code_cell = {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [code]
    }
    
    # Insérer les cellules
    nb['cells'].insert(insert_idx, markdown_cell)
    nb['cells'].insert(insert_idx + 1, code_cell)
    
    with open(notebook_path, 'w') as f:
        json.dump(nb, f, indent=1)
    
    print(f"✅ Vidéo ajoutée à {notebook_path}")

def main():
    os.makedirs("./videos", exist_ok=True)
    
    print("=" * 50)
    print("Ajout des cellules vidéo aux notebooks...")
    print("=" * 50)
    
    # Exercice 1: CartPole random (3 épisodes)
    add_video_cell(
        "exercice_01.ipynb",
        env_name="CartPole-v1",
        n_episodes=3,
        agent_type="random",
        video_prefix="exercice_01_cartpole_random"
    )
    
    # Exercice 2: FrozenLake Q-Learning (3 épisodes)
    add_video_cell(
        "exercice_02.ipynb",
        env_name="FrozenLake-v1",
        n_episodes=3,
        agent_type="qtable",
        video_prefix="exercice_02_frozenlake_qlearning"
    )
    
    # Exercice 3: CartPole DQN (1 épisode)
    add_video_cell(
        "exercice_03.ipynb",
        env_name="CartPole-v1",
        n_episodes=1,
        agent_type="model",
        model_path="dqn_cartpole",
        video_prefix="exercice_03_cartpole_dqn"
    )
    
    # Mission: LunarLander PPO (1 épisode)
    add_video_cell(
        "mission.ipynb",
        env_name="LunarLander-v3",
        n_episodes=1,
        agent_type="model",
        model_path="ppo_lunar_lander",
        video_prefix="mission_lunarlander_ppo"
    )
    
    print("\n" + "=" * 50)
    print("Terminé ! Commit et push, puis git pull sur le pod.")
    print("=" * 50)

if __name__ == "__main__":
    main()
