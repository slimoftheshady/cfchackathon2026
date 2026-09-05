(function () {
  const PLANT_POOL = [
      { key: 'kangaroo-paw', name: 'Kangaroo Paw', icon: 'fa-leaf', rarity: 'common', kind: 'plant' },
      { key: 'paper-daisy', name: 'Paper Daisy', icon: 'fa-leaf', rarity: 'common', kind: 'plant' },
      { key: 'pigface', name: 'Pigface', icon: 'fa-leaf', rarity: 'common', kind: 'plant' },
      { key: 'fringe-lily', name: 'Fringe Lily', icon: 'fa-leaf', rarity: 'common', kind: 'plant' },
      { key: 'blue-leschenaultia', name: 'Blue Leschenaultia', icon: 'fa-seedling', rarity: 'rare', kind: 'plant' },
      { key: 'featherflower', name: 'Featherflower', icon: 'fa-seedling', rarity: 'rare', kind: 'plant' },
      { key: 'cowslip-orchid', name: 'Cowslip Orchid', icon: 'fa-seedling', rarity: 'rare', kind: 'plant' },
      { key: 'donkey-orchid', name: 'Donkey Orchid', icon: 'fa-seedling', rarity: 'rare', kind: 'plant' },
      { key: 'qualup-bell', name: 'Qualup Bell', icon: 'fa-cannabis', rarity: 'epic', kind: 'plant' },
      { key: 'wreath-flower', name: 'Wreath Flower', icon: 'fa-cannabis', rarity: 'epic', kind: 'plant' },
      { key: 'spider-orchid', name: 'Spider Orchid', icon: 'fa-cannabis', rarity: 'epic', kind: 'plant' },
      { key: 'pixie-mops', name: 'Pixie Mops', icon: 'fa-cannabis', rarity: 'epic', kind: 'plant' },
      { key: 'rhizanthella-gardneri', name: 'Rhizanthella Gardneri', icon: 'fa-clover', rarity: 'legendary', kind: 'plant' },
      { key: 'drakaea', name: 'Drakaea', icon: 'fa-clover', rarity: 'legendary', kind: 'plant' },
      { key: 'queen-of-sheba', name: 'Queen of Sheba Orchid', icon: 'fa-clover', rarity: 'legendary', kind: 'plant' },
      { key: 'custard-orchid', name: 'Custard Orchid', icon: 'fa-clover', rarity: 'legendary', kind: 'plant' }
  ];

    const PLANT_INFO = {
        'kangaroo-paw': 'Western Australia\u2019s floral emblem. Its velvety, paw-shaped flowers are a favourite feeding stop for honeyeaters and other nectar-loving birds.',
        'paper-daisy': 'A papery-petalled everlasting that carpets the bush in white, pink and yellow after good rains, holding its colour long after picking.',
        'pigface': 'A hardy, succulent groundcover found on coastal dunes, with bright pink-purple daisy-like flowers that open wide in the sun.',
        'fringe-lily': 'A delicate woodland wildflower with fine, fringed purple-blue petals that tremble in the slightest breeze.',
        'blue-leschenaultia': 'One of the most vividly blue wildflowers in the southwest, often stopping bushwalkers in their tracks each spring.',
        'featherflower': 'Named for its soft, feathery clusters of blooms, this heathland shrub is a standout in WA\u2019s wildflower displays.',
        'cowslip-orchid': 'A cheerful yellow-green ground orchid with maroon markings, among the first orchids to appear each spring.',
        'donkey-orchid': 'Named for its two upright, donkey-ear-like petals, this ground orchid is a common and welcome sign that spring has arrived.',
        'qualup-bell': 'A striking bell-shaped flower found only in a small pocket of the southwest, prized by collectors for its rarity.',
        'wreath-flower': 'Grows in a near-perfect ring of pink and white blossom around a bare centre, a wildflower found almost nowhere else on Earth.',
        'spider-orchid': 'An orchid with long, spindly petals that mimic an insect, luring in the very pollinators it needs to reproduce.',
        'pixie-mops': 'A shrub topped with fluffy, mop-like flower heads in soft pink and cream, adding texture to sandplain heathland.',
        'rhizanthella-gardneri': 'The Western Underground Orchid spends its entire life beneath the soil and never sees daylight \u2014 one of the rarest plants on Earth.',
        'drakaea': 'The Hammer Orchid disguises itself as a female wasp, tricking male wasps into pollinating it as they attempt to mate.',
        'queen-of-sheba': 'Widely considered one of the most beautifully patterned orchids in the world, its rarity makes every sighting a treasured find.',
        'custard-orchid': 'A softly coloured, custard-hued orchid tucked away in sheltered bushland, rarely seen and highly sought after.'
    };

    function plantImagePath(
        name
    ) {
        return `images/${
            String(name ?? '')
                .toLowerCase()
                .replace(/\s+/g, '')
        }.jpg`;
    }

    const DECOR_POOL = [
        { key: 'echidna', name: 'Echidna', icon: 'icons/echidna.svg', rarity: 'decor', kind: 'decor', cost: 80 },
        { key: 'wombat', name: 'Wombat', icon: 'icons/wombat.svg', rarity: 'decor', kind: 'decor', cost: 120 },
        { key: 'emu', name: 'Emu', icon: 'icons/emu.svg', rarity: 'decor', kind: 'decor', cost: 100 },
        { key: 'kangaroo', name: 'Kangaroo', icon: 'icons/kangaroo.svg', rarity: 'decor', kind: 'decor', cost: 150 },
        { key: 'cockatoo', name: 'Cockatoo', icon: 'icons/cockatoo.svg', rarity: 'decor', kind: 'decor', cost: 60 }
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
    let score = 245;

    // What is currently displayed in the 16 garden plots.
    let gardenSlots = Array(MAX_SLOTS).fill(null);

    // Everything the player has permanently unlocked.
    let collection = [];

    let latestPlant = null;
    let achievements = [];

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
    // CAMERA STATE
    // =========================================================

    let cameraStream = null;

    let cameraFacingMode =
        'environment';

    let capturedImageData = null;

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
    const authRoleWrap = $('authRoleWrap');
    const authRole = $('authRole');
    const teacherCodeWrap = $('teacherCodeWrap');
    const authTeacherCode = $('authTeacherCode');
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
    const profileRole = $('profileRole');
    const profilePlantCount = $('profilePlantCount');
    const profileCollectionCount = $('profileCollectionCount');
    const profileScore = $('profileScore');
    const profileAchievements = $('profileAchievements');
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
    const wikiList = $('wikiList');
    const clearPlotButton = $('clearPlotButton');

    // Classrooms / RBAC
    const classroomNavButton = $('classroomNavButton');
    const bottomNav = document.querySelector('.bottom-nav');
    const classroomPageTitle = $('classroomPageTitle');
    const classroomPageSubtitle = $('classroomPageSubtitle');
    const teacherClassroomTools = $('teacherClassroomTools');
    const newClassroomName = $('newClassroomName');
    const createClassroomButton = $('createClassroomButton');
    const classroomList = $('classroomList');
    const classroomEmpty = $('classroomEmpty');
    const classroomEmptyText = $('classroomEmptyText');
    const classroomDetail = $('classroomDetail');
    let activeClassroomId = null;
    // Achievements
    const achievementsGrid = $('achievementsGrid');
    const achievementTotal = $('achievementTotal');
    const achievementPoints = $('achievementPoints');

    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view-page');
    const menuToggleButton = $('menuToggleButton');
    const menuCloseButton = $('menuCloseButton');
    const sideMenu = $('sideMenu');
    const sideMenuOverlay = $('sideMenuOverlay');

    // Camera
    const cameraBackdrop =
        $('cameraBackdrop');

    const cameraVideo =
        $('cameraVideo');

    const cameraCanvas =
        $('cameraCanvas');

    const capturedPhoto =
        $('capturedPhoto');

    const cameraStatus =
        $('cameraStatus');

    const cameraIdentification =
        $('cameraIdentification');

    const identifiedPlantName =
        $('identifiedPlantName');

    const identifiedPlantDetails =
        $('identifiedPlantDetails');

    const closeCameraButton =
        $('closeCameraButton');

    const switchCameraButton =
        $('switchCameraButton');

    const capturePhotoButton =
        $('capturePhotoButton');

    const retakePhotoButton =
        $('retakePhotoButton');

    const usePhotoButton =
        $('usePhotoButton');

    const liveCameraControls =
        $('liveCameraControls');

    const photoConfirmControls =
        $('photoConfirmControls');

    // =========================================================
    // API HELPER
    // =========================================================

    async function api(url, options = {}) {
        const response = await fetch(url, {
            credentials: 'same-origin',

            headers: options.body instanceof FormData
                ? (options.headers || {})
                : {
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

        authPassword.minLength =
            registering
                ? 8
                : 1;

        authRoleWrap.classList.toggle('hidden', !registering);

        if (!registering) {
            teacherCodeWrap.classList.add('hidden');
            authTeacherCode.value = '';
        } else {
            updateTeacherCodeVisibility();
        }

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

    function updateTeacherCodeVisibility() {
        const showTeacherCode =
            authMode === 'register' &&
            authRole.value === 'teacher';

        teacherCodeWrap.classList.toggle(
            'hidden',
            !showTeacherCode
        );

        authTeacherCode.required =
            showTeacherCode;
    }

    function configureRoleUI() {
        const role =
            currentUser?.role ||
            'generic';

        const labels = {
            generic: 'Individual',
            student: 'Student / Group',
            teacher: 'Teacher / Admin'
        };

        profileRole.textContent =
            labels[role] ||
            'Individual';

        const hasClassroom =
            role === 'student' ||
            role === 'teacher';

        classroomNavButton.classList.toggle(
            'hidden',
            !hasClassroom
        );

        sideMenu.classList.toggle(
            'has-classroom',
            hasClassroom
        );

        teacherClassroomTools.classList.toggle(
            'hidden',
            role !== 'teacher'
        );

        classroomPageTitle.textContent =
            role === 'teacher'
                ? 'Classrooms'
                : 'My class';

        classroomPageSubtitle.textContent =
            role === 'teacher'
                ? 'Set quests, manage students and follow class progress.'
                : 'Complete your quests and see how your class is progressing.';

        classroomEmptyText.textContent =
            role === 'teacher'
                ? 'Create a classroom above, then add student accounts.'
                : 'Your teacher will add your student account to a classroom.';
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

            configureRoleUI();
            showGame();

            await loadFriends();
            await loadAchievements();

            if (currentUser.role !== 'generic') {
                await loadClassrooms();
            }

        } catch (error) {
            if (error.status === 401) {
                authError.textContent = '';
            } else {
                authError.textContent =
                    error.message ||
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
                            authPassword.value,

                        ...(authMode === 'register'
                            ? {
                                role: authRole.value,
                                teacher_code: authTeacherCode.value
                            }
                            : {})
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
            const data = await api(
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

            // Check for newly unlocked achievements
            if (data.new_achievements && data.new_achievements.length > 0) {
                for (const key of data.new_achievements) {
                    const ach = ACHIEVEMENTS[key];
                    if (ach) {
                        showToast(
                            `🏆 Achievement unlocked: ${ach.name}! +${ach.points} points!`,
                            'fa-trophy'
                        );
                    }
                }
                await loadAchievements();
            }

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
                    `plot ${item
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

                        ${renderIcon(item.icon)}

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

        if (profileAchievements) {
            const completed = achievements.filter(a => a.completed).length;
            profileAchievements.textContent = completed;
        }

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

    function renderWiki() {
        wikiList.innerHTML = PLANT_POOL.map(
            plant => `
                <div class="wiki-card">
                    <img
                        class="wiki-image"
                        src="${escapeHtml(plantImagePath(plant.name))}"
                        alt="${escapeHtml(plant.name)}"
                        loading="lazy"
                    >

                    <div class="wiki-details">
                        <div class="wiki-details-top">
                            <span class="wiki-name">${escapeHtml(plant.name)}</span>
                            <span class="wiki-rarity rarity-${escapeClass(plant.rarity)}">
                                ${escapeHtml(RARITY_CONFIG[plant.rarity].label)}
                            </span>
                        </div>
                        <p class="wiki-description">
                            ${escapeHtml(PLANT_INFO[plant.key] || '')}
                        </p>
                    </div>
                </div>
            `
        ).join('');
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
                    `collection-item rarity-${item.rarity} ${unlocked
                        ? 'unlocked'
                        : 'locked'
                    } ${selected
                        ? 'selected'
                        : ''
                    }`;

                card.disabled =
                    !unlocked;

                card.innerHTML = `
                    <span class="collection-icon">
                        ${
                            unlocked
                                ? renderIcon(item.icon)
                                : '<i class="fas fa-lock"></i>'
                        }
                    </span>

                    <span class="collection-name">
                        ${escapeHtml(item.name)}
                    </span>

                    <span class="collection-meta">
                        ${unlocked
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
                    ${renderIcon(plant.icon)}
                </div>

                <div class="result-kicker">
                    ${alreadyUnlocked
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
                    ${alreadyUnlocked
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
        openCamera();
    }

    // =========================================================
    // CAMERA
    // =========================================================

    async function openCamera() {

        cameraBackdrop
            .classList
            .remove('hidden');

        document.body
            .classList
            .add('modal-open');

        resetCameraView();

        await startCamera();
    }


    async function startCamera() {

        cameraStatus
            .classList
            .add('hidden');

        /*
            Camera access only works if the browser
            supports getUserMedia.
        */

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            showCameraError(
                'Camera access is not supported in this browser.'
            );

            return;
        }


        /*
            Stop any camera that might already
            be running before starting another.
        */

        stopCamera();


        try {

            cameraStream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {

                            /*
                                environment = rear camera
                                user = selfie camera
                            */

                            facingMode: {
                                ideal:
                                    cameraFacingMode
                            },

                            width: {
                                ideal: 1280
                            },

                            height: {
                                ideal: 720
                            }

                        },

                        // We do not need the microphone.
                        audio: false
                    });


            cameraVideo.srcObject =
                cameraStream;


            await cameraVideo.play();


        } catch (error) {

            console.error(
                'Camera error:',
                error
            );


            if (
                error.name ===
                'NotAllowedError'
            ) {

                showCameraError(
                    'Camera permission was denied. Please allow camera access in your browser settings.'
                );

            } else if (
                error.name ===
                'NotFoundError'
            ) {

                showCameraError(
                    'No camera was found on this device.'
                );

            } else {

                showCameraError(
                    'GardenQuest could not open the camera.'
                );

            }
        }
    }


    function stopCamera() {

        if (!cameraStream) {
            return;
        }


        cameraStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );


        cameraStream =
            null;


        cameraVideo.srcObject =
            null;
    }


    function capturePhoto() {

        /*
            We need an active video frame before
            attempting to capture anything.
        */

        if (
            !cameraVideo.videoWidth ||
            !cameraVideo.videoHeight
        ) {

            showCameraError(
                'The camera is still starting. Try again in a moment.'
            );

            return;
        }


        const width =
            cameraVideo.videoWidth;

        const height =
            cameraVideo.videoHeight;


        cameraCanvas.width =
            width;

        cameraCanvas.height =
            height;


        const context =
            cameraCanvas.getContext(
                '2d'
            );


        /*
            Copy the current video frame
            into the hidden canvas.
        */

        context.drawImage(
            cameraVideo,
            0,
            0,
            width,
            height
        );


        /*
            Convert it into a JPEG image.
    
            This remains in the browser.
            It is NOT uploaded anywhere.
        */

        capturedImageData =
            cameraCanvas.toDataURL(
                'image/jpeg',
                0.9
            );


        capturedPhoto.src =
            capturedImageData;


        capturedPhoto
            .classList
            .remove('hidden');


        cameraVideo
            .classList
            .add('hidden');


        liveCameraControls
            .classList
            .add('hidden');


        photoConfirmControls
            .classList
            .remove('hidden');


        /*
            Turn the physical camera off after
            capturing the frame.
        */

        stopCamera();
    }


    async function retakePhoto() {

        capturedImageData =
            null;

        cameraIdentification
            .classList
            .add('hidden');

        identifiedPlantName.textContent =
            '';

        identifiedPlantDetails.textContent =
            '';

        cameraStatus
            .classList
            .add('hidden');

        usePhotoButton.disabled =
            false;

        usePhotoButton.innerHTML =
            '<i class="fas fa-check"></i> Use photo <span>+10 ★</span>';


        capturedPhoto.src =
            '';


        capturedPhoto
            .classList
            .add('hidden');


        cameraVideo
            .classList
            .remove('hidden');


        photoConfirmControls
            .classList
            .add('hidden');


        liveCameraControls
            .classList
            .remove('hidden');


        await startCamera();
    }


    async function switchCamera() {

        /*
            Toggle between phone back/front camera.
        */

        cameraFacingMode =
            cameraFacingMode ===
                'environment'

                ? 'user'

                : 'environment';


        await startCamera();
    }


    async function useCapturedPhoto() {
        if (!capturedImageData) {
            return;
        }

        usePhotoButton.disabled = true;
        cameraStatus.textContent = 'Identifying your plant...';
        cameraStatus.classList.remove('hidden');

        try {
            const imageBlob = await fetch(capturedImageData).then(response => response.blob());
            const formData = new FormData();
            formData.append('image', imageBlob, 'gardenquest-snap.jpg');

            const data = await api('/api/identify', {
                method: 'POST',
                body: formData
            });
            const identification = data.identification;

            identifiedPlantName.textContent = identification.common_name || identification.scientific_name;
            identifiedPlantDetails.textContent = identification.common_name
                ? identification.scientific_name
                : 'PlantNet match';
            cameraIdentification.classList.remove('hidden');
            cameraStatus.classList.add('hidden');

            points += 10;
            updateStats();
            scheduleSave();
            usePhotoButton.innerHTML = '<i class="fas fa-check"></i> Identified <span>+10 ★</span>';
            showToast(`Identified as ${identification.common_name || identification.scientific_name}! +10 points.`, 'fa-leaf');
            
            // Reload achievements after snap
            await loadAchievements();
        } catch (error) {
            usePhotoButton.disabled = false;
            showCameraError(error.message);
        }
    }


    function closeCamera() {

        stopCamera();


        cameraBackdrop
            .classList
            .add('hidden');


        /*
            Only remove modal-open if another
            modal is not already open.
        */

        if (
            gardenPickerBackdrop
                .classList
                .contains('hidden') &&

            friendVisitBackdrop
                .classList
                .contains('hidden')
        ) {

            document.body
                .classList
                .remove('modal-open');
        }


        resetCameraView();
    }


    function resetCameraView() {

        capturedImageData =
            null;


        capturedPhoto.src =
            '';


        capturedPhoto
            .classList
            .add('hidden');


        cameraVideo
            .classList
            .remove('hidden');


        liveCameraControls
            .classList
            .remove('hidden');


        photoConfirmControls
            .classList
            .add('hidden');


        cameraStatus
            .classList
            .add('hidden');

        cameraIdentification.classList.add('hidden');
        identifiedPlantName.textContent = '';
        identifiedPlantDetails.textContent = '';
        usePhotoButton.disabled = false;
        usePhotoButton.innerHTML = '<i class="fas fa-check"></i> Use photo <span>+10 ★</span>';
    }


    function showCameraError(
        message
    ) {

        cameraStatus.textContent =
            message;


        cameraStatus
            .classList
            .remove('hidden');
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

                card.tabIndex =
                    0;

                card.setAttribute(
                    'role',
                    'button'
                );

                card.setAttribute(
                    'aria-label',
                    `Visit ${friend.username}'s garden`
                );

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

                    ${friend.latest_name

                        ? `
                                ${config?.emoji || ''}
                                ${escapeHtml(friend.latest_name)}
                            `

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


                <div class="visit-garden-link">

                    <span>
                        Visit garden
                    </span>

                    <i class="fas fa-arrow-right"></i>

                </div>
            `;


                const visit = () => {

                    openFriendGarden(
                        friend.id
                    );

                };


                card.addEventListener(
                    'click',
                    visit
                );


                // Also makes it keyboard accessible.
                card.addEventListener(
                    'keydown',
                    event => {

                        if (
                            event.key === 'Enter' ||
                            event.key === ' '
                        ) {
                            event.preventDefault();

                            visit();
                        }

                    }
                );


                friendsGrid.appendChild(
                    card
                );

            }
        );
    }

    async function openFriendGarden(
        friendId
    ) {
        try {

            const data =
                await api(
                    `/api/friends/${Number(friendId)}/profile`
                );

            renderFriendGarden(
                data
            );

            friendVisitBackdrop
                .classList
                .remove(
                    'hidden'
                );

            document.body
                .classList
                .add(
                    'modal-open'
                );

        } catch (error) {

            showToast(
                error.message,
                'fa-triangle-exclamation'
            );

        }
    }


    function closeFriendGarden() {

        friendVisitBackdrop
            .classList
            .add(
                'hidden'
            );

        // Don't remove modal-open if the garden picker
        // happens to still be open.
        if (
            gardenPickerBackdrop
                .classList
                .contains(
                    'hidden'
                )
        ) {

            document.body
                .classList
                .remove(
                    'modal-open'
                );

        }
    }


    function renderFriendGarden(
        data
    ) {

        const friend =
            data.user;

        const profile =
            data.profile || {};

        const slots =
            Array.isArray(
                profile.gardenSlots
            )

                ? profile.gardenSlots

                : Array(
                    MAX_SLOTS
                ).fill(
                    null
                );


        // FRIEND NAME

        friendVisitName.textContent =
            `@${friend.username}'s garden`;


        // STATS

        friendVisitPlaced.textContent =
            profile.placedCount ||
            0;

        friendVisitUnlocked.textContent =
            profile.collectionCount ||
            0;

        friendVisitScore.textContent =
            profile.score ||
            0;


        // LATEST PLANT

        if (
            profile.latestPlant
        ) {

            const config =
                RARITY_CONFIG[
                profile.latestPlant.rarity
                ] ||
                RARITY_CONFIG.common;

            friendVisitLatest.textContent =
                `${config.emoji} ${profile.latestPlant.name}`;

        } else {

            friendVisitLatest.textContent =
                '—';

        }


        // RENDER THE 16 GARDEN PLOTS

        friendVisitGrid.innerHTML =
            '';


        for (
            let index = 0;
            index < MAX_SLOTS;
            index += 1
        ) {

            const item =
                slots[index] ||
                null;


            const plot =
                document.createElement(
                    'div'
                );


            plot.className =
                `friend-visit-plot ${item

                    ? `
                        filled
                        rarity-${item.rarity}
                        kind-${item.kind}
                    `

                    : 'empty'
                }`;


            if (
                item
            ) {

                plot.innerHTML = `

                <span class="plot-sparkle"></span>

                ${renderIcon(item.icon)}

                <span class="plant-name">
                    ${escapeHtml(item.name)}
                </span>

            `;

            } else {

                plot.innerHTML = `

                <i class="fas fa-seedling"></i>

                <span class="plant-name">
                    empty
                </span>

            `;

            }


            friendVisitGrid
                .appendChild(
                    plot
                );

        }
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
    // CLASSROOMS / RBAC
    // =========================================================

    async function loadClassrooms() {
        if (!currentUser || currentUser.role === 'generic') {
            return;
        }

        try {
            const data = await api('/api/classrooms');
            renderClassroomList(data.classrooms || []);
        } catch (error) {
            showToast(error.message, 'fa-triangle-exclamation');
        }
    }

    function renderClassroomList(classrooms) {
        classroomList.innerHTML = '';

        classroomEmpty.classList.toggle(
            'hidden',
            classrooms.length !== 0
        );

        classrooms.forEach(classroom => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className =
                `classroom-card${String(classroom.id) === String(activeClassroomId) ? ' active' : ''}`;

            const meta =
                currentUser.role === 'teacher'
                    ? `${classroom.student_count || 0} students`
                    : `${classroom.teacher_username ? `@${escapeHtml(classroom.teacher_username)} · ` : ''}${classroom.student_count || 0} students`;

            button.innerHTML = `
                <span class="classroom-card-icon">
                    <i class="fas fa-school"></i>
                </span>
                <span class="classroom-card-copy">
                    <strong>${escapeHtml(classroom.name)}</strong>
                    <small>${meta}</small>
                </span>
                <i class="fas fa-chevron-right"></i>
            `;

            button.addEventListener(
                'click',
                () => openClassroom(classroom.id)
            );

            classroomList.appendChild(button);
        });

        if (
            activeClassroomId &&
            !classrooms.some(
                classroom =>
                    String(classroom.id) ===
                    String(activeClassroomId)
            )
        ) {
            activeClassroomId = null;
            classroomDetail.classList.add('hidden');
        }
    }

    async function createClassroom() {
        const name =
            newClassroomName.value.trim();

        if (name.length < 2) {
            showToast(
                'Enter a classroom name.',
                'fa-school'
            );
            return;
        }

        try {
            const data = await api(
                '/api/classrooms',
                {
                    method: 'POST',
                    body: JSON.stringify({ name })
                }
            );

            newClassroomName.value = '';
            activeClassroomId =
                data.classroom_id;

            await loadClassrooms();
            await openClassroom(
                activeClassroomId
            );

            showToast(
                'Classroom created.',
                'fa-school'
            );
        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }

    async function openClassroom(classroomId) {
        activeClassroomId =
            Number(classroomId);

        try {
            const data = await api(
                `/api/classrooms/${activeClassroomId}`
            );

            renderClassroomDetail(data);
            await loadClassrooms();

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }

    function questTargetLabel(quest) {
        const labels = {
            manual: 'Teacher-set task',
            score: `Reach ${quest.target_value} score`,
            points: `Have ${quest.target_value} points`,
            collection: `Unlock ${quest.target_value} items`,
            placed: `Place ${quest.target_value} garden items`,
            snaps: `Identify ${quest.target_value} plants`
        };

        return labels[quest.target_type] ||
            'Quest';
    }

    function renderLeaderboard(rows) {
        if (!rows.length) {
            return `
                <div class="empty-inline">
                    No students in this class yet.
                </div>
            `;
        }

        return `
            <div class="leaderboard">
                ${rows.map((row, index) => `
                    <div class="leaderboard-row">
                        <span class="leaderboard-rank">${index + 1}</span>
                        <span class="leaderboard-name">@${escapeHtml(row.username)}</span>
                        <strong>${Number(row.score || 0)} pts</strong>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderClassroomDetail(data) {
        const classroom =
            data.classroom;

        const isTeacher =
            data.viewer_role ===
            'teacher';

        const leaderboard =
            data.leaderboard || [];

        const quests =
            data.quests || [];

        classroomDetail.classList.remove(
            'hidden'
        );

        classroomDetail.innerHTML = `
            <div class="class-detail-head">
                <button class="class-back-btn" id="closeClassroomDetailButton" type="button">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <div>
                    <div class="eyebrow">${isTeacher ? 'TEACHER VIEW' : 'CLASSROOM'}</div>
                    <h2>${escapeHtml(classroom.name)}</h2>
                    <p>${isTeacher ? 'Manage this classroom.' : `Teacher: @${escapeHtml(classroom.teacher_username)}`}</p>
                </div>
            </div>

            ${isTeacher ? teacherClassroomMarkup(data) : studentClassroomMarkup(data)}

            <div class="class-card">
                <div class="section-title">Class leaderboard</div>
                ${renderLeaderboard(leaderboard)}
            </div>

            <div class="class-card">
                <div class="section-title">Quests</div>
                <div id="classQuestList">
                    ${quests.length
                        ? quests.map(
                            quest =>
                                isTeacher
                                    ? teacherQuestMarkup(quest)
                                    : studentQuestMarkup(quest)
                        ).join('')
                        : '<div class="empty-inline">No active quests yet.</div>'
                    }
                </div>
            </div>
        `;

        bindClassroomDetailEvents(
            data
        );
    }

    function teacherClassroomMarkup(data) {
        const roster =
            data.roster || [];

        return `
            <div class="class-card">
                <div class="section-title">Add a student</div>
                <div class="class-inline-form">
                    <input id="classStudentSearchInput" type="search" maxlength="20" placeholder="Search student username">
                    <button class="soft-btn" id="classStudentSearchButton" type="button">
                        <i class="fas fa-search"></i> Search
                    </button>
                </div>
                <div id="classStudentSearchResults" class="class-search-results"></div>
            </div>

            <div class="class-card">
                <div class="section-title">Students</div>
                <div class="class-roster">
                    ${roster.length
                        ? roster.map(student => `
                            <div class="class-roster-row">
                                <div>
                                    <strong>@${escapeHtml(student.username)}</strong>
                                    <small>${student.score || 0} score · ${student.snaps_completed || 0} snaps</small>
                                </div>
                                <button class="friend-action secondary remove-class-student"
                                    data-student-id="${student.id}" type="button">
                                    Remove
                                </button>
                            </div>
                        `).join('')
                        : '<div class="empty-inline">No students yet. Search for a student account above.</div>'
                    }
                </div>
            </div>

            <div class="class-card">
                <div class="section-title">Create a quest</div>
                <div class="quest-form">
                    <input id="questTitleInput" maxlength="80" placeholder="Quest title">
                    <textarea id="questDescriptionInput" maxlength="400"
                        placeholder="Instructions for students"></textarea>
                    <div class="quest-form-grid">
                        <select id="questTargetType">
                            <option value="manual">Manual task</option>
                            <option value="snaps">Plant identifications</option>
                            <option value="score">Score target</option>
                            <option value="points">Points target</option>
                            <option value="collection">Collection size</option>
                            <option value="placed">Garden items placed</option>
                        </select>
                        <input id="questTargetValue" type="number" min="1" value="1" placeholder="Target">
                    </div>
                    <input id="questDueDate" type="date">
                    <button class="primary-btn full-width" id="createQuestButton" type="button">
                        <i class="fas fa-flag-checkered"></i> Assign quest
                    </button>
                </div>
            </div>
        `;
    }

    function studentClassroomMarkup(data) {
        const me =
            (data.leaderboard || []).find(
                row =>
                    Number(row.id) ===
                    Number(currentUser.id)
            );

        return `
            <div class="class-card class-my-progress">
                <div>
                    <span>My class score</span>
                    <strong>${me ? Number(me.score || 0) : 0}</strong>
                </div>
                <div>
                    <span>Plant snaps</span>
                    <strong>${me ? Number(me.snaps_completed || 0) : 0}</strong>
                </div>
                <div>
                    <span>Unlocked</span>
                    <strong>${me ? Number(me.collection_count || 0) : 0}</strong>
                </div>
            </div>
        `;
    }

    function teacherQuestMarkup(quest) {
        return `
            <div class="quest-card">
                <div class="quest-card-top">
                    <div>
                        <strong>${escapeHtml(quest.title)}</strong>
                        <small>${escapeHtml(questTargetLabel(quest))}</small>
                    </div>
                    <button class="icon-btn delete-class-quest"
                        data-quest-id="${quest.id}" type="button" aria-label="Delete quest">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ${quest.description
                    ? `<p>${escapeHtml(quest.description)}</p>`
                    : ''
                }
                <div class="quest-status-line">
                    <span>${quest.completed_count || 0} / ${quest.student_count || 0} completed</span>
                    ${quest.due_at ? `<span>Due ${escapeHtml(quest.due_at)}</span>` : ''}
                </div>
            </div>
        `;
    }

    function studentQuestMarkup(quest) {
        const progress =
            quest.progress || {
                current: 0,
                target: quest.target_value || 1,
                percent: 0,
                completed: false
            };

        return `
            <div class="quest-card ${progress.completed ? 'quest-complete' : ''}">
                <div class="quest-card-top">
                    <div>
                        <strong>${escapeHtml(quest.title)}</strong>
                        <small>${escapeHtml(questTargetLabel(quest))}</small>
                    </div>
                    <span class="quest-status-badge">
                        ${progress.completed ? 'Complete ✓' : `${progress.current}/${progress.target}`}
                    </span>
                </div>
                ${quest.description
                    ? `<p>${escapeHtml(quest.description)}</p>`
                    : ''
                }
                <div class="quest-progress-track">
                    <span style="width:${Math.max(0, Math.min(100, Number(progress.percent || 0)))}%"></span>
                </div>
                <div class="quest-status-line">
                    ${quest.due_at ? `<span>Due ${escapeHtml(quest.due_at)}</span>` : '<span>No due date</span>'}
                    ${quest.target_type === 'manual' && !progress.completed
                        ? `<button class="friend-action complete-manual-quest"
                            data-quest-id="${quest.id}" type="button">Mark done</button>`
                        : ''
                    }
                </div>
            </div>
        `;
    }

    function bindClassroomDetailEvents(data) {
        const closeButton =
            $('closeClassroomDetailButton');

        closeButton?.addEventListener(
            'click',
            () => {
                activeClassroomId = null;
                classroomDetail.classList.add('hidden');
                loadClassrooms();
            }
        );

        if (data.viewer_role === 'teacher') {
            const searchButton =
                $('classStudentSearchButton');

            const searchInput =
                $('classStudentSearchInput');

            searchButton?.addEventListener(
                'click',
                searchStudentsForClassroom
            );

            searchInput?.addEventListener(
                'keydown',
                event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        searchStudentsForClassroom();
                    }
                }
            );

            document
                .querySelectorAll('.remove-class-student')
                .forEach(button =>
                    button.addEventListener(
                        'click',
                        () =>
                            removeStudentFromClassroom(
                                button.dataset.studentId
                            )
                    )
                );

            $('questTargetType')?.addEventListener(
                'change',
                updateQuestTargetControl
            );

            $('createQuestButton')?.addEventListener(
                'click',
                createQuest
            );

            document
                .querySelectorAll('.delete-class-quest')
                .forEach(button =>
                    button.addEventListener(
                        'click',
                        () =>
                            deleteQuest(
                                button.dataset.questId
                            )
                    )
                );

            updateQuestTargetControl();
        } else {
            document
                .querySelectorAll('.complete-manual-quest')
                .forEach(button =>
                    button.addEventListener(
                        'click',
                        () =>
                            completeManualQuest(
                                button.dataset.questId
                            )
                    )
                );
        }
    }

    async function searchStudentsForClassroom() {
        const input =
            $('classStudentSearchInput');

        const results =
            $('classStudentSearchResults');

        const query =
            input?.value.trim() || '';

        if (query.length < 2) {
            if (results) {
                results.innerHTML = '';
            }
            return;
        }

        try {
            const data = await api(
                `/api/classrooms/${activeClassroomId}/students/search?q=${encodeURIComponent(query)}`
            );

            if (!results) {
                return;
            }

            results.innerHTML =
                data.students.length
                    ? data.students.map(student => `
                        <div class="user-result">
                            <div class="user-result-name">@${escapeHtml(student.username)}</div>
                            <button class="friend-action add-class-student"
                                data-student-id="${student.id}" type="button">Add</button>
                        </div>
                    `).join('')
                    : '<div class="empty-inline">No matching student accounts.</div>';

            results
                .querySelectorAll('.add-class-student')
                .forEach(button =>
                    button.addEventListener(
                        'click',
                        () =>
                            addStudentToClassroom(
                                button.dataset.studentId
                            )
                    )
                );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }

    async function addStudentToClassroom(studentId) {
        try {
            await api(
                `/api/classrooms/${activeClassroomId}/students`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        student_id: Number(studentId)
                    })
                }
            );

            showToast(
                'Student added to class.',
                'fa-user-plus'
            );

            await openClassroom(
                activeClassroomId
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }

    async function removeStudentFromClassroom(studentId) {
        try {
            await api(
                `/api/classrooms/${activeClassroomId}/students/${studentId}`,
                {
                    method: 'DELETE'
                }
            );

            showToast(
                'Student removed.',
                'fa-user-minus'
            );

            await openClassroom(
                activeClassroomId
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }

    function updateQuestTargetControl() {
        const type =
            $('questTargetType');

        const target =
            $('questTargetValue');

        if (!type || !target) {
            return;
        }

        const manual =
            type.value ===
            'manual';

        target.disabled =
            manual;

        if (manual) {
            target.value = '1';
        }
    }

    async function createQuest() {
        const title =
            $('questTitleInput')?.value.trim() || '';

        const description =
            $('questDescriptionInput')?.value.trim() || '';

        const targetType =
            $('questTargetType')?.value || 'manual';

        const targetValue =
            Number(
                $('questTargetValue')?.value || 1
            );

        const dueAt =
            $('questDueDate')?.value || '';

        try {
            await api(
                `/api/classrooms/${activeClassroomId}/quests`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        title,
                        description,
                        target_type: targetType,
                        target_value: targetValue,
                        due_at: dueAt
                    })
                }
            );

            showToast(
                'Quest assigned.',
                'fa-flag-checkered'
            );

            await openClassroom(
                activeClassroomId
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }

    async function deleteQuest(questId) {
        try {
            await api(
                `/api/classrooms/${activeClassroomId}/quests/${questId}`,
                {
                    method: 'DELETE'
                }
            );

            showToast(
                'Quest removed.',
                'fa-trash'
            );

            await openClassroom(
                activeClassroomId
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }

    async function completeManualQuest(questId) {
        try {
            await api(
                `/api/classrooms/${activeClassroomId}/quests/${questId}/complete`,
                {
                    method: 'POST'
                }
            );

            showToast(
                'Quest marked complete.',
                'fa-check'
            );

            await openClassroom(
                activeClassroomId
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

    function openSideMenu() {
        sideMenu.classList.add(
            'open'
        );
        sideMenuOverlay.classList.add(
            'open'
        );
        sideMenu.setAttribute(
            'aria-hidden',
            'false'
        );
        menuToggleButton.setAttribute(
            'aria-expanded',
            'true'
        );
    }

    function closeSideMenu() {
        sideMenu.classList.remove(
            'open'
        );
        sideMenuOverlay.classList.remove(
            'open'
        );
        sideMenu.setAttribute(
            'aria-hidden',
            'true'
        );
        menuToggleButton.setAttribute(
            'aria-expanded',
            'false'
        );
    }

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

        if (
            viewId ===
            'classroomView' &&
            currentUser?.role !== 'generic'
        ) {
            loadClassrooms();
            'achievementsView'
        ) {
            loadAchievements();
        }

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        closeSideMenu();
    }

    // =========================================================
    // ACHIEVEMENTS
    // =========================================================

    async function loadAchievements() {
        if (!currentUser) return;

        try {
            const data = await api('/api/achievements');
            achievements = data.achievements || [];
            renderAchievements();
            updateStats();
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    function renderAchievements() {
        if (!achievementsGrid) return;

        // Update stats
        const completed = achievements.filter(a => a.completed).length;
        const totalPoints = achievements
            .filter(a => a.completed)
            .reduce((sum, a) => sum + a.points, 0);

        if (achievementTotal) achievementTotal.textContent = completed;
        if (achievementPoints) achievementPoints.textContent = totalPoints;

        if (achievements.length === 0) {
            achievementsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <strong>No achievements yet</strong>
                    <span>Start playing to unlock your first achievement!</span>
                </div>
            `;
            return;
        }

        // Get filter
        const activeFilter = document.querySelector('.filter-btn.active');
        const filter = activeFilter ? activeFilter.dataset.filter : 'all';

        let filtered = achievements;
        if (filter === 'completed') {
            filtered = achievements.filter(a => a.completed);
        } else if (filter === 'incomplete') {
            filtered = achievements.filter(a => !a.completed);
        }

        achievementsGrid.innerHTML = '';

        filtered.forEach(ach => {
            achievementsGrid.appendChild(createAchievementCard(ach));
        });

        if (filtered.length === 0) {
            achievementsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-filter"></i>
                    <strong>No achievements match this filter</strong>
                    <span>Try changing the filter above.</span>
                </div>
            `;
        }
    }

    function createAchievementCard(ach) {
        const card = document.createElement('div');
        card.className = `achievement-card ${ach.completed ? 'completed' : 'incomplete'}`;

        const progressPercent = ach.max_progress > 0
            ? Math.min((ach.progress / ach.max_progress) * 100, 100)
            : (ach.completed ? 100 : 0);

        card.innerHTML = `
            <div class="achievement-icon ${ach.completed ? 'completed' : ''}">
                <i class="fas ${ach.icon}"></i>
                ${ach.completed ? '<span class="check-mark">✓</span>' : ''}
            </div>
            <div class="achievement-info">
                <div class="achievement-header">
                    <span class="achievement-name">${escapeHtml(ach.name)}</span>
                    <span class="achievement-points">+${ach.points} ★</span>
                </div>
                <p class="achievement-description">${escapeHtml(ach.description)}</p>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${ach.completed ? 'complete' : ''}" 
                             style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-text">
                        ${ach.completed ? '✓ Completed' : `${ach.progress} / ${ach.max_progress}`}
                    </span>
                </div>
                ${ach.completed && ach.unlocked_at ? `<span class="achievement-date">Unlocked: ${new Date(ach.unlocked_at).toLocaleDateString()}</span>` : ''}
            </div>
        `;

        return card;
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

    function renderIcon(
        icon
    ) {
        if (
            typeof icon === 'string' &&
            icon.toLowerCase().endsWith('.svg')
        ) {
            return `<img src="${escapeHtml(icon)}" class="icon-img" alt="">`;
        }

        return `<i class="fas ${escapeClass(icon)}"></i>`;
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

        authRole.addEventListener(
            'change',
            updateTeacherCodeVisibility
        );

        createClassroomButton.addEventListener(
            'click',
            createClassroom
        );

        newClassroomName.addEventListener(
            'keydown',
            event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    createClassroom();
                }
            }
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

        // Camera
        closeCameraButton
            .addEventListener(
                'click',
                closeCamera
            );

        capturePhotoButton
            .addEventListener(
                'click',
                capturePhoto
            );

        retakePhotoButton
            .addEventListener(
                'click',
                retakePhoto
            );

        usePhotoButton
            .addEventListener(
                'click',
                useCapturedPhoto
            );

        switchCameraButton
            .addEventListener(
                'click',
                switchCamera
            );

        cameraBackdrop
            .addEventListener(
                'click',
                event => {

                    if (
                        event.target ===
                        cameraBackdrop
                    ) {

                        closeCamera();

                    }

                }
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

        // Side menu
        menuToggleButton.addEventListener(
            'click',
            openSideMenu
        );

        menuCloseButton.addEventListener(
            'click',
            closeSideMenu
        );

        sideMenuOverlay.addEventListener(
            'click',
            closeSideMenu
        );

        document.addEventListener(
            'keydown',
            event => {
                if (
                    event.key === 'Escape' &&
                    sideMenu.classList.contains('open')
                ) {
                    closeSideMenu();
                }
            }
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

        closeFriendVisitButton
            .addEventListener(
                'click',
                closeFriendGarden
            );


        friendVisitDoneButton
            .addEventListener(
                'click',
                closeFriendGarden
            );


        friendVisitBackdrop
            .addEventListener(
                'click',
                event => {

                    // Clicking the dark background
                    // closes the friend's garden.

                    if (
                        event.target ===
                        friendVisitBackdrop
                    ) {
                        closeFriendGarden();
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
                    event.key !==
                    'Escape'
                ) {
                    return;
                }


                if (
                    !cameraBackdrop
                        .classList
                        .contains('hidden')
                ) {

                    closeCamera();

                    return;
                }


                // Close friend garden first.
                if (
                    !friendVisitBackdrop
                        .classList
                        .contains(
                            'hidden'
                        )
                ) {

                    closeFriendGarden();

                    return;
                }


                // Otherwise close your garden picker.
                if (
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

        // Achievement filters
        document
            .querySelectorAll('.filter-btn')
            .forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderAchievements();
                });
            });

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

    renderWiki();

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