# Atterrisseur Lunaire - Eagle-1

![RL Project](https://img.shields.io/badge/RL-Reinforcement%20Learning-blue)
![Environment](https://img.shields.io/badge/Gymnasium-LunarLander-v3-green)
![Algorithm](https://img.shields.io/badge/Algorithm-PPO%20%7C%20DQN-orange)

<!-- Trigger CI/CD workflow and auto-PR -->

## 📋 Description du projet

Projet d'apprentissage par renforcement (RL) pour piloter automatiquement le module d'atterrissage lunaire "Eagle-1" dans l'environnement LunarLander-v3. L'objectif est d'entraîner un agent capable d'atterrir en douceur sur la plateforme avec une récompense moyenne supérieure à 200.

## 🛡️ Badges et Métriques

### Qualité du code
- **Environment**: LunarLander-v3 (Gymnasium)
- **Algorithmes**: PPO (Policy Gradient) et DQN (Deep Q-Network)
- **Framework**: Stable-Baselines3 + PyTorch

### Performance de l'agent
- **Score cible**: > 200 points (atterrissage réussi)
- **Score atteint**: ~215 points en moyenne
- **Taux de succès**: > 80% des épisodes

## 🎯 Objectifs

1. **Maîtriser les fondamentaux du RL** : environnement, actions, observations, rewards
2. **Implémenter des algorithmes RL** : Q-Learning, DQN, PPO
3. **Développer un pipeline complet** : entraînement, évaluation, déploiement
4. **Produire les livrables** : notebooks, vidéos, API, GUI, dashboard

## 🚀 Fonctionnalités principales

- **Agents RL entraînés** : Random, Q-Learning, DQN, PPO
- **Environnements variés** : CartPole, FrozenLake, LunarLander
- **Enregistrement vidéo** : Capture des épisodes pour visualisation
- **API REST** : FastAPI pour inference en temps réel
- **Interface GUI** : Streamlit pour piloter l'agent visuellement
- **Dashboard** : Métriques de performance et statistiques

## 🏗️ Architecture

### Stack technique
- **Langage**: Python 3.10+ avec Pixi
- **ML Frameworks**: Stable-Baselines3, PyTorch, Gymnasium
- **API**: FastAPI + Uvicorn
- **Interface**: Streamlit
- **Visualisation**: Matplotlib, imageio

### Structure du projet
```
atterrisseur_lunaire/
├── src/                    # Code source
│   ├── api.py            # API FastAPI (/play endpoint)
│   ├── gui.py            # Interface Streamlit
│   └── dashboard.py      # Dashboard Streamlit
├── notebooks/             # Notebooks Jupyter
│   ├── exercice_01.ipynb    # Agent aléatoire (CartPole)
│   ├── exercice_02.ipynb    # Q-Learning (FrozenLake)
│   ├── exercice_03.ipynb    # DQN (CartPole)
│   ├── mission.ipynb        # PPO (LunarLander)
│   ├── videos/              # Vidéos enregistrées
│   ├── dqn_cartpole.zip    # Modèle DQN entraîné
│   └── ppo_lunar_lander.zip # Modèle PPO entraîné
├── models/                # Modèles sauvegardés
├── specs/                 # Spécifications du projet
└── pixi.toml            # Configuration Pixi
```

## ⚙️ Installation

### Prérequis
- Python 3.10+
- Pixi (gestionnaire d'environnements)
- Git pour le versioning

### Installation avec Pixi
```bash
# Cloner le repository
git clone <repository-url>
cd atterrisseur_lunaire

# Installer les dépendances avec Pixi
pixi install

# Activer l'environnement
pixi shell
```

## 🚀 Utilisation

### Lancer les notebooks
```bash
# Avec Jupyter Lab
pixi run lab

# Avec Jupyter Notebook
pixi run notebook
```

### Utiliser l'API FastAPI
```bash
# Lancer l'API
pixi run uvicorn src.api:app --host 0.0.0.0 --port 8000

# Tester l'endpoint /play
curl -X POST http://localhost:8000/play \
  -H "Content-Type: application/json" \
  -d '{"observation": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]}'
```

### Utiliser le GUI Streamlit
```bash
# Lancer l'interface
pixi run streamlit run src/gui.py

# Accéder à http://localhost:8501
```

### Utiliser le Dashboard
```bash
# Lancer le dashboard
pixi run streamlit run src/dashboard.py

# Accéder à http://localhost:8501
```

## 📊 Livrables

| # | Livrable | Format | Status |
|---|----------|--------|--------|
| 1 | Notebook complet de la mission | `.ipynb` | ✅ |
| 2 | Vidéo d'atterrissage réussi | `.mp4` | ✅ |
| 3 | Code source de l'API | `.py` | ✅ |
| 4 | Code source de l'interface graphique | `.py` | ✅ |
| 5 | Code source du tableau de bord | `.py` | ✅ |

## 🔬 Concepts RL couverts

### Apprentissage par Renforcement
- **Agent**: Entité qui prend des décisions
- **Environnement**: Le monde dans lequel l'agent agit
- **Action (A)**: Ce que l'agent peut faire
- **Observation (S)**: Information reçue par l'agent
- **Reward (R)**: Signal de feedback de l'environnement

### Algorithmes implémentés
| Algorithme | Environnement | Description |
|------------|---------------|-------------|
| Random | CartPole | Agent choisit aléatoirement (~20 pts) |
| Q-Learning | FrozenLake | Table de lookup des Q-valeurs |
| DQN | CartPole | Réseau de neurones pour Q-values |
| PPO | LunarLander | Policy gradient avec clipping |

### Hyperparamètres clés
- **Learning Rate**: 3e-4 (vitesse d'apprentissage)
- **Gamma**: 0.99 (facteur de discount)
- **Epsilon**: Décroissant de 1.0 à 0.01 (exploration → exploitation)
- **Buffer Size**: 50000 (Replay Buffer pour DQN)

## 📈 Métriques de performance

### Progression de l'agent PPO
```
Steps     | Reward moyen | Description
----------|--------------|----------------------------------
0-50k     | ~-150        | L'agent crash systématiquement
50k-100k  | ~-100        | Début de stabilisation
100k-150k | ~-50         | Amélioration notable
150k-200k | ~+50         | L'agent commence à réussir
200k+     | ~+200        | Convergence, atterrissagestable
```

### Comparaison des agents
| Agent | Score moyen | Temps d'entraînement |
|-------|-------------|---------------------|
| Random | ~20 | 0 sec |
| Q-Learning | ~70% succès | 30 sec |
| DQN | ~170 | 5 min |
| PPO | ~215 | 20 min |

## 🤝 Déploiement

### Sur OpenShift/OKD (Pod Jupyter)
```bash
# Se connecter au cluster
oc login <cluster-url>

# Port-forward pour accéder aux services
oc port-forward <nom-du-pod> 8501:8501  # GUI
oc port-forward <nom-du-pod> 8000:8000  # API
```

### Endpoints disponibles
- **API**: `http://localhost:8000`
  - `GET /` - Welcome
  - `GET /health` - Health check
  - `POST /play` - Prédit une action
  - `POST /reset` - Reset l'environnement
- **GUI**: `http://localhost:8501` - Interface visuelle
- **Dashboard**: `http://localhost:8502` - Statistiques

## 🔗 Références

- [Documentation Gymnasium](https://gymnasium.farama.org/)
- [Documentation Stable-Baselines3](https://stable-baselines3.readthedocs.io/)
- [Spécifications du projet](specs/)
- [Cours RL - Projets d'entraînement](https://gymnasium.farama.org/tutorials/gymnasium101/)

## 📄 Licence

MIT License - Projet académique pour l'apprentissage du Reinforcement Learning.

## 📞 Contact

- **Auteur**: Damien Guesdon
- **Repository**: https://forgejo-external.sophia-sandbox.svc.cluster.local/cyclopdev/atterrisseur_lunaire
