/**
 * Script pour remplacer les cellules RecordVideo par une version imageio.
 * Exécute: node fix_videos.js
 */
const fs = require('fs');

function fixNotebook(notebookPath, config) {
    console.log(`\n📝 Traitement de ${notebookPath}...`);
    
    const nb = JSON.parse(fs.readFileSync(notebookPath, 'utf8'));
    
    // Trouver les indices des cellules RecordVideo
    const cellsToRemove = [];
    
    for (let i = 0; i < nb.cells.length; i++) {
        const cell = nb.cells[i];
        if (cell.cell_type === 'code') {
            const source = cell.source.join('');
            if (source.includes('RecordVideo') || source.includes('ffmpeg') || source.includes('subprocess')) {
                cellsToRemove.push(i);
            }
        }
    }
    
    console.log(`   Cellules video trouvees: ${cellsToRemove.length}`);
    
    // Supprimer en sens inverse
    for (let i = cellsToRemove.length - 1; i >= 0; i--) {
        nb.cells.splice(cellsToRemove[i], 1);
    }
    
    const { envName, nEpisodes, agentType, modelPath, videoPrefix } = config;
    
    let code;
    if (agentType === 'random') {
        code = [
            'import os\n',
            'import imageio\n',
            'from IPython.display import Video\n',
            'from PIL import Image\n',
            '\n',
            'frames_dir = "./videos/frames"\n',
            'video_folder = "./videos"\n',
            'os.makedirs(frames_dir, exist_ok=True)\n',
            'os.makedirs(video_folder, exist_ok=True)\n',
            '\n',
            'os.environ["SDL_VIDEODRIVER"] = "dummy"\n',
            'os.environ["SDL_AUDIODRIVER"] = "dummy"\n',
            '\n',
            'env = gym.make("' + envName + '", render_mode="rgb_array")\n',
            '\n',
            'print("Enregistrement de ' + nEpisodes + ' episode(s)...", flush=True)\n',
            '\n',
            'frames = []\n',
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
            '        \n',
            '        frame = env.render()\n',
            '        if frame is not None:\n',
            '            frames.append(frame)\n',
            '    \n',
            '    print(f"Episode {episode+1}: {total_reward:.1f} points ({len(frames)} frames total)")\n',
            '\n',
            'env.close()\n',
            '\n',
            'video_path = f"{video_folder}/' + videoPrefix + '.mp4"\n',
            'imageio.mimwrite(video_path, frames, fps=30)\n',
            '\n',
            'print(f"Video enregistree: {video_path}")\n',
            'Video(video_path, embed=True, width=640)'
        ];
    } else if (agentType === 'qtable') {
        code = [
            'import os\n',
            'import imageio\n',
            'from IPython.display import Video\n',
            'import numpy as np\n',
            '\n',
            'frames_dir = "./videos/frames"\n',
            'video_folder = "./videos"\n',
            'os.makedirs(frames_dir, exist_ok=True)\n',
            'os.makedirs(video_folder, exist_ok=True)\n',
            '\n',
            'os.environ["SDL_VIDEODRIVER"] = "dummy"\n',
            'os.environ["SDL_AUDIODRIVER"] = "dummy"\n',
            '\n',
            'env = gym.make("' + envName + '", render_mode="rgb_array")\n',
            '\n',
            'print("Enregistrement de ' + nEpisodes + ' episode(s) avec agent Q-Learning...", flush=True)\n',
            '\n',
            'frames = []\n',
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
            '        \n',
            '        frame = env.render()\n',
            '        if frame is not None:\n',
            '            frames.append(frame)\n',
            '    \n',
            '    result = "Succes!" if total_reward > 0 else "Echec"\n',
            '    print(f"Episode {episode+1}: {result} (reward={total_reward:.1f})")\n',
            '\n',
            'env.close()\n',
            '\n',
            'video_path = f"{video_folder}/' + videoPrefix + '.mp4"\n',
            'imageio.mimwrite(video_path, frames, fps=30)\n',
            '\n',
            'print(f"Video enregistree: {video_path}")\n',
            'Video(video_path, embed=True, width=640)'
        ];
    } else {
        const modelType = modelPath.split('_')[0].toUpperCase();
        code = [
            'import os\n',
            'import imageio\n',
            'from IPython.display import Video\n',
            '\n',
            'frames_dir = "./videos/frames"\n',
            'video_folder = "./videos"\n',
            'os.makedirs(frames_dir, exist_ok=True)\n',
            'os.makedirs(video_folder, exist_ok=True)\n',
            '\n',
            'os.environ["SDL_VIDEODRIVER"] = "dummy"\n',
            'os.environ["SDL_AUDIODRIVER"] = "dummy"\n',
            '\n',
            'model = ' + modelType + '.load("' + modelPath + '")\n',
            '\n',
            'env = gym.make("' + envName + '", render_mode="rgb_array")\n',
            '\n',
            'print("Enregistrement de ' + nEpisodes + ' episode(s) avec agent entraine...", flush=True)\n',
            '\n',
            'frames = []\n',
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
            '        \n',
            '        frame = env.render()\n',
            '        if frame is not None:\n',
            '            frames.append(frame)\n',
            '    \n',
            '    print(f"Episode {episode+1}: {total_reward:.1f} points ({len(frames)} frames total)")\n',
            '\n',
            'env.close()\n',
            '\n',
            'video_path = f"{video_folder}/' + videoPrefix + '.mp4"\n',
            'imageio.mimwrite(video_path, frames, fps=30)\n',
            '\n',
            'print(f"Video enregistree: {video_path}")\n',
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
    
    fs.writeFileSync(notebookPath, JSON.stringify(nb, null, 1));
    console.log(`✅ Cellule video ajoutee: ${notebookPath}`);
}

fs.mkdirSync('./videos', { recursive: true });

console.log('='.repeat(50));
console.log('🔧 Remplacement des cellules video...');
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
console.log('✅ Termine !');
console.log('='.repeat(50));
