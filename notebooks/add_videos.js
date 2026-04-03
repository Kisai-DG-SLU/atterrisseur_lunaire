/**
 * Script pour ajouter des cellules d'enregistrement vidéo aux notebooks.
 * Exécute: node add_videos.js
 */
const fs = require('fs');
const path = require('path');

function addVideoCell(notebookPath, config) {
    const { envName, nEpisodes, agentType, modelPath, videoPrefix, description } = config;
    
    console.log(`\n📝 Traitement de ${notebookPath}...`);
    
    const nb = JSON.parse(fs.readFileSync(notebookPath, 'utf8'));
    
    // Construire le code selon le type d'agent
    let code;
    if (agentType === 'random') {
        code = [
            'from gymnasium.wrappers import RecordVideo',
            'import os',
            'from IPython.display import Video',
            '',
            `env = gym.make("${envName}", render_mode='rgb_array')`,
            'video_folder = "./videos"',
            'os.makedirs(video_folder, exist_ok=True)',
            '',
            `env = RecordVideo(`,
            '    env,',
            '    video_folder=video_folder,',
            `    name_prefix="${videoPrefix}",`,
            `    episode_trigger=lambda e: e < ${nEpisodes}`,
            ')',
            '',
            `print("🎬 Enregistrement de ${nEpisodes} épisode(s)...")`,
            '',
            'for episode in range(' + nEpisodes + '):',
            '    state, info = env.reset()',
            '    total_reward = 0',
            '    terminated = truncated = False',
            '    ',
            '    while not (terminated or truncated):',
            '        action = env.action_space.sample()',
            '        state, reward, terminated, truncated, info = env.step(action)',
            '        total_reward += reward',
            '    ',
            `    print(f"Épisode {episode+1}: {total_reward:.1f} points")`,
            '',
            'env.close()',
            '',
            'video_path = f"{video_folder}/${videoPrefix}-ep0.mp4"',
            'print(f"\\n✅ Vidéo enregistrée: {video_path}")',
            'Video(video_path, embed=True, width=640)'
        ];
    } else if (agentType === 'qtable') {
        code = [
            'from gymnasium.wrappers import RecordVideo',
            'import os',
            'import numpy as np',
            'from IPython.display import Video',
            '',
            `env = gym.make("${envName}", render_mode='rgb_array')`,
            'video_folder = "./videos"',
            'os.makedirs(video_folder, exist_ok=True)',
            '',
            `env = RecordVideo(`,
            '    env,',
            '    video_folder=video_folder,',
            `    name_prefix="${videoPrefix}",`,
            `    episode_trigger=lambda e: e < ${nEpisodes}`,
            ')',
            '',
            `print("🎬 Enregistrement de ${nEpisodes} épisode(s) avec l'agent Q-Learning...")`,
            '',
            'for episode in range(' + nEpisodes + '):',
            '    state, info = env.reset()',
            '    total_reward = 0',
            '    terminated = truncated = False',
            '    ',
            '    while not (terminated or truncated):',
            '        action = np.argmax(q_table[state])',
            '        state, reward, terminated, truncated, info = env.step(action)',
            '        total_reward += reward',
            '    ',
            `    print(f"Épisode {episode+1}: {'Succès!' if envName.includes('FrozenLake') else total_reward > 0}: {{'Succès!' if total_reward > 0 else 'Échec'}} (reward={{total_reward}})")`,
            '',
            'env.close()',
            '',
            'video_path = f"{video_folder}/${videoPrefix}-ep0.mp4"',
            'print(f"\\n✅ Vidéo enregistrée: {video_path}")',
            'Video(video_path, embed=True, width=640)'
        ];
    } else {
        // model
        const modelType = modelPath.split('_')[0].toUpperCase();
        code = [
            'from gymnasium.wrappers import RecordVideo',
            'from stable_baselines3 import ' + modelType,
            'from IPython.display import Video',
            '',
            `model = ${modelType}.load("${modelPath}")`,
            '',
            `env = gym.make("${envName}", render_mode='rgb_array')`,
            'video_folder = "./videos"',
            'os.makedirs(video_folder, exist_ok=True)',
            '',
            `env = RecordVideo(`,
            '    env,',
            '    video_folder=video_folder,',
            `    name_prefix="${videoPrefix}",`,
            `    episode_trigger=lambda e: e < ${nEpisodes}`,
            ')',
            '',
            `print("🎬 Enregistrement de ${nEpisodes} épisode(s) avec l'agent entraîné...")`,
            '',
            'for episode in range(' + nEpisodes + '):',
            '    state, info = env.reset()',
            '    total_reward = 0',
            '    terminated = truncated = False',
            '    ',
            '    while not (terminated or truncated):',
            '        action, _ = model.predict(state, deterministic=True)',
            '        state, reward, terminated, truncated, info = env.step(action)',
            '        total_reward += reward',
            '    ',
            `    print(f"Épisode {episode+1}: {total_reward:.1f} points")`,
            '',
            'env.close()',
            '',
            'video_path = f"{video_folder}/${videoPrefix}-ep0.mp4"',
            'print(f"\\n✅ Vidéo enregistrée: {video_path}")',
            'Video(video_path, embed=True, width=640)'
        ];
    }
    
    // Trouver le bon endroit pour insérer (avant "Conclusion" ou après "Livrables")
    let insertIdx = nb.cells.length;
    for (let i = 0; i < nb.cells.length; i++) {
        if (nb.cells[i].cell_type === 'markdown') {
            const source = nb.cells[i].source.join('');
            if (source.includes('Livrables') && source.includes('Conclusion')) {
                insertIdx = i;
                break;
            }
        }
    }
    
    const markdownCell = {
        cell_type: 'markdown',
        metadata: {},
        source: [
            '---\n',
            '\n',
            '## 🎬 Enregistrement vidéo\n',
            '\n',
            description + '\n'
        ]
    };
    
    const codeCell = {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: code
    };
    
    // Insérer les cellules
    nb.cells.splice(insertIdx, 0, markdownCell, codeCell);
    
    fs.writeFileSync(notebookPath, JSON.stringify(nb, null, 1));
    console.log(`✅ Cellules vidéo ajoutées à ${notebookPath}`);
}

// Assurer que le dossier videos existe
fs.mkdirSync('./videos', { recursive: true });

console.log('='.repeat(50));
console.log('🎬 Ajout des cellules vidéo aux notebooks...');
console.log('='.repeat(50));

// Exercice 1: CartPole random (3 épisodes)
addVideoCell('exercice_01.ipynb', {
    envName: 'CartPole-v1',
    nEpisodes: 3,
    agentType: 'random',
    videoPrefix: 'exercice_01_cartpole_random',
    description: "L'agent **aléatoire** choisit ses actions au hasard. Observez comme il tombe rapidement !"
});

// Exercice 2: FrozenLake Q-Learning (3 épisodes)
addVideoCell('exercice_02.ipynb', {
    envName: 'FrozenLake-v1',
    nEpisodes: 3,
    agentType: 'qtable',
    videoPrefix: 'exercice_02_frozenlake_qlearning',
    description: "L'agent **Q-Learning** utilise la politique apprise. Observez comment il évite les trous !"
});

// Exercice 3: CartPole DQN (1 épisode)
addVideoCell('exercice_03.ipynb', {
    envName: 'CartPole-v1',
    nEpisodes: 1,
    agentType: 'model',
    modelPath: 'dqn_cartpole',
    videoPrefix: 'exercice_03_cartpole_dqn',
    description: "L'agent **DQN** entraîné maintient le pendule debout bien plus longtemps !"
});

// Mission: LunarLander PPO (1 épisode)
addVideoCell('mission.ipynb', {
    envName: 'LunarLander-v3',
    nEpisodes: 1,
    agentType: 'model',
    modelPath: 'ppo_lunar_lander',
    videoPrefix: 'mission_lunarlander_ppo',
    description: "L'agent **PPO** atterrit le module Eagle-1 sur la lune ! 🎯"
});

console.log('\n' + '='.repeat(50));
console.log('✅ Terminé !');
console.log('='.repeat(50));
console.log('\nProchaine étape:');
console.log('  1. git add .');
console.log('  2. git commit -m "Ajout des vidéos"');
console.log('  3. git push');
console.log('  4. Sur le pod: git pull && node add_videos.js');
