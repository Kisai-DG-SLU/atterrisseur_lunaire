/**
 * Script pour ajouter des explications narratives aux notebooks.
 * Exécute: node add_narrative.js
 */
const fs = require('fs');

function addNarrativeCells(notebookPath, config) {
    console.log(`\n📝 Ajout des explications narratives à ${notebookPath}...`);
    
    const nb = JSON.parse(fs.readFileSync(notebookPath, 'utf8'));
    
    const newCells = [];
    
    if (config.type === 'exercice03') {
        // 1. Explication de la boucle d'entraînement
        newCells.push({
            cell_type: 'markdown',
            metadata: {},
            source: [
                "### 🎬 Que se passe-t-il pendant l'entraînement ?\n",
                "\n",
                "Pendant ces 50 000 étapes, le DQN fait **3 choses en boucle** :\n",
                "\n",
                "```\n",
                "1. COLLECTER des expériences (état, action, reward, next_state)\n",
                "   ↓\n",
                "2. STOCKER dans le Replay Buffer (mémoire)\n",
                "   ↓\n",
                "3. APPRENDRE en randomly sélectionnant des expériences\n",
                "```\n",
                "\n",
                "**La boucle d'apprentissage :**\n",
                "- Le réseau prédit Q(s, gauche) et Q(s, droite)\n",
                "- On calcule la \"vraie\" Q-valeur avec Bellman\n",
                "- On minimise l'erreur entre prédiction et réalité\n",
                "- L'epsilon décroît progressivement (exploration → exploitation)\n"
            ]
        });
        
        // 2. Explication des métriques pendant l'entraînement
        newCells.push({
            cell_type: 'markdown',
            metadata: {},
            source: [
                "### 📊 Interprétation des métriques d'entraînement\n",
                "\n",
                "Pendant l'entraînement, regardons les colonnes clés :\n",
                "\n",
                "| Métrique | Signification | Ce qu'on veut voir |\n",
                "|----------|----------------|---------------------|\n",
                "| `ep_rew_mean` | Reward moyen des épisodes | ↑ qui augmente |\n",
                "| `exploration_rate` | Probabilité d'action aléatoire | ↓ qui diminue |\n",
                "| `loss` | Erreur du réseau | ↓ qui se stabilise |\n",
                "| `n_updates` | Nombre de mises à jour | ↑ constante |\n",
                "\n",
                "**Phase par phase :**\n",
                "- **Steps 0-10k** : `ep_rew_mean` ~15-20, `exploration_rate` ~1.0\n",
                "  → L'agent choisit presque tout au hasard\n",
                "- **Steps 10k-30k** : `ep_rew_mean` baisse ou stagne\n",
                "  → C'est normal ! Le réseau \"désapprend\" pour réapprendre\n",
                "- **Steps 30k-50k** : `ep_rew_mean` monte vers 150+\n",
                "  → L'agent a trouvé une bonne stratégie !\n"
            ]
        });
        
        // 3. Explication après évaluation
        newCells.push({
            cell_type: 'markdown',
            metadata: {},
            source: [
                "### 🎯 Comprendre le score de 169 points\n",
                "\n",
                "Un reward de **169** signifie que l'agent a survécu en moyenne ~169 steps.\n",
                "\n",
                "**Rappel de la physique :**\n",
                "- Le pendule tombe naturellement (gravité)\n",
                "- Chaque step = ~0.02 secondes\n",
                "- 169 steps ≈ **3.4 secondes** de survie\n",
                "\n",
                "**Comparaison :**\n",
                "- Agent aléatoire : ~20 points (~0.4 sec)\n",
                "- DQN entraîné : ~169 points (~3.4 sec)\n",
                "- Maximum théorique : 500 points (10 sec)\n",
                "\n",
                "L'agent a **8x amélioré** sa survie grâce à l'apprentissage !\n"
            ]
        });
        
    } else if (config.type === 'mission') {
        // 1. Explication des observations LunarLander
        newCells.push({
            cell_type: 'markdown',
            metadata: {},
            source: [
                "### 🔬 Décodage des 8 valeurs d'observation\n",
                "\n",
                "L'agent reçoit 8 nombres à chaque step. Que signifient-ils ?\n",
                "\n",
                "```\n",
                "[pos_x, pos_y, vel_x, vel_y, angle, ang_vel, leg_l, leg_r]\n",
                "```\n",
                "\n",
                "| Index | Signification | Exemple |\n",
                "|-------|---------------|----------|\n",
                "| 0-1 | Position xy du module | -0.5 à 0.5 |\n",
                "| 2-3 | Vitesse xy | -10 à 10 |\n",
                "| 4-5 | Angle et vitesse angulaire | radians |\n",
                "| 6-7 | Contact jambes (0/1) | Le module a atterri ? |\n",
                "\n",
                "**But :** Atterrir doucement sur la plateforme !\n",
                "- Reward positif pour rester stable\n",
                "- Reward négatif pour crash ou sortir de la zone\n"
            ]
        });
        
        // 2. Explication PPO vs DQN
        newCells.push({
            cell_type: 'markdown',
            metadata: {},
            source: [
                "### 🤖 Pourquoi PPO et pas DQN ?\n",
                "\n",
                "**DQN** (Exercice 3) :\n",
                "- Apprend une **fonction de valeur** Q(s,a)\n",
                "- Bon pour les espaces discrets simples\n",
                "\n",
                "**PPO** (cette mission) :\n",
                "- Apprend directement une **politique** π(a|s)\n",
                "- Plus stable pour les tâches complexes\n",
                "- Fonctionne mieux quand l'action influence l'environnement\n",
                "\n",
                "Pour LunarLander, PPO est préféré car :\n",
                "1. Les actions ont des **conséquences continues**\n",
                "2. L'atterrissage requiert une **fine coordination**\n",
                "3. La récompense change **progressivement** (pas binaire)\n"
            ]
        });
        
        // 3. Explication des métriques PPO
        newCells.push({
            cell_type: 'markdown',
            metadata: {},
            source: [
                "### 📊 Glossaire des métriques PPO\n",
                "\n",
                "| Métrique | Signification | Bon signe |\n",
                "|----------|---------------|----------|\n",
                "| `ep_rew_mean` | Reward moyen des épisodes | Monte vers +200 |\n",
                "| `approx_kl` | \"Distance\" entre politiques | < 0.02 |\n",
                "| `clip_fraction` | % de changements limités | ~10-20% |\n",
                "| `entropy_loss` | Incertitude de l'agent | Stable ou diminue |\n",
                "| `explained_variance` | Précision de la value function | → 1.0 |\n",
                "| `value_loss` | Erreur de prédiction de reward | Diminue |\n",
                "\n",
                "**`approx_kl` trop grand (>0.03)** = la politique change trop vite → instabilité\n",
                "\n",
                "**`clip_fraction` trop petit (<5%)** = l'agent n'explore plus assez\n"
            ]
        });
        
        // 4. Explication de la progression
        newCells.push({
            cell_type: 'markdown',
            metadata: {},
            source: [
                "### 📈 Évolution du reward : du négatif au positif\n",
                "\n",
                "**Pourquoi le reward est négatif au début ?**\n",
                "\n",
                "```\n",
                "Reward par step = \n",
                "  +fuel restant (on économise)\n",
                "  -velocity penalty (vite = dangereux)\n",
                "  -angle penalty (penché = dangereux)\n",
                "  -contact penalty (crash = très négatif)\n",
                "```\n",
                "\n",
                "Au début :\n",
                "- L'agent brûle du carburant n'importe comment\n",
                "- Il tombe et crash souvent → reward très négatif (~-150)\n",
                "\n",
                "À la fin :\n",
                "- L'agent contrôle précisément sa descente\n",
                "- Atterrit doucement sur la plateforme → reward positif (~+200)\n",
                "\n",
                "**Le moment \"aha\" :** Quand `ep_rew_mean` passe de négatif à positif, c'est que l'agent a compris comment atterrir !\n"
            ]
        });
        
        // 5. Explication des résultats finaux
        newCells.push({
            cell_type: 'markdown',
            metadata: {},
            source: [
                "### 🏆 Analyse des résultats finaux\n",
                "\n",
                "Avec **200 000 steps**, on atteint ~215 points en moyenne.\n",
                "\n",
                "**Que signifie ce score ?**\n",
                "- **+100 à +150** : Atterrissage correct mais avec dommages\n",
                "- **+150 à +200** : Bon atterrissage\n",
                "- **+200 à +300** : Excellent atterrissage, efficient\n",
                "\n",
                "**Variance normale :**\n",
                "- Certains épisodes = crash (min ~-100)\n",
                "- D'autres = atterrissage parfait (max ~300)\n",
                "\n",
                "**Pour améliorer encore :**\n",
                "- Entraîner plus longtemps (500k+ steps)\n",
                "- Ajuster `ent_coef` (plus d'exploration)\n",
                "- Utiliser un réseau plus grand\n"
            ]
        });
    }
    
    // Insérer les nouvelles cellules après la première cellule markdown
    // Trouver le bon endroit selon le type
    let insertIdx = 0;
    for (let i = 0; i < nb.cells.length; i++) {
        if (nb.cells[i].cell_type === 'markdown') {
            insertIdx = i + 1;
            break;
        }
    }
    
    // Pour mission, on cherche la section "Mission 2"
    if (config.type === 'mission') {
        for (let i = 0; i < nb.cells.length; i++) {
            if (nb.cells[i].cell_type === 'markdown') {
                const source = nb.cells[i].source.join('');
                if (source.includes('Mission 2')) {
                    insertIdx = i;
                    break;
                }
            }
        }
    }
    
    // Insérer les nouvelles cellules
    for (let i = 0; i < newCells.length; i++) {
        nb.cells.splice(insertIdx + i, 0, newCells[i]);
    }
    
    fs.writeFileSync(notebookPath, JSON.stringify(nb, null, 1));
    console.log(`✅ Explications ajoutées à ${notebookPath}`);
}

console.log('='.repeat(50));
console.log('📚 Ajout des explications narratives...');
console.log('='.repeat(50));

addNarrativeCells('exercice_03.ipynb', { type: 'exercice03' });
addNarrativeCells('mission.ipynb', { type: 'mission' });

console.log('\n' + '='.repeat(50));
console.log('✅ Terminé !');
console.log('='.repeat(50));
