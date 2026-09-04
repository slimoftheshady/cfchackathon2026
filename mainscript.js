(function () {
    const PLANT_POOL = [
        { key: 'daisy', name: 'Daisy', icon: 'fa-leaf', rarity: 'common', kind: 'plant' },
        { key: 'clover', name: 'Clover', icon: 'fa-leaf', rarity: 'common', kind: 'plant' },
        { key: 'mint', name: 'Mint', icon: 'fa-leaf', rarity: 'common', kind: 'plant' },
        { key: 'fern', name: 'Fern', icon: 'fa-leaf', rarity: 'common', kind: 'plant' },
        { key: 'rose', name: 'Rose', icon: 'fa-seedling', rarity: 'rare', kind: 'plant' },
        { key: 'tulip', name: 'Tulip', icon: 'fa-seedling', rarity: 'rare', kind: 'plant' },
        { key: 'lavender', name: 'Lavender', icon: 'fa-seedling', rarity: 'rare', kind: 'plant' },
        { key: 'orchid', name: 'Orchid', icon: 'fa-seedling', rarity: 'rare', kind: 'plant' },
        { key: 'monstera', name: 'Monstera', icon: 'fa-cannabis', rarity: 'epic', kind: 'plant' },
        { key: 'aloe', name: 'Aloe', icon: 'fa-cannabis', rarity: 'epic', kind: 'plant' },
        { key: 'palm', name: 'Palm', icon: 'fa-cannabis', rarity: 'epic', kind: 'plant' },
        { key: 'ficus', name: 'Ficus', icon: 'fa-cannabis', rarity: 'epic', kind: 'plant' },
        { key: 'golden-lotus', name: 'Golden Lotus', icon: 'fa-clover', rarity: 'legendary', kind: 'plant' },
        { key: 'dragon-tree', name: 'Dragon Tree', icon: 'fa-clover', rarity: 'legendary', kind: 'plant' },
        { key: 'moonflower', name: 'Moonflower', icon: 'fa-clover', rarity: 'legendary', kind: 'plant' },
        { key: 'starlight-orchid', name: 'Starlight Orchid', icon: 'fa-clover', rarity: 'legendary', kind: 'plant' }
    ];

    const DECOR_POOL = [
        { key: 'gnome', name: 'Gnome', icon: 'fa-hat-wizard', rarity: 'decor', kind: 'decor', cost: 60 },
        { key: 'bench', name: 'Bench', icon: 'fa-chair', rarity: 'decor', kind: 'decor', cost: 100 },
        { key: 'solar-lamp', name: 'Solar Lamp', icon: 'fa-lightbulb', rarity: 'decor', kind: 'decor', cost: 80 },
        { key: 'fountain', name: 'Fountain', icon: 'fa-water', rarity: 'decor', kind: 'decor', cost: 150 },
        { key: 'birdhouse', name: 'Birdhouse', icon: 'fa-dove', rarity: 'decor', kind: 'decor', cost: 70 },
        { key: 'compost', name: 'Compost', icon: 'fa-recycle', rarity: 'decor', kind: 'decor', cost: 40 }
    ];

    const RARITY_CONFIG = {
        common: {
            points: 25,
            label: 'Common',
            emoji: '●',
            weight: 0.80
        },

        rare: {
            points: 50,
            label: 'Rare',
            emoji: '◆',
            weight: 0.10
        },

        epic: {
            points: 70,
            label: 'Epic',
            emoji: '✦',
            weight: 0.08
        },

        legendary: {
            points: 100,
            label: 'Legendary',
            emoji: '★',
            weight: 0.02
        },

        decor: {
            points: 0,
            label: 'Decor',
            emoji: '♥',
            weight: 0
        }
    };

    const MAX_SLOTS = 16;

    // =========================================================
    // GAME STATE
    // =========================================================

    let points = 240;
    let score = 0;

    // What is currently displayed in the 16 garden plots.
    let gardenSlots = Array(MAX_SLOTS).fill(null);

    // Everything the player has permanently unlocked.
    let collection = [];

    let latestPlant = null;

    // =========================================================
    // LOGIN / UI STATE
    // =========================================================

    let currentUser = null;
    let authMode = 'login';

    // Currently selected garden plot.
    let selectedSlot = null;

    // all / plant / decor
    let pickerFilter = 'all';

    let saveTimer = null;

    // =========================================================
    // DOM REFERENCES
    // =========================================================

    const $ = id => document.getElementById(id);

    const app = $('app');

    // Login
    const authShell = $('authShell');
    const authForm = $('authForm');
    const authUsername = $('authUsername');
    const authPassword = $('authPassword');
    const authSubmit = $('authSubmit');
    const authError = $('authError');
    const loginTab = $('loginTab');
    const registerTab = $('registerTab');

    // Home
    const homeUsername = $('homeUsername');
    const plotGrid = $('plotGrid');
    const pointDisplay = $('pointDisplay');
    const plantCounter = $('plantCounter');
    const snapButton = $('snapButton');
    const toast = $('toastMessage');

    // Gacha
    const gachaButton = $('gachaButton');
    const gachaResult = $('gachaResult');

    // Profile
    const profileName = $('profileName');
    const profilePlantCount = $('profilePlantCount');
    const profileCollectionCount = $('profileCollectionCount');
    const profileScore = $('profileScore');
    const profileLatestPlant = $('profileLatestPlant');
    const profileLatestRarity = $('profileLatestRarity');
    const logoutButton = $('logoutButton');

    // Friends
    const friendsGrid = $('friendsGrid');
    const emptyFriends = $('emptyFriends');
    const friendSearchInput = $('friendSearchInput');
    const friendSearchButton = $('friendSearchButton');
    const friendSearchResults = $('friendSearchResults');
    const friendRequestsSection = $('friendRequestsSection');
    const friendRequests = $('friendRequests');
    const friendNotification = $('friendNotification');

    // Garden collection picker
    const openCollectionButton = $('openCollectionButton');
    const gardenPickerBackdrop = $('gardenPickerBackdrop');
    const closePickerButton = $('closePickerButton');
    const pickerTitle = $('pickerTitle');
    const pickerSlotNumber = $('pickerSlotNumber');
    const collectionGrid = $('collectionGrid');
    const clearPlotButton = $('clearPlotButton');

    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view-page');

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
        } catch (_) {
            // Ignore JSON parse failures.
        }

        if (!response.ok) {
            const error = new Error(
                body.error ||
                'Something went wrong.'
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

        authShell.classList.remove(
            'hidden'
        );

        app.classList.add(
            'app-locked'
        );

        authUsername.focus();
    }

    function showGame() {
        authShell.classList.add(
            'hidden'
        );

        app.classList.remove(
            'app-locked'
        );
    }

    async function bootstrap() {
        try {
            const data =
                await api('/api/me');

            currentUser =
                data.user;

            loadState(
                data.state
            );

            showGame();

            await loadFriends();

        } catch (error) {
            if (
                error.status !== 401
            ) {
                authError.textContent =
                    'Could not connect to the game server.';
            }

            showAuth();
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

            await api(
                endpoint,
                {
                    method: 'POST',

                    body: JSON.stringify({
                        username:
                            authUsername.value.trim(),

                        password:
                            authPassword.value
                    })
                }
            );

            authPassword.value =
                '';

            await bootstrap();

        } catch (error) {
            authError.textContent =
                error.message;

        } finally {
            authSubmit.disabled =
                false;
        }
    }

    async function logout() {
        try {
            await api(
                '/api/logout',
                {
                    method: 'POST'
                }
            );
        } catch (_) {
            // Continue logout locally.
        }

        closePicker();

        collection = [];

        gardenSlots =
            Array(MAX_SLOTS).fill(
                null
            );

        friendSearchResults.innerHTML =
            '';

        showAuth();
    }

    // =========================================================
    // LOAD / SAVE GAME STATE
    // =========================================================

    function loadState(state) {
        points =
            Number.isFinite(
                state.points
            )
                ? state.points
                : 240;

        score =
            Number.isFinite(
                state.score
            )
                ? state.score
                : 0;

        latestPlant =
            state.latestPlant ||
            null;

        collection =
            Array.isArray(
                state.collection
            )
                ? state.collection.map(
                    item => ({
                        ...item
                    })
                )
                : [];

        gardenSlots =
            Array.isArray(
                state.gardenSlots
            ) &&
            state.gardenSlots.length ===
                MAX_SLOTS

                ? state.gardenSlots.map(
                    item =>
                        item
                            ? { ...item }
                            : null
                )

                : Array(
                    MAX_SLOTS
                ).fill(null);

        renderEverything();
    }

    function scheduleSave() {
        clearTimeout(
            saveTimer
        );

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
            await api(
                '/api/state',
                {
                    method: 'POST',

                    body: JSON.stringify({
                        points,
                        score,
                        latestPlant,
                        gardenSlots,
                        collection
                    })
                }
            );

        } catch (error) {
            if (
                error.status === 401
            ) {
                showAuth();

            } else {
                showToast(
                    'Could not save your garden.',
                    'fa-triangle-exclamation'
                );
            }
        }
    }

    // =========================================================
    // MAIN RENDER
    // =========================================================

    function renderEverything() {
        renderGarden();

        updateStats();

        renderStore();

        if (
            !gardenPickerBackdrop
                .classList
                .contains('hidden')
        ) {
            renderCollectionPicker();
        }
    }

    // =========================================================
    // GARDEN
    // =========================================================

    function renderGarden() {
        plotGrid.innerHTML = '';

        gardenSlots.forEach(
            (item, index) => {

                const plot =
                    document.createElement(
                        'button'
                    );

                plot.type =
                    'button';

                plot.className =
                    `plot ${
                        item
                            ? `filled rarity-${item.rarity} kind-${item.kind}`
                            : 'empty-plot'
                    }`;

                plot.dataset.slot =
                    index;

                plot.setAttribute(
                    'aria-label',

                    item
                        ? `Plot ${index + 1}: ${item.name}`
                        : `Plot ${index + 1}: empty`
                );

                if (item) {
                    plot.innerHTML = `
                        <span class="plot-sparkle"></span>

                        <i class="fas ${escapeClass(item.icon)}"></i>

                        <span class="plant-name">
                            ${escapeHtml(item.name)}
                        </span>

                        <span class="plot-edit">
                            <i class="fas fa-pen"></i>
                        </span>
                    `;

                } else {
                    plot.innerHTML = `
                        <i class="fas fa-plus"></i>

                        <span>
                            plant
                        </span>
                    `;
                }

                plot.addEventListener(
                    'click',
                    () =>
                        openPicker(index)
                );

                plotGrid.appendChild(
                    plot
                );
            }
        );

        const occupied =
            gardenSlots
                .filter(Boolean)
                .length;

        plantCounter.textContent =
            `${occupied} / ${MAX_SLOTS} placed`;
    }

    // =========================================================
    // STATS / PROFILE
    // =========================================================

    function updateStats() {
        pointDisplay.textContent =
            points;

        if (currentUser) {
            profileName.textContent =
                currentUser.username;

            homeUsername.textContent =
                `${currentUser.username}'s`;
        }

        profilePlantCount.textContent =
            gardenSlots
                .filter(Boolean)
                .length;

        profileCollectionCount.textContent =
            collection.length;

        profileScore.textContent =
            score;

        if (latestPlant) {
            const config =
                RARITY_CONFIG[
                    latestPlant.rarity
                ] ||
                RARITY_CONFIG.common;

            profileLatestPlant.textContent =
                latestPlant.name;

            profileLatestRarity.textContent =
                `${config.emoji} ${config.label}`;

            profileLatestRarity.className =
                `latest-rarity rarity-${latestPlant.rarity}`;

        } else {
            profileLatestPlant.textContent =
                '—';

            profileLatestRarity.textContent =
                '—';

            profileLatestRarity.className =
                'latest-rarity';
        }
    }

    // =========================================================
    // TOAST
    // =========================================================

    function showToast(
        message,
        icon = 'fa-leaf'
    ) {
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>
                ${escapeHtml(message)}
            </span>
        `;

        toast.classList.remove(
            'hidden'
        );

        clearTimeout(
            toast._timeout
        );

        toast._timeout =
            setTimeout(
                () =>
                    toast.classList.add(
                        'hidden'
                    ),
                2800
            );
    }

    // =========================================================
    // COLLECTION / GARDEN PICKER
    // =========================================================

    function openPicker(
        slotIndex = null
    ) {
        selectedSlot =
            slotIndex;

        pickerFilter =
            'all';

        gardenPickerBackdrop
            .classList
            .remove('hidden');

        document.body
            .classList
            .add('modal-open');

        document
            .querySelectorAll(
                '.picker-tab'
            )
            .forEach(tab => {

                tab.classList.toggle(
                    'active',
                    tab.dataset.filter ===
                        'all'
                );
            });

        if (
            selectedSlot === null
        ) {
            pickerTitle.innerHTML =
                'Your collection';

            clearPlotButton
                .classList
                .add('hidden');

        } else {
            pickerTitle.innerHTML =
                `Choose for plot <span id="pickerSlotNumber">${selectedSlot + 1}</span>`;

            clearPlotButton
                .classList
                .remove('hidden');
        }

        renderCollectionPicker();
    }

    function closePicker() {
        gardenPickerBackdrop
            .classList
            .add('hidden');

        document.body
            .classList
            .remove('modal-open');

        selectedSlot =
            null;
    }

    function renderCollectionPicker() {
        const unlockedKeys =
            new Set(
                collection.map(
                    item =>
                        item.key
                )
            );

        const allItems = [
            ...PLANT_POOL,
            ...DECOR_POOL
        ].filter(
            item =>
                pickerFilter === 'all' ||
                item.kind === pickerFilter
        );

        collectionGrid.innerHTML =
            '';

        allItems.forEach(
            item => {

                const unlocked =
                    unlockedKeys.has(
                        item.key
                    );

                const selected =
                    selectedSlot !== null &&
                    gardenSlots[
                        selectedSlot
                    ]?.key === item.key;

                const card =
                    document.createElement(
                        'button'
                    );

                card.type =
                    'button';

                card.className =
                    `collection-item rarity-${item.rarity} ${
                        unlocked
                            ? 'unlocked'
                            : 'locked'
                    } ${
                        selected
                            ? 'selected'
                            : ''
                    }`;

                card.disabled =
                    !unlocked;

                card.innerHTML = `
                    <span class="collection-icon">
                        <i class="fas ${
                            unlocked
                                ? escapeClass(item.icon)
                                : 'fa-lock'
                        }"></i>
                    </span>

                    <span class="collection-name">
                        ${escapeHtml(item.name)}
                    </span>

                    <span class="collection-meta">
                        ${
                            unlocked
                                ? (
                                    item.kind === 'decor'
                                        ? 'Owned'
                                        : RARITY_CONFIG[item.rarity].label
                                )
                                : 'Locked'
                        }
                    </span>
                `;

                if (unlocked) {
                    card.addEventListener(
                        'click',
                        () => {

                            // Collection opened independently.
                            if (
                                selectedSlot ===
                                null
                            ) {
                                closePicker();

                                showToast(
                                    `Tap a garden plot to place ${item.name}.`,
                                    'fa-hand-pointer'
                                );

                                return;
                            }

                            const ownedItem =
                                collection.find(
                                    owned =>
                                        owned.key ===
                                        item.key
                                );

                            const slotNumber =
                                selectedSlot +
                                1;

                            gardenSlots[
                                selectedSlot
                            ] = {
                                ...ownedItem
                            };

                            renderEverything();

                            scheduleSave();

                            closePicker();

                            showToast(
                                `${item.name} placed in plot ${slotNumber}.`,
                                'fa-seedling'
                            );
                        }
                    );
                }

                collectionGrid.appendChild(
                    card
                );
            }
        );
    }

    function clearSelectedPlot() {
        if (
            selectedSlot === null
        ) {
            return;
        }

        gardenSlots[
            selectedSlot
        ] = null;

        renderEverything();

        scheduleSave();

        closePicker();

        showToast(
            'Plot cleared. Pick something new whenever you like.',
            'fa-eraser'
        );
    }

    // =========================================================
    // GACHA
    // =========================================================

    function getRandomRarity() {
        const rand =
            Math.random();

        let cumulative = 0;

        for (
            const rarity of [
                'common',
                'rare',
                'epic',
                'legendary'
            ]
        ) {
            cumulative +=
                RARITY_CONFIG[
                    rarity
                ].weight;

            if (
                rand <=
                cumulative
            ) {
                return rarity;
            }
        }

        return 'common';
    }

    function pullGacha() {
        if (
            points < 60
        ) {
            showToast(
                'You need 60 points to open a seed packet.',
                'fa-star'
            );

            return;
        }

        points -= 60;

        const rarity =
            getRandomRarity();

        const pool =
            PLANT_POOL.filter(
                item =>
                    item.rarity ===
                    rarity
            );

        const plant =
            pool[
                Math.floor(
                    Math.random() *
                    pool.length
                )
            ];

        const config =
            RARITY_CONFIG[
                rarity
            ];

        const alreadyUnlocked =
            collection.some(
                item =>
                    item.key ===
                    plant.key
            );

        // Only add it to the permanent collection once.
        if (!alreadyUnlocked) {
            collection.push({
                ...plant
            });
        }

        // Duplicate pulls still give score.
        score +=
            config.points;

        latestPlant = {
            name:
                plant.name,

            rarity:
                plant.rarity
        };

        gachaResult.innerHTML = `
            <div class="result-card rarity-${rarity}">

                <div class="result-burst">
                    ${config.emoji}
                </div>

                <div class="result-icon">
                    <i class="fas ${escapeClass(plant.icon)}"></i>
                </div>

                <div class="result-kicker">
                    ${
                        alreadyUnlocked
                            ? 'You found another'
                            : 'New plant unlocked!'
                    }
                </div>

                <div class="result-name">
                    ${escapeHtml(plant.name)}
                </div>

                <div class="result-rarity">
                    ${config.label}
                </div>

                <div class="result-score">
                    +${config.points} score
                </div>

                <div class="result-note">
                    ${
                        alreadyUnlocked
                            ? 'Already in your collection — score still awarded.'
                            : 'Tap a garden plot on Home to place it.'
                    }
                </div>

            </div>
        `;

        renderEverything();

        scheduleSave();

        showToast(
            alreadyUnlocked
                ? `${plant.name} was already unlocked — +${config.points} score.`
                : `${plant.name} added to your collection!`,

            'fa-gift'
        );
    }

    // =========================================================
    // SNAP
    // =========================================================

    function snapPlant() {
        points += 10;

        updateStats();

        scheduleSave();

        showToast(
            '+10 points for your biodiversity snap!',
            'fa-camera'
        );
    }

    // =========================================================
    // STORE
    // =========================================================

    function renderStore() {
        document
            .querySelectorAll(
                '.store-item'
            )
            .forEach(
                button => {

                    const owned =
                        collection.some(
                            item =>
                                item.key ===
                                button.dataset.key
                        );

                    button.classList.toggle(
                        'owned',
                        owned
                    );

                    const cost =
                        button.querySelector(
                            '.cost'
                        );

                    cost.textContent =
                        owned
                            ? 'Owned ✓'
                            : `${button.dataset.cost} ★`;
                }
            );
    }

    function buyDecor(button) {
        const key =
            button.dataset.key;

        if (
            collection.some(
                item =>
                    item.key === key
            )
        ) {
            showToast(
                'You already own this decoration.',
                'fa-heart'
            );

            return;
        }

        const cost =
            Number(
                button.dataset.cost
            );

        if (
            points < cost
        ) {
            showToast(
                `You need ${cost} points for this decoration.`,
                'fa-star'
            );

            return;
        }

        points -= cost;

        collection.push({
            key,

            name:
                button.dataset.name,

            icon:
                button.dataset.icon,

            rarity:
                'decor',

            kind:
                'decor'
        });

        renderEverything();

        scheduleSave();

        showToast(
            `${button.dataset.name} unlocked! Place it from any garden plot.`,
            'fa-heart'
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
                data.friends ||
                []
            );

            renderFriendRequests(
                data.incoming ||
                []
            );

            updateFriendNotification(
                (
                    data.incoming ||
                    []
                ).length
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

    function updateFriendNotification(
        count
    ) {
        if (
            !friendNotification
        ) {
            return;
        }

        friendNotification.textContent =
            count > 9
                ? '9+'
                : count;

        friendNotification
            .classList
            .toggle(
                'hidden',
                count === 0
            );
    }

    function renderFriendCards(
        friends
    ) {
        friendsGrid.innerHTML =
            '';

        emptyFriends
            .classList
            .toggle(
                'hidden',
                friends.length > 0
            );

        friends.forEach(
            friend => {

                const card =
                    document.createElement(
                        'article'
                    );

                card.className =
                    'friend-card';

                const config =
                    friend.latest_rarity

                        ? (
                            RARITY_CONFIG[
                                friend.latest_rarity
                            ] ||
                            RARITY_CONFIG.common
                        )

                        : null;

                card.innerHTML = `
                    <div class="friend-avatar">
                        <i class="fas fa-seedling"></i>
                    </div>

                    <div class="friend-name">
                        @${escapeHtml(friend.username)}
                    </div>

                    <div class="friend-latest">
                        ${
                            friend.latest_name
                                ? `${config?.emoji || ''} ${escapeHtml(friend.latest_name)}`
                                : 'No discoveries yet'
                        }
                    </div>

                    <div class="friend-stats">
                        <span>
                            <i class="fas fa-trophy"></i>
                            ${friend.score || 0}
                        </span>

                        <span>
                            <i class="fas fa-leaf"></i>
                            ${friend.plant_count || 0}
                        </span>
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
        friendRequests.innerHTML =
            '';

        friendRequestsSection
            .classList
            .toggle(
                'hidden',
                requests.length === 0
            );

        requests.forEach(
            req => {

                const row =
                    document.createElement(
                        'div'
                    );

                row.className =
                    'request-row';

                row.innerHTML = `
                    <div class="request-avatar">
                        <i class="fas fa-seedling"></i>
                    </div>

                    <div class="request-name">
                        @${escapeHtml(req.username)}
                    </div>

                    <button
                        class="friend-action accept-request"
                        data-id="${req.request_id}"
                        type="button"
                    >
                        Accept
                    </button>

                    <button
                        class="friend-action secondary reject-request"
                        data-id="${req.request_id}"
                        type="button"
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
            .forEach(
                btn =>
                    btn.addEventListener(
                        'click',
                        () =>
                            answerFriendRequest(
                                btn.dataset.id,
                                true
                            )
                    )
            );

        document
            .querySelectorAll(
                '.reject-request'
            )
            .forEach(
                btn =>
                    btn.addEventListener(
                        'click',
                        () =>
                            answerFriendRequest(
                                btn.dataset.id,
                                false
                            )
                    )
            );
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
                data.users ||
                []
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }

    function renderSearchResults(
        users
    ) {
        friendSearchResults.innerHTML =
            '';

        if (
            !users.length
        ) {
            friendSearchResults.innerHTML =
                `
                    <div class="empty-inline">
                        No matching gardeners.
                    </div>
                `;

            return;
        }

        users.forEach(
            user => {

                const relation =
                    user.relation || {
                        status:
                            'none'
                    };

                const row =
                    document.createElement(
                        'div'
                    );

                row.className =
                    'user-result';

                let action;

                if (
                    relation.status ===
                    'none'
                ) {
                    action = `
                        <button
                            class="friend-action add-friend"
                            data-id="${user.id}"
                            type="button"
                        >
                            Add
                        </button>
                    `;

                } else if (
                    relation.status ===
                    'incoming'
                ) {
                    action = `
                        <button
                            class="friend-action accept-search"
                            data-request-id="${relation.request_id}"
                            type="button"
                        >
                            Accept
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
                            type="button"
                        >
                            Sent
                        </button>
                    `;

                } else {
                    action = `
                        <button
                            class="friend-action"
                            disabled
                            type="button"
                        >
                            Friends ✓
                        </button>
                    `;
                }

                row.innerHTML = `
                    <div class="request-avatar">
                        <i class="fas fa-seedling"></i>
                    </div>

                    <div class="user-result-name">
                        @${escapeHtml(user.username)}
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
            .forEach(
                btn =>
                    btn.addEventListener(
                        'click',
                        () =>
                            sendFriendRequest(
                                btn.dataset.id
                            )
                    )
            );

        document
            .querySelectorAll(
                '.accept-search'
            )
            .forEach(
                btn =>
                    btn.addEventListener(
                        'click',
                        () =>
                            answerFriendRequest(
                                btn.dataset.requestId,
                                true
                            )
                    )
            );
    }

    async function sendFriendRequest(
        userId
    ) {
        try {
            await api(
                '/api/friends/request',
                {
                    method:
                        'POST',

                    body:
                        JSON.stringify({
                            user_id:
                                Number(
                                    userId
                                )
                        })
                }
            );

            await searchFriends();

            await loadFriends();

            showToast(
                'Friend request sent!',
                'fa-user-plus'
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
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
                    method:
                        'POST',

                    body:
                        JSON.stringify({
                            request_id:
                                Number(
                                    requestId
                                )
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

            showToast(
                accept
                    ? 'You have a new garden buddy!'
                    : 'Request ignored.',

                accept
                    ? 'fa-user-group'
                    : 'fa-check'
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }

    // =========================================================
    // NAVIGATION
    // =========================================================

    function navigateTo(
        viewId
    ) {
        views.forEach(
            view =>
                view.classList.toggle(
                    'active',
                    view.id ===
                        viewId
                )
        );

        navBtns.forEach(
            btn =>
                btn.classList.toggle(
                    'active-tab',
                    btn.dataset.view ===
                        viewId
                )
        );

        if (
            viewId ===
            'friendsView'
        ) {
            loadFriends();
        }

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // =========================================================
    // SECURITY HELPERS
    // =========================================================

    function escapeHtml(
        value
    ) {
        const div =
            document.createElement(
                'div'
            );

        div.textContent =
            String(
                value ?? ''
            );

        return div.innerHTML;
    }

    function escapeClass(
        value
    ) {
        return String(
            value ?? ''
        ).replace(
            /[^A-Za-z0-9_-]/g,
            ''
        );
    }

    // =========================================================
    // EVENTS
    // =========================================================

    function bindEvents() {
        // Login
        authForm.addEventListener(
            'submit',
            submitAuth
        );

        loginTab.addEventListener(
            'click',
            () =>
                setAuthMode(
                    'login'
                )
        );

        registerTab.addEventListener(
            'click',
            () =>
                setAuthMode(
                    'register'
                )
        );

        logoutButton.addEventListener(
            'click',
            logout
        );

        // Home
        snapButton.addEventListener(
            'click',
            snapPlant
        );

        // Gacha
        gachaButton.addEventListener(
            'click',
            pullGacha
        );

        // Navigation
        navBtns.forEach(
            btn =>
                btn.addEventListener(
                    'click',
                    () =>
                        navigateTo(
                            btn.dataset.view
                        )
                )
        );

        // Friend search
        friendSearchButton.addEventListener(
            'click',
            searchFriends
        );

        friendSearchInput.addEventListener(
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

        // Collection
        openCollectionButton.addEventListener(
            'click',
            () =>
                openPicker(null)
        );

        closePickerButton.addEventListener(
            'click',
            closePicker
        );

        clearPlotButton.addEventListener(
            'click',
            clearSelectedPlot
        );

        // Clicking outside the collection card closes it.
        gardenPickerBackdrop.addEventListener(
            'click',
            event => {

                if (
                    event.target ===
                    gardenPickerBackdrop
                ) {
                    closePicker();
                }
            }
        );

        // Escape also closes it.
        document.addEventListener(
            'keydown',
            event => {

                if (
                    event.key ===
                        'Escape' &&
                    !gardenPickerBackdrop
                        .classList
                        .contains(
                            'hidden'
                        )
                ) {
                    closePicker();
                }
            }
        );

        // Collection filters
        document
            .querySelectorAll(
                '.picker-tab'
            )
            .forEach(
                tab => {

                    tab.addEventListener(
                        'click',
                        () => {

                            pickerFilter =
                                tab.dataset.filter;

                            document
                                .querySelectorAll(
                                    '.picker-tab'
                                )
                                .forEach(
                                    other =>
                                        other.classList.toggle(
                                            'active',
                                            other ===
                                                tab
                                        )
                                );

                            renderCollectionPicker();
                        }
                    );
                }
            );

        // Store
        document
            .querySelectorAll(
                '.store-item'
            )
            .forEach(
                button =>
                    button.addEventListener(
                        'click',
                        () =>
                            buyDecor(
                                button
                            )
                    )
            );
    }

    // =========================================================
    // START APP
    // =========================================================

    setAuthMode(
        'login'
    );

    bindEvents();

    bootstrap();

    // Check every 5 seconds for new friend requests so the
    // notification badge updates even while the player is online.
    setInterval(
        () => {

            if (
                currentUser
            ) {
                loadFriends();
            }

        },
        5000
    );

})();