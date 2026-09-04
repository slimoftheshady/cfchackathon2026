(function () {
    // ---- PLANT POOL ----
    const PLANT_POOL = [
        { name: 'Daisy', icon: 'fa-leaf', rarity: 'common' },
        { name: 'Clover', icon: 'fa-leaf', rarity: 'common' },
        { name: 'Mint', icon: 'fa-leaf', rarity: 'common' },
        { name: 'Fern', icon: 'fa-leaf', rarity: 'common' },

        { name: 'Rose', icon: 'fa-seedling', rarity: 'rare' },
        { name: 'Tulip', icon: 'fa-seedling', rarity: 'rare' },
        { name: 'Lavender', icon: 'fa-seedling', rarity: 'rare' },
        { name: 'Orchid', icon: 'fa-seedling', rarity: 'rare' },

        { name: 'Monstera', icon: 'fa-cannabis', rarity: 'epic' },
        { name: 'Aloe', icon: 'fa-cannabis', rarity: 'epic' },
        { name: 'Palm', icon: 'fa-cannabis', rarity: 'epic' },
        { name: 'Ficus', icon: 'fa-cannabis', rarity: 'epic' },

        { name: 'Golden Lotus', icon: 'fa-clover', rarity: 'legendary' },
        { name: 'Dragon Tree', icon: 'fa-clover', rarity: 'legendary' },
        { name: 'Moonflower', icon: 'fa-clover', rarity: 'legendary' },
        { name: 'Starlight Orchid', icon: 'fa-clover', rarity: 'legendary' }
    ];

    const RARITY_CONFIG = {
        common: {
            points: 25,
            label: 'Common',
            class: 'rarity-common',
            emoji: '🟢',
            weight: 0.80
        },

        rare: {
            points: 50,
            label: 'Rare',
            class: 'rarity-rare',
            emoji: '🔵',
            weight: 0.10
        },

        epic: {
            points: 70,
            label: 'Epic',
            class: 'rarity-epic',
            emoji: '🟣',
            weight: 0.08
        },

        legendary: {
            points: 100,
            label: 'Legendary',
            class: 'rarity-legendary',
            emoji: '🟠',
            weight: 0.02
        }
    };

    const MAX_PLANTS = 16;

    // ---- GAME STATE ----
    let points = 240;
    let score = 0;
    let plants = [];
    let latestPlant = null;

    // ---- LOGIN STATE ----
    let currentUser = null;
    let authMode = 'login';

    // Used so we do not save to the server on every tiny update.
    let saveTimer = null;

    // =========================================================
    // DOM REFERENCES
    // =========================================================

    const app = document.getElementById('app');

    // Login
    const authShell = document.getElementById('authShell');
    const authForm = document.getElementById('authForm');
    const authUsername = document.getElementById('authUsername');
    const authPassword = document.getElementById('authPassword');
    const authSubmit = document.getElementById('authSubmit');
    const authError = document.getElementById('authError');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    // Garden
    const plotGrid = document.getElementById('plotGrid');
    const pointSpan = document.getElementById('pointDisplay');
    const plantCounter = document.getElementById('plantCounter');
    const toast = document.getElementById('toastMessage');
    const snapBtn = document.getElementById('snapButton');

    // Gacha
    const gachaBtn = document.getElementById('gachaButton');
    const gachaResult = document.getElementById('gachaResult');

    // Friends
    const friendsGrid = document.getElementById('friendsGrid');
    const emptyFriends = document.getElementById('emptyFriends');

    const friendSearchInput =
        document.getElementById('friendSearchInput');

    const friendSearchButton =
        document.getElementById('friendSearchButton');

    const friendSearchResults =
        document.getElementById('friendSearchResults');

    const friendRequestsSection =
        document.getElementById('friendRequestsSection');

    const friendRequests =
        document.getElementById('friendRequests');

    // Profile
    const profileName = document.getElementById('profileName');
    const profilePlantCount =
        document.getElementById('profilePlantCount');

    const profilePoints =
        document.getElementById('profilePoints');

    const profileScore =
        document.getElementById('profileScore');

    const profileLatestPlant =
        document.getElementById('profileLatestPlant');

    const profileLatestRarity =
        document.getElementById('profileLatestRarity');

    const logoutButton =
        document.getElementById('logoutButton');

    // Views
    const views = {
        home: document.getElementById('homeView'),
        friends: document.getElementById('friendsView'),
        store: document.getElementById('storeView'),
        gacha: document.getElementById('gachaView'),
        profile: document.getElementById('profileView')
    };

    const navBtns =
        document.querySelectorAll('.nav-btn');

    // =========================================================
    // API HELPER
    // =========================================================

    async function api(url, options = {}) {
        const response = await fetch(url, {
            credentials: 'same-origin',

            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },

            ...options
        });

        let body = {};

        try {
            body = await response.json();
        } catch (error) {
            // Ignore JSON parsing errors.
        }

        if (!response.ok) {
            const error = new Error(
                body.error || 'Something went wrong.'
            );

            error.status = response.status;

            throw error;
        }

        return body;
    }

    // =========================================================
    // LOGIN / REGISTER
    // =========================================================

    function setAuthMode(mode) {
        authMode = mode;

        const registering =
            mode === 'register';

        loginTab.classList.toggle(
            'active',
            !registering
        );

        registerTab.classList.toggle(
            'active',
            registering
        );

        authSubmit.textContent =
            registering
                ? 'Create account'
                : 'Log in';

        authPassword.autocomplete =
            registering
                ? 'new-password'
                : 'current-password';

        authError.textContent = '';
    }

    function showAuth() {
        currentUser = null;

        authShell.classList.remove('hidden');
        app.classList.add('app-locked');

        authUsername.focus();
    }

    function showGame() {
        authShell.classList.add('hidden');
        app.classList.remove('app-locked');
    }

    async function bootstrap() {
        try {
            const data = await api('/api/me');

            currentUser = data.user;

            loadState(data.state);

            showGame();

            await loadFriends();
        } catch (error) {
            if (error.status === 401) {
                showAuth();
            } else {
                authError.textContent =
                    'Could not connect to the game server.';

                showAuth();
            }
        }
    }

    async function submitAuth(event) {
        event.preventDefault();

        authError.textContent = '';
        authSubmit.disabled = true;

        try {
            const endpoint =
                authMode === 'register'
                    ? '/api/register'
                    : '/api/login';

            await api(endpoint, {
                method: 'POST',

                body: JSON.stringify({
                    username:
                        authUsername.value.trim(),

                    password:
                        authPassword.value
                })
            });

            authPassword.value = '';

            await bootstrap();
        } catch (error) {
            authError.textContent =
                error.message;
        } finally {
            authSubmit.disabled = false;
        }
    }

    async function logout() {
        try {
            await api('/api/logout', {
                method: 'POST'
            });
        } catch (error) {
            // We still log the user out locally.
        }

        currentUser = null;
        plants = [];
        latestPlant = null;

        friendSearchResults.innerHTML = '';

        showAuth();
    }

    // =========================================================
    // LOAD / SAVE GAME STATE
    // =========================================================

    function loadState(state) {
        points =
            Number.isFinite(state.points)
                ? state.points
                : 240;

        score =
            Number.isFinite(state.score)
                ? state.score
                : 0;

        plants =
            Array.isArray(state.plants)
                ? state.plants.map(
                    plant => ({ ...plant })
                )
                : [];

        latestPlant =
            state.latestPlant || null;

        renderPlots();
        updatePoints();
        updateProfile();
    }

    function scheduleSave() {
        clearTimeout(saveTimer);

        saveTimer =
            setTimeout(
                saveState,
                180
            );
    }

    async function saveState() {
        if (!currentUser) {
            return;
        }

        try {
            await api('/api/state', {
                method: 'POST',

                body: JSON.stringify({
                    points: points,
                    score: score,
                    plants: plants,
                    latestPlant: latestPlant
                })
            });
        } catch (error) {
            if (error.status === 401) {
                showAuth();
            } else {
                showToast(
                    'Could not save your garden.',
                    'fa-exclamation-circle'
                );
            }
        }
    }

    // =========================================================
    // RANDOM PLANT FUNCTIONS
    // =========================================================

    function getRandomRarity() {
        const rand = Math.random();

        let cumulative = 0;

        for (
            const [rarity, config]
            of Object.entries(RARITY_CONFIG)
        ) {
            cumulative += config.weight;

            if (rand <= cumulative) {
                return rarity;
            }
        }

        return 'common';
    }

    function getRandomPlantByRarity(rarity) {
        const pool =
            PLANT_POOL.filter(
                plant =>
                    plant.rarity === rarity
            );

        return (
            pool[
                Math.floor(
                    Math.random() *
                    pool.length
                )
            ] ||
            PLANT_POOL[0]
        );
    }

    // =========================================================
    // GARDEN
    // =========================================================

    function renderPlots() {
        plotGrid.innerHTML = '';

        for (
            let i = 0;
            i < MAX_PLANTS;
            i++
        ) {
            const plot =
                document.createElement('div');

            plot.className = 'plot';

            if (i < plants.length) {
                const plant =
                    plants[i];

                const rarityInfo =
                    RARITY_CONFIG[
                        plant.rarity
                    ] ||
                    RARITY_CONFIG.common;

                plot.classList.add(
                    rarityInfo.class
                );

                plot.innerHTML = `
                    <i class="fas ${escapeClass(plant.icon)}"></i>

                    <span class="plant-name">
                        ${escapeHtml(plant.name)}
                    </span>

                    <span class="rarity-badge">
                        ${rarityInfo.emoji}
                    </span>

                    <button
                        class="delete-btn"
                        data-index="${i}"
                        title="delete plant"
                    >
                        ✕
                    </button>
                `;
            } else {
                plot.classList.add(
                    'empty-plot'
                );

                plot.innerHTML = `
                    <i class="fas fa-plus-circle"></i>

                    <span style="font-size:9px;">
                        empty
                    </span>
                `;
            }

            plotGrid.appendChild(plot);
        }

        document
            .querySelectorAll('.delete-btn')
            .forEach(button => {

                button.addEventListener(
                    'click',
                    function (event) {
                        event.stopPropagation();

                        deletePlant(
                            Number.parseInt(
                                this.dataset.index,
                                10
                            )
                        );
                    }
                );
            });

        plantCounter.innerText =
            `${plants.length} / ${MAX_PLANTS}`;

        updateProfile();
    }

    function updatePoints() {
        pointSpan.innerText = points;

        if (profilePoints) {
            profilePoints.innerText =
                points;
        }
    }

    function updateProfile() {
        if (profileName) {
            profileName.innerText =
                currentUser
                    ? currentUser.username
                    : 'Player';
        }

        if (profilePlantCount) {
            profilePlantCount.innerText =
                plants.length;
        }

        if (profilePoints) {
            profilePoints.innerText =
                points;
        }

        if (profileScore) {
            profileScore.innerText =
                score;
        }

        if (latestPlant) {
            profileLatestPlant.innerText =
                latestPlant.name;

            const rarityInfo =
                RARITY_CONFIG[
                    latestPlant.rarity
                ] ||
                RARITY_CONFIG.common;

            profileLatestRarity.innerText =
                `${rarityInfo.emoji} ${rarityInfo.label}`;

            profileLatestRarity.className =
                `latest-rarity ${rarityInfo.class}`;
        } else {
            profileLatestPlant.innerText =
                '—';

            profileLatestRarity.innerText =
                '—';

            profileLatestRarity.className =
                'latest-rarity';
        }
    }

    function showToast(
        message,
        icon = 'fa-spa'
    ) {
        toast.classList.remove(
            'hidden'
        );

        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            ${escapeHtml(message)}
        `;

        clearTimeout(
            toast._timeout
        );

        toast._timeout =
            setTimeout(() => {

                toast.innerHTML = `
                    <i class="fas fa-spa"></i>
                    Rarities: green = common,
                    blue = rare,
                    purple = epic,
                    orange = legendary
                `;

            }, 3500);
    }

    function addPlantToGarden(plant) {
        if (
            plants.length >=
            MAX_PLANTS
        ) {
            showToast(
                'Garden is full! Remove a plant first 🌿',
                'fa-exclamation-circle'
            );

            return false;
        }

        plants.push({
            ...plant
        });

        latestPlant = {
            name: plant.name,
            rarity: plant.rarity
        };

        renderPlots();
        updateProfile();

        scheduleSave();

        return true;
    }

    function deletePlant(index) {
        if (
            index < 0 ||
            index >= plants.length
        ) {
            return;
        }

        const removed =
            plants[index];

        plants.splice(
            index,
            1
        );

        renderPlots();

        scheduleSave();

        showToast(
            `Removed ${removed.name} from your garden`,
            'fa-trash'
        );
    }

    // =========================================================
    // SNAP
    // =========================================================

    function snapPlant() {
        points += 10;

        updatePoints();

        scheduleSave();

        showToast(
            '+10 points for snapping!',
            'fa-camera'
        );
    }

    // =========================================================
    // GACHA
    // =========================================================

    function pullGacha() {
        if (points < 60) {
            showToast(
                'Not enough points! You need 60 ★',
                'fa-exclamation-circle'
            );

            return;
        }

        if (
            plants.length >=
            MAX_PLANTS
        ) {
            showToast(
                'Garden is full! Remove a plant first 🌿',
                'fa-exclamation-circle'
            );

            return;
        }

        points -= 60;

        const rarity =
            getRandomRarity();

        const plant =
            getRandomPlantByRarity(
                rarity
            );

        const rarityInfo =
            RARITY_CONFIG[
                rarity
            ];

        plants.push({
            ...plant
        });

        latestPlant = {
            name: plant.name,
            rarity: plant.rarity
        };

        score +=
            rarityInfo.points;

        updatePoints();
        renderPlots();
        updateProfile();

        scheduleSave();

        gachaResult.innerHTML = `
            <div class="result-plant">
                <i class="fas ${escapeClass(plant.icon)}"></i>
            </div>

            <div class="result-name">
                ${escapeHtml(plant.name)}
            </div>

            <div class="result-rarity ${rarityInfo.class}">
                ${rarityInfo.emoji}
                ${rarityInfo.label}
            </div>

            <div
                style="
                    margin-top:6px;
                    font-weight:600;
                    color:#1d3d1d;
                "
            >
                <i class="fas fa-trophy"></i>
                +${rarityInfo.points} score!
            </div>
        `;

        showToast(
            'Rarity Chances: common = 80%, rare = 10%, epic = 8%, legendary = 2%'
        );
    }

    // =========================================================
    // FRIENDS
    // =========================================================

    async function loadFriends() {
        if (!currentUser) {
            return;
        }

        try {
            const data =
                await api(
                    '/api/friends'
                );

            renderFriendCards(
                data.friends || []
            );

            renderFriendRequests(
                data.incoming || []
            );
        } catch (error) {
            if (
                error.status ===
                401
            ) {
                showAuth();
            }
        }
    }

    function renderFriendCards(
        friends
    ) {
        friendsGrid.innerHTML = '';

        emptyFriends.classList.toggle(
            'hidden',
            friends.length > 0
        );

        friends.forEach(
            friend => {

                const rarityInfo =
                    friend.latest_rarity
                        ? (
                            RARITY_CONFIG[
                                friend.latest_rarity
                            ] ||
                            RARITY_CONFIG.common
                        )
                        : null;

                const card =
                    document.createElement(
                        'div'
                    );

                card.className =
                    'friend-card';

                card.innerHTML = `
                    <i class="fas fa-user-friends"></i>

                    <div class="fname">
                        ${escapeHtml(friend.username)}
                    </div>

                    <div class="latest-plant">
                        ${
                            friend.latest_name
                                ? `
                                    🌱
                                    ${escapeHtml(friend.latest_name)}
                                    ${
                                        rarityInfo
                                            ? rarityInfo.emoji
                                            : ''
                                    }
                                `
                                : '🌱 No plants yet'
                        }
                    </div>

                    <div class="score-display">
                        <i class="fas fa-trophy"></i>
                        ${friend.score || 0}
                    </div>
                `;

                friendsGrid.appendChild(
                    card
                );
            }
        );
    }

    function renderFriendRequests(
        requests
    ) {
        friendRequests.innerHTML = '';

        friendRequestsSection
            .classList
            .toggle(
                'hidden',
                requests.length === 0
            );

        requests.forEach(
            request => {

                const row =
                    document.createElement(
                        'div'
                    );

                row.className =
                    'request-row';

                row.innerHTML = `
                    <div class="request-name">
                        ${escapeHtml(request.username)}
                    </div>

                    <button
                        class="friend-action accept-request"
                        data-id="${request.request_id}"
                    >
                        Accept
                    </button>

                    <button
                        class="friend-action secondary reject-request"
                        data-id="${request.request_id}"
                    >
                        Ignore
                    </button>
                `;

                friendRequests.appendChild(
                    row
                );
            }
        );

        document
            .querySelectorAll(
                '.accept-request'
            )
            .forEach(button => {

                button.addEventListener(
                    'click',
                    () => {
                        answerFriendRequest(
                            button.dataset.id,
                            true
                        );
                    }
                );
            });

        document
            .querySelectorAll(
                '.reject-request'
            )
            .forEach(button => {

                button.addEventListener(
                    'click',
                    () => {
                        answerFriendRequest(
                            button.dataset.id,
                            false
                        );
                    }
                );
            });
    }

    async function searchFriends() {
        const query =
            friendSearchInput
                .value
                .trim();

        friendSearchResults.innerHTML =
            '';

        if (
            query.length < 2
        ) {
            return;
        }

        try {
            const data =
                await api(
                    `/api/users/search?q=${encodeURIComponent(query)}`
                );

            renderSearchResults(
                data.users || []
            );
        } catch (error) {
            friendSearchResults.textContent =
                error.message;
        }
    }

    function renderSearchResults(
        users
    ) {
        friendSearchResults.innerHTML =
            '';

        if (
            users.length === 0
        ) {
            friendSearchResults.innerHTML =
                `
                    <div class="empty-friends">
                        No matching players.
                    </div>
                `;

            return;
        }

        users.forEach(
            user => {

                const relation =
                    user.relation || {
                        status: 'none'
                    };

                const row =
                    document.createElement(
                        'div'
                    );

                row.className =
                    'user-result';

                let action = '';

                if (
                    relation.status ===
                    'none'
                ) {
                    action = `
                        <button
                            class="friend-action add-friend"
                            data-id="${user.id}"
                        >
                            Add
                        </button>
                    `;
                } else if (
                    relation.status ===
                    'friends'
                ) {
                    action = `
                        <button
                            class="friend-action"
                            disabled
                        >
                            Friends
                        </button>
                    `;
                } else if (
                    relation.status ===
                    'outgoing'
                ) {
                    action = `
                        <button
                            class="friend-action"
                            disabled
                        >
                            Sent
                        </button>
                    `;
                } else {
                    action = `
                        <button
                            class="friend-action accept-search"
                            data-request-id="${relation.request_id}"
                        >
                            Accept
                        </button>
                    `;
                }

                row.innerHTML = `
                    <div class="user-result-name">
                        <i class="fas fa-seedling"></i>
                        ${escapeHtml(user.username)}
                    </div>

                    ${action}
                `;

                friendSearchResults.appendChild(
                    row
                );
            }
        );

        document
            .querySelectorAll(
                '.add-friend'
            )
            .forEach(button => {

                button.addEventListener(
                    'click',
                    () => {
                        sendFriendRequest(
                            button.dataset.id
                        );
                    }
                );
            });

        document
            .querySelectorAll(
                '.accept-search'
            )
            .forEach(button => {

                button.addEventListener(
                    'click',
                    () => {
                        answerFriendRequest(
                            button.dataset.requestId,
                            true
                        );
                    }
                );
            });
    }

    async function sendFriendRequest(
        userId
    ) {
        try {
            await api(
                '/api/friends/request',
                {
                    method: 'POST',

                    body: JSON.stringify({
                        user_id:
                            Number(userId)
                    })
                }
            );

            await searchFriends();
            await loadFriends();
        } catch (error) {
            showToast(
                error.message,
                'fa-exclamation-circle'
            );
        }
    }

    async function answerFriendRequest(
        requestId,
        accept
    ) {
        try {
            await api(
                accept
                    ? '/api/friends/accept'
                    : '/api/friends/reject',

                {
                    method: 'POST',

                    body: JSON.stringify({
                        request_id:
                            Number(requestId)
                    })
                }
            );

            await loadFriends();

            if (
                friendSearchInput
                    .value
                    .trim()
                    .length >= 2
            ) {
                await searchFriends();
            }
        } catch (error) {
            showToast(
                error.message,
                'fa-exclamation-circle'
            );
        }
    }

    // =========================================================
    // NAVIGATION
    // =========================================================

    function navigateTo(viewId) {
        Object
            .values(views)
            .forEach(view => {

                view.classList.remove(
                    'active'
                );
            });

        const target =
            document.getElementById(
                viewId
            );

        if (target) {
            target.classList.add(
                'active'
            );
        }

        navBtns.forEach(
            button => {

                button.classList.toggle(
                    'active-tab',
                    button.dataset.view ===
                        viewId
                );
            }
        );

        if (
            viewId ===
            'homeView'
        ) {
            toast.classList.remove(
                'hidden'
            );
        } else {
            toast.classList.add(
                'hidden'
            );
        }

        if (
            viewId ===
            'friendsView'
        ) {
            loadFriends();
        }
    }

    // =========================================================
    // SECURITY HELPERS
    // =========================================================

    function escapeHtml(value) {
        const div =
            document.createElement(
                'div'
            );

        div.textContent =
            String(value ?? '');

        return div.innerHTML;
    }

    function escapeClass(value) {
        return String(
            value ?? ''
        ).replace(
            /[^A-Za-z0-9_-]/g,
            ''
        );
    }

    // =========================================================
    // EVENT LISTENERS
    // =========================================================

    function bindEvents() {
        // Login / registration
        authForm.addEventListener(
            'submit',
            submitAuth
        );

        loginTab.addEventListener(
            'click',
            () => {
                setAuthMode(
                    'login'
                );
            }
        );

        registerTab.addEventListener(
            'click',
            () => {
                setAuthMode(
                    'register'
                );
            }
        );

        logoutButton.addEventListener(
            'click',
            logout
        );

        // Main game
        snapBtn.addEventListener(
            'click',
            snapPlant
        );

        gachaBtn.addEventListener(
            'click',
            pullGacha
        );

        // Navigation
        navBtns.forEach(
            button => {

                button.addEventListener(
                    'click',
                    function () {

                        if (
                            this.dataset.view
                        ) {
                            navigateTo(
                                this.dataset.view
                            );
                        }
                    }
                );
            }
        );

        // Friend search
        friendSearchButton
            .addEventListener(
                'click',
                searchFriends
            );

        friendSearchInput
            .addEventListener(
                'keydown',
                event => {

                    if (
                        event.key ===
                        'Enter'
                    ) {
                        event.preventDefault();

                        searchFriends();
                    }
                }
            );

        // Store
        document
            .querySelectorAll(
                '.store-item'
            )
            .forEach(item => {

                item.addEventListener(
                    'click',
                    function () {

                        const cost =
                            Number.parseInt(
                                this.dataset.cost,
                                10
                            );

                        const itemName =
                            this.dataset.item;

                        if (
                            points < cost
                        ) {
                            showToast(
                                `Not enough points! You need ${cost} ★`,
                                'fa-exclamation-circle'
                            );

                            return;
                        }

                        if (
                            plants.length >=
                            MAX_PLANTS
                        ) {
                            showToast(
                                `Garden full! can't place ${itemName}`,
                                'fa-exclamation-circle'
                            );

                            return;
                        }

                        points -= cost;

                        const decoMap = {
                            gnome: 'fa-frog',
                            bench: 'fa-tree',
                            lamp: 'fa-sun',
                            fountain: 'fa-water',
                            birdhouse: 'fa-dove',
                            compost: 'fa-recycle'
                        };

                        plants.push({
                            name:
                                itemName
                                    .charAt(0)
                                    .toUpperCase() +
                                itemName.slice(1),

                            icon:
                                decoMap[itemName] ||
                                'fa-gem',

                            rarity:
                                'common'
                        });

                        updatePoints();
                        renderPlots();

                        scheduleSave();

                        showToast(
                            `✨ ${itemName} placed in your garden!`,
                            'fa-gem'
                        );
                    }
                );
            });
    }

    // =========================================================
    // START APP
    // =========================================================

    setAuthMode('login');

    bindEvents();

    bootstrap();

})();