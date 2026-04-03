/**
 * Script pour nettoyer et remplacer les cellules vidéo mal formatées.
 * Exécute: node fix_videos.js
 */
const fs = require('fs');

function fixNotebook(notebookPath, config) {
    console.log(`\n📝 Traitement de ${notebookPath}...`);
    
    const nb = JSON.parse(fs.readFileSync(notebookPath, 'utf8'));
    
    // Trouver les indices des cellules à supprimer
    const cellsToRemove = [];
    let foundBadCell = false;
    
    for (let i = 0; i < nb.cells.length; i++) {
        const cell = nb.cells[i];
        if (cell.cell_type === 'code') {
            const source = cell.source.join('');
            // Chercher les cellules RecordVideo qui n'ont PAS de \n après import
            if (source.includes('RecordVideo') && source.includes('IPython.display import')) {
                // Si le premier élément ne contient pas \n, c'est mal formaté
                if (!cell.source[0].includes('\n')) {
                    cellsToRemove.push(i);
                    foundBadCell = true;
                }
            }
        }
    }
    
    console.log(`   Cellules mal formatées trouvées: ${cellsToRemove.length}`);
    
    // Supprimer en sens inverse
    for (let i = cellsToRemove.length - 1; i >= 0; i--) {
        nb.cells.splice(cellsToRemove[i], 1);
    }
    
    if (foundBadCell) {
        const { envName, nEpisodes, agentType, modelPath, videoPrefix } = config;
        
        let code;
        if (agentType === 'random') {
            code = [
                'from gymnasium.wrappers import RecordVideo\n',
                'import os\n',
                'from IPython.display import Video\n',
                '\n',
                `env = gym.make("${envName}", render_mode='rgb_array')\n`,
                'video_folder = "./videos"\n',
                'os.makedirs(video_folder, exist_ok=True)\n',
                '\n',
                `env = RecordVideo(\n`,
                '    env,\n',
                '    video_folder=video_folder,\n',
                `    name_prefix="${videoPrefix}",\n`,
                `    episode_trigger=lambda e: e < ${nEpisodes}\n`,
                ')\n',
                '\n',
                `print("🎬 Enregistrement de ${nEpisodes} épisode(s)...", flush=True)\n`,
                '\n',
                'for episode in range(' + nEpisodes + '):\n',
                '    state, info = env.reset()\n',
                '    total_reward = 0\n',
                '    terminated = truncated = False\n',
                '    \n',
                '    while not (terminated or truncated):\n',
                '        action = env.action_space.sample()\n',
                '        state, reward, terminated, truncated, info = env.step(action)\n',
                '        total_reward += reward\n',
                '    \n',
                `    print(f"Épisode {episode+1}: {total_reward:.1f} points")\n`,
                '\n',
                'env.close()\n',
                '\n',
                `video_path = f"{video_folder}/${videoPrefix}-ep0.mp4"\n`,
                `print(f"\\n✅ Vidéo enregistrée: {video_path}")\n`,
                'Video(video_path, embed=True, width=640)'
            ];
        } else if (agentType === 'qtable') {
            code = [
                'from gymnasium.wrappers import RecordVideo\n',
                'import os\n',
                'import numpy as np\n',
                'from IPython.display import Video\n',
                '\n',
                `env = gym.make("${envName}", render_mode='rgb_array')\n`,
                'video_folder = "./videos"\n',
                'os.makedirs(video_folder, exist_ok=True)\n',
                '\n',
                `env = RecordVideo(\n`,
                '    env,\n',
                '    video_folder=video_folder,\n',
                `    name_prefix="${videoPrefix}",\n`,
                `    episode_trigger=lambda e: e < ${nEpisodes}\n`,
                ')\n',
                '\n',
                `print("🎬 Enregistrement de ${nEpisodes} épisode(s) avec l'agent Q-Learning...", flush=True)\n`,
                '\n',
                'for episode in range(' + nEpisodes + '):\n',
                '    state, info = env.reset()\n',
                '    total_reward = 0\n',
                '    terminated = truncated = False\n',
                '    \n',
                '    while not (terminated or truncated):\n',
                '        action = np.argmax(q_table[state])\n',
                '        state, reward, terminated, truncated, info = env.step(action)\n',
                '        total_reward += reward\n',
                '    \n',
                `    result = "Succès!" if total_reward > 0 else "Échec"\n`,
                `    print(f"Épisode {episode+1}: {result} (reward={total_reward:.1f})")\n`,
                '\n',
                'env.close()\n',
                '\n',
                `video_path = f"{video_folder}/${videoPrefix}-ep0.mp4"\n`,
                `print(f"\\n✅ Vidéo enregistrée: {video_path}")\n`,
                'Video(video_path, embed=True, width=640)'
            ];
        } else {
            const modelType = modelPath.split('_')[0].toUpperCase();
            code = [
                'from gymnasium.wrappers import RecordVideo\n',
                'from stable_baselines3 import ' + modelType + '\n',
                'from IPython.display import Video\n',
                '\n',
                `model = ${modelType}.load("${modelPath}")\n`,
                '\n',
                `env = gym.make("${envName}", render_mode='rgb_array')\n`,
                'video_folder = "./videos"\n',
                'os.makedirs(video_folder, exist_ok=True)\n',
                '\n',
                `env = RecordVideo(\n`,
                '    env,\n',
                '    video_folder=video_folder,\n',
                `    name_prefix="${videoPrefix}",\n`,
                `    episode_trigger=lambda e: e < ${nEpisodes}\n`,
                ')\n',
                '\n',
                `print("🎬 Enregistrement de ${nEpisodes} épisode(s) avec l'agent entraîné...", flush=True)\n`,
                '\n',
                'for episode in range(' + nEpisodes + '):\n',
                '    state, info = env.reset()\n',
                '    total_reward = 0\n',
                '    terminated = truncated = False\n',
                '    \n',
                '    while not (terminated or truncated):\n',
                '        action, _ = model.predict(state, deterministic=True)\n',
                '        state, reward, terminated, truncated, info = env.step(action)\n',
                '        total_reward += reward\n',
                '    \n',
                `    print(f"Épisode {episode+1}: {total_reward:.1f} points")\n`,
                '\n',
                'env.close()\n',
                '\n',
                `video_path = f"{video_folder}/${videoPrefix}-ep0.mp4"\n`,
                `print(f"\\n✅ Vidéo enregistrée: {video_path}")\n`,
                'Video(video_path, embed=True, width=640)'
            ];
        }
        
        // Trouver où insérer (avant "Conclusion" ou fin)
        let insertIdx = nb.cells.length;
        for (let i = 0; i < nb.cells.length; i++) {
            if (nb.cells[i].cell_type === 'markdown') {
                const source = nb.cells[i].source.join('');
                if (source.includes('Conclusion')) {
                    insertIdx = i;
                    break;
                }
            }
        }
        
        nb.cells.splice(insertIdx, 0, {
            cell_type: 'code',
            execution_count: null,
            metadata: {},
            outputs: [],
            source: code
        });
        
        console.log(`✅ Cellule remplacée: ${notebookPath}`);
    }
    
    fs.writeFileSync(notebookPath, JSON.stringify(nb, null, 1));
}

// Assurer que le dossier videos existe
fs.mkdirSync('./videos', { recursive: true });

console.log('='.repeat(50));
console.log('🔧 Correction des cellules vidéo...');
console.log('='.repeat(50));

fixNotebook('exercice_01.ipynb', {
    envName: 'CartPole-v1',
    nEpisodes: 3,
    agentType: 'random',
    videoPrefix: 'exercice_01_cartpole_random'
});

fixNotebook('exercice_02.ipynb', {
    envName: 'FrozenLake-v1',
    nEpisodes: 3,
    agentType: 'qtable',
    videoPrefix: 'exercice_02_frozenlake_qlearning'
});

fixNotebook('exercice_03.ipynb', {
    envName: 'CartPole-v1',
    nEpisodes: 1,
    agentType: 'model',
    modelPath: 'dqn_cartpole',
    videoPrefix: 'exercice_03_cartpole_dqn'
});

fixNotebook('mission.ipynb', {
    envName: 'LunarLander-v3',
    nEpisodes: 1,
    agentType: 'model',
    modelPath: 'ppo_lunar_lander',
    videoPrefix: 'mission_lunarlander_ppo'
});

console.log('\n' + '='.repeat(50));
console.log('✅ Terminé !');
console.log('='.repeat(50));
