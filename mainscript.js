        (function() {
            // ---- PLANT POOL (16 plants, 4 of each rarity) ----
            const PLANT_POOL = [
                // Common (4)
                { name: 'Daisy', icon: 'fa-leaf', rarity: 'common' },
                { name: 'Clover', icon: 'fa-leaf', rarity: 'common' },
                { name: 'Mint', icon: 'fa-leaf', rarity: 'common' },
                { name: 'Fern', icon: 'fa-leaf', rarity: 'common' },
                // Rare (4)
                { name: 'Rose', icon: 'fa-seedling', rarity: 'rare' },
                { name: 'Tulip', icon: 'fa-seedling', rarity: 'rare' },
                { name: 'Lavender', icon: 'fa-seedling', rarity: 'rare' },
                { name: 'Orchid', icon: 'fa-seedling', rarity: 'rare' },
                // Epic (4)
                { name: 'Monstera', icon: 'fa-cannabis', rarity: 'epic' },
                { name: 'Aloe', icon: 'fa-cannabis', rarity: 'epic' },
                { name: 'Palm', icon: 'fa-cannabis', rarity: 'epic' },
                { name: 'Ficus', icon: 'fa-cannabis', rarity: 'epic' },
                // Legendary (4)
                { name: 'Golden Lotus', icon: 'fa-clover', rarity: 'legendary' },
                { name: 'Dragon Tree', icon: 'fa-clover', rarity: 'legendary' },
                { name: 'Moonflower', icon: 'fa-clover', rarity: 'legendary' },
                { name: 'Starlight Orchid', icon: 'fa-clover', rarity: 'legendary' }
            ];

            // Rarity configs
            const RARITY_CONFIG = {
                common: { points: 25, label: 'Common', class: 'rarity-common', emoji: '🟢', weight: 0.80 },
                rare: { points: 50, label: 'Rare', class: 'rarity-rare', emoji: '🔵', weight: 0.10 },
                epic: { points: 70, label: 'Epic', class: 'rarity-epic', emoji: '🟣', weight: 0.08 },
                legendary: { points: 100, label: 'Legendary', class: 'rarity-legendary', emoji: '🟠', weight: 0.02 }
            };

            // ---- state ----
            let points = 240;
            let score = 0; // separate score from gacha pulls
            let plants = []; // plants in garden (max 16)
            let latestPlant = null; // { name, rarity }
            const MAX_PLANTS = 16;

            // Friends data with latest plant and score
            const friends = [
                { name: 'Lena', icon: 'fas fa-user-friends', latest: { name: 'Rose', rarity: 'rare' }, score: 320 },
                { name: 'Marco', icon: 'fas fa-user-friends', latest: { name: 'Dragon Tree', rarity: 'legendary' }, score: 540 },
                { name: 'Sofia', icon: 'fas fa-user-friends', latest: { name: 'Mint', rarity: 'common' }, score: 180 },
                { name: 'James', icon: 'fas fa-user-friends', latest: { name: 'Monstera', rarity: 'epic' }, score: 410 }
            ];

            // ---- DOM refs ----
            const plotGrid = document.getElementById('plotGrid');
            const pointSpan = document.getElementById('pointDisplay');
            const plantCounter = document.getElementById('plantCounter');
            const toast = document.getElementById('toastMessage');
            const snapBtn = document.getElementById('snapButton');
            const gachaBtn = document.getElementById('gachaButton');
            const gachaResult = document.getElementById('gachaResult');
            const friendsGrid = document.getElementById('friendsGrid');
            const profilePlantCount = document.getElementById('profilePlantCount');
            const profilePoints = document.getElementById('profilePoints');
            const profileScore = document.getElementById('profileScore');
            const profileLatestPlant = document.getElementById('profileLatestPlant');
            const profileLatestRarity = document.getElementById('profileLatestRarity');

            const views = {
                home: document.getElementById('homeView'),
                friends: document.getElementById('friendsView'),
                store: document.getElementById('storeView'),
                gacha: document.getElementById('gachaView'),
                profile: document.getElementById('profileView')
            };
            const navBtns = document.querySelectorAll('.nav-btn');

            // ---- weighted random rarity picker ----
            function getRandomRarity() {
                const rand = Math.random();
                let cumulative = 0;
                for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
                    cumulative += config.weight;
                    if (rand <= cumulative) {
                        return rarity;
                    }
                }
                return 'common';
            }

            // ---- get random plant by rarity ----
            function getRandomPlantByRarity(rarity) {
                const pool = PLANT_POOL.filter(p => p.rarity === rarity);
                if (pool.length === 0) return PLANT_POOL[0];
                return pool[Math.floor(Math.random() * pool.length)];
            }

            // ---- render garden ----
            function renderPlots() {
                plotGrid.innerHTML = '';
                for (let i = 0; i < MAX_PLANTS; i++) {
                    const plot = document.createElement('div');
                    plot.className = 'plot';
                    if (i < plants.length) {
                        const p = plants[i];
                        const rarityInfo = RARITY_CONFIG[p.rarity] || RARITY_CONFIG.common;
                        plot.classList.add(rarityInfo.class);
                        plot.innerHTML = `
                            <i class="fas ${p.icon}"></i>
                            <span class="plant-name">${p.name}</span>
                            <span class="rarity-badge">${rarityInfo.emoji}</span>
                            <button class="delete-btn" data-index="${i}" title="delete plant">✕</button>
                        `;
                    } else {
                        plot.classList.add('empty-plot');
                        plot.innerHTML = `<i class="fas fa-plus-circle"></i><span style="font-size:9px;">empty</span>`;
                    }
                    plotGrid.appendChild(plot);
                }

                // Attach delete events
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const index = parseInt(this.dataset.index, 10);
                        deletePlant(index);
                    });
                });

                plantCounter.innerText = `${plants.length} / ${MAX_PLANTS}`;
                updateProfile();
            }

            function updatePoints() {
                pointSpan.innerText = points;
                if (profilePoints) profilePoints.innerText = points;
            }

            function updateProfile() {
                if (profilePlantCount) profilePlantCount.innerText = plants.length;
                if (profilePoints) profilePoints.innerText = points;
                if (profileScore) profileScore.innerText = score;
                if (latestPlant) {
                    if (profileLatestPlant) profileLatestPlant.innerText = latestPlant.name;
                    if (profileLatestRarity) {
                        const rarityInfo = RARITY_CONFIG[latestPlant.rarity] || RARITY_CONFIG.common;
                        profileLatestRarity.innerText = `${rarityInfo.emoji} ${rarityInfo.label}`;
                        profileLatestRarity.className = `latest-rarity ${rarityInfo.class}`;
                    }
                } else {
                    if (profileLatestPlant) profileLatestPlant.innerText = '—';
                    if (profileLatestRarity) {
                        profileLatestRarity.innerText = '—';
                        profileLatestRarity.className = 'latest-rarity';
                    }
                }
            }

            function showToast(msg, icon = 'fa-spa') {
                toast.classList.remove('hidden');
                toast.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
                clearTimeout(toast._timeout);
                toast._timeout = setTimeout(() => {
                    toast.innerHTML =
                    `<i class="fas fa-spa"></i> Rarities: green = common, blue = rare, purple = epic, orange = legendary`;
                }, 3500);
            }

            // ---- add plant to garden ----
            function addPlantToGarden(plant) {
                if (plants.length >= MAX_PLANTS) {
                    showToast('garden is full! delete a plant first 🌿', 'fa-exclamation-circle');
                    return false;
                }
                plants.push({ ...plant });
                // Update latest plant
                latestPlant = { name: plant.name, rarity: plant.rarity };
                renderPlots();
                updateProfile();
                return true;
            }

            // ---- delete plant ----
            function deletePlant(index) {
                if (index < 0 || index >= plants.length) return;
                const removed = plants[index];
                plants.splice(index, 1);
                renderPlots();
                showToast(`🗑️ removed ${removed.name} from your garden`, 'fa-trash');
            }

            // ---- SNAP (no plant, just +5 points) ----
            function snapPlant() {
                points += 10;
                updatePoints();
                showToast(`📸 +10 points for snapping!`, 'fa-camera');
            }

            // ---- GACHA (costs 60 points, weighted rarity) ----
            function pullGacha() {
                if (points < 60) {
                    showToast(`not enough points! need 60 ★`, 'fa-exclamation-circle');
                    return;
                }
                if (plants.length >= MAX_PLANTS) {
                    showToast('garden is full! delete a plant first', 'fa-exclamation-circle');
                    return;
                }

                // Deduct points
                points -= 60;
                updatePoints();

                // Pick rarity based on weights
                const rarity = getRandomRarity();
                const plant = getRandomPlantByRarity(rarity);
                const rarityInfo = RARITY_CONFIG[rarity];

                // Add to garden
                addPlantToGarden(plant);

                // Add to score (separate from points)
                score += rarityInfo.points;
                updateProfile();

                // Show result in gacha view
                gachaResult.innerHTML = `
                    <div class="result-plant"><i class="fas ${plant.icon}"></i></div>
                    <div class="result-name">${plant.name}</div>
                    <div class="result-rarity ${rarityInfo.class}">${rarityInfo.emoji} ${rarityInfo.label}</div>
                    <div style="margin-top:6px; font-weight:600; color:#1d3d1d;">
                        <i class="fas fa-trophy"></i> +${rarityInfo.points} score!
                    </div>
                `;

                showToast('Rarity Chances: common = 80%, rare = 10%, epic = 8%, legendary = 2%');
            }

            // ---- render friends ----
            function renderFriends() {
                friendsGrid.innerHTML = '';
                friends.forEach(f => {
                    const card = document.createElement('div');
                    card.className = 'friend-card';
                    const rarityInfo = RARITY_CONFIG[f.latest.rarity] || RARITY_CONFIG.common;
                    card.innerHTML = `
                        <i class="fas ${f.icon}"></i>
                        <div class="fname">${f.name}</div>
                        <div class="latest-plant">🌱 ${f.latest.name}</div>
                        <div class="score-display"><i class="fas fa-trophy"></i> ${f.score}</div>
                    `;
                    friendsGrid.appendChild(card);
                });
            }

            // ---- navigation ----
            function navigateTo(viewId) {
                Object.values(views).forEach(v => v.classList.remove('active'));
                const target = document.getElementById(viewId);
                if (target) target.classList.add('active');

                navBtns.forEach(btn => {
                    btn.classList.remove('active-tab');
                    if (btn.dataset.view === viewId) {
                        btn.classList.add('active-tab');
                    }
                });

                // Hide toast on non-home pages
                if (viewId === 'homeView') {
                    toast.classList.remove('hidden');
                } else {
                    toast.classList.add('hidden');
                }
            }

            // ---- init ----
            function init() {
                // Start with a few example plants
                const starterPlants = [
                    PLANT_POOL[0], // Daisy
                    PLANT_POOL[4], // Rose
                    PLANT_POOL[8], // Monstera
                    PLANT_POOL[12] // Golden Lotus
                ];
                starterPlants.forEach(p => {
                    if (plants.length < MAX_PLANTS) plants.push({ ...p });
                });

                // Set latest plant
                if (plants.length > 0) {
                    const last = plants[plants.length - 1];
                    latestPlant = { name: last.name, rarity: last.rarity };
                }

                renderPlots();
                updatePoints();
                updateProfile();
                renderFriends();

                // Snap button (no plant, just points)
                snapBtn.addEventListener('click', snapPlant);

                // Gacha button
                gachaBtn.addEventListener('click', pullGacha);

                // Nav buttons
                navBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const viewId = this.dataset.view;
                        if (viewId) navigateTo(viewId);
                    });
                });

                // Store items
                document.querySelectorAll('.store-item').forEach(item => {
                    item.addEventListener('click', function() {
                        const cost = parseInt(this.dataset.cost, 10);
                        const itemName = this.dataset.item;
                        if (points < cost) {
                            showToast(`not enough points! need ${cost} ★`, 'fa-exclamation-circle');
                            return;
                        }
                        points -= cost;
                        updatePoints();
                        if (plants.length < MAX_PLANTS) {
                            const decoMap = { gnome: 'fa-frog', bench: 'fa-tree', lamp: 'fa-sun',
                                fountain: 'fa-water', birdhouse: 'fa-dove', compost: 'fa-recycle' };
                            const icon = decoMap[item] || 'fa-gem';
                            plants.push({ name: item.charAt(0).toUpperCase() + item.slice(1), icon: icon,
                                rarity: 'common' });
                            renderPlots();
                            showToast(`✨ ${item} placed in your garden!`, 'fa-gem');
                        } else {
                            showToast(`garden full! can't place ${item}`, 'fa-exclamation-circle');
                            points += cost;
                            updatePoints();
                            showToast(`refunded ${cost} points — garden full`, 'fa-undo');
                        }
                    });
                });
            }

            init();
        })();