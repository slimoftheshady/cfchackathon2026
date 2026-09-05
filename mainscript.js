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
        return `images/${String(name ?? '')
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

    // The existing database `score` value is now treated
    // as permanent XP.
    const PLAYER_LEVELS = [
        {
            level: 1,
            title: 'New Gardener',
            minXp: 0
        },
        {
            level: 2,
            title: 'Seedling Scout',
            minXp: 100
        },
        {
            level: 3,
            title: 'Plant Spotter',
            minXp: 200
        },
        {
            level: 4,
            title: 'Bushland Explorer',
            minXp: 350
        },
        {
            level: 5,
            title: 'Biodiversity Ranger',
            minXp: 550
        },
        {
            level: 6,
            title: 'Habitat Keeper',
            minXp: 800
        },
        {
            level: 7,
            title: 'Wildflower Guardian',
            minXp: 1100
        },
        {
            level: 8,
            title: 'Field Ecologist',
            minXp: 1450
        },
        {
            level: 9,
            title: 'Conservation Leader',
            minXp: 1850
        },
        {
            level: 10,
            title: 'Master Naturalist',
            minXp: 2300
        }
    ];

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
    let mapPlants = [];
    let leafletMap = null;
    let observationLayer = null;
    let currentLocationLayer = null;
    let quests = null;

    let gardenProgression = {
        level: 1,
        unlockedPlots: 4,
        maxPlots: MAX_SLOTS,
        nextLevel: 2,
        nextCost: 150,
        nextPlots: 6
    };

    let biodiversity = {
        todayUnique: 0,
        totalUnique: 0,
        multiplier: 1,
        nextTarget: 3,
        nextMultiplier: 1.25,
        newAreaRadiusMetres: 250
    };

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

    // Player progression
    const playerLevelLabel = $('playerLevelLabel');
    const playerLevelTitle = $('playerLevelTitle');
    const playerXpTotal = $('playerXpTotal');
    const playerXpProgress = $('playerXpProgress');
    const playerXpText = $('playerXpText');
    const playerNextUnlock = $('playerNextUnlock');

    // Biodiversity progression
    const biodiversityStreakCount =
        $('biodiversityStreakCount');

    const biodiversityMultiplier =
        $('biodiversityMultiplier');

    const biodiversityStreakTrack =
        $('biodiversityStreakTrack');

    const biodiversityNextBonus =
        $('biodiversityNextBonus');

    const biodiversityTotalUnique =
        $('biodiversityTotalUnique');

    // Next goal
    const nextGoalCard =
        $('nextGoalCard');

    const nextGoalTitle =
        $('nextGoalTitle');

    const nextGoalIcon =
        $('nextGoalIcon');

    const nextGoalProgressFill =
        $('nextGoalProgressFill');

    const nextGoalProgressText =
        $('nextGoalProgressText');

    const nextGoalUnlocks =
        $('nextGoalUnlocks');

    const nextGoalButton =
        $('nextGoalButton');

    // Garden progression
    const gardenLevelLabel = $('gardenLevelLabel');
    const gardenPlotSummary = $('gardenPlotSummary');
    const gardenUpgradeButton = $('gardenUpgradeButton');
    const gardenUpgradeText = $('gardenUpgradeText');
    const gardenUpgradeHint = $('gardenUpgradeHint');

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
    const plantMap = $('plantMap');
    const mapObservationCount = $('mapObservationCount');
    const mapStatus = $('mapStatus');
    const locateMeButton = $('locateMeButton');
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

    // Quests
    const dailyQuestList = $('dailyQuestList');
    const weeklyQuestList = $('weeklyQuestList');
    const communityQuestCard = $('communityQuestCard');
    const specialQuestList = $('specialQuestList');
    const specialQuestCodeInput = $('specialQuestCodeInput');
    const redeemSpecialQuestButton = $('redeemSpecialQuestButton');
    const specialTaskList = $('specialTaskList');
    const addSpecialTaskButton = $('addSpecialTaskButton');
    const createSpecialQuestButton = $('createSpecialQuestButton');
    const specialQuestResult = $('specialQuestResult');
    const specialQuestQr = $('specialQuestQr');
    const specialQuestCreatedCode = $('specialQuestCreatedCode');
    const specialQuestCreatedDetails = $('specialQuestCreatedDetails');
    const scanSpecialQuestButton = $('scanSpecialQuestButton');
    const qrScanBackdrop = $('qrScanBackdrop');
    const qrScanVideo = $('qrScanVideo');
    const qrScanStatus = $('qrScanStatus');
    const closeQrScanButton = $('closeQrScanButton');
    let qrScanStream = null;
    let qrScanFrame = null;

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
            await loadMapPlants();
            await loadQuests();

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

    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Location is not supported by this browser.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy || 0
                }),
                error => {
                    const messages = {
                        1: 'Location permission is required to log a biodiversity snap.',
                        2: 'Your location could not be determined. Try moving somewhere with better GPS reception.',
                        3: 'Getting your location took too long. Please try again.'
                    };
                    reject(new Error(
                        messages[error.code] ||
                        'Djilba could not access your current location.'
                    ));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 12000,
                    maximumAge: 15000
                }
            );
        });
    }

    function ensureLeafletMap() {
        if (!plantMap || !window.L) {
            if (mapStatus) {
                mapStatus.textContent = 'The interactive map library could not be loaded.';
            }
            return null;
        }

        if (leafletMap) {
            return leafletMap;
        }

        leafletMap = L.map(plantMap).setView([-31.9505, 115.8605], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(leafletMap);
        observationLayer = L.layerGroup().addTo(leafletMap);
        return leafletMap;
    }

    async function loadMapPlants(options = {}) {
        try {
            const data = await api('/api/observations');
            mapPlants = Array.isArray(data.plants) ? data.plants : [];
            renderMapPlants(options);
        } catch (error) {
            if (error.status === 401) {
                showAuth();
                return;
            }
            if (mapStatus) {
                mapStatus.textContent = 'Could not load your sightings.';
            }
            showToast('Could not load plant locations.', 'fa-triangle-exclamation');
        }
    }

    function renderMapPlants(options = {}) {
        const map = ensureLeafletMap();
        if (mapObservationCount) {
            const count = mapPlants.length;
            mapObservationCount.textContent = `${count} ${count === 1 ? 'sighting' : 'sightings'}`;
        }
        if (!map || !observationLayer) {
            return;
        }

        observationLayer.clearLayers();
        const bounds = [];
        mapPlants.forEach(observation => {
            const latitude = Number(observation.latitude);
            const longitude = Number(observation.longitude);
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                return;
            }

            const displayName = observation.common_name || observation.scientific_name || observation.name || 'Plant';
            const scientificLine = observation.scientific_name && observation.scientific_name !== displayName
                ? `<em>${escapeHtml(observation.scientific_name)}</em><br>`
                : '';
            const rawDate = String(observation.created_at || '');
            const dateText = rawDate
                ? new Date(`${rawDate.replace(' ', 'T')}Z`).toLocaleString()
                : 'Recently logged';
            const accuracy = Number(observation.accuracy_m || 0);
            const accuracyText = accuracy > 0 ? `GPS accuracy +/-${Math.round(accuracy)} m` : 'GPS location';

            L.marker([latitude, longitude]).bindPopup(`
                <div class="map-popup">
                    <strong>${escapeHtml(displayName)}</strong><br>
                    ${scientificLine}
                    <span>${escapeHtml(dateText)}</span><br>
                    <small>${escapeHtml(accuracyText)}</small>
                </div>
            `).addTo(observationLayer);
            bounds.push([latitude, longitude]);
        });

        if (mapStatus) {
            mapStatus.textContent = mapPlants.length
                ? 'Tap a marker to see what you found.'
                : 'No sightings yet. Take a biodiversity snap to add the first one.';
        }

        if (options.focusObservation) {
            const latitude = Number(options.focusObservation.latitude);
            const longitude = Number(options.focusObservation.longitude);
            if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
                map.setView([latitude, longitude], 17);
            }
        } else if (options.fitBounds && bounds.length) {
            bounds.length === 1
                ? map.setView(bounds[0], 16)
                : map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 });
        }

        setTimeout(() => map.invalidateSize(), 0);
    }

    async function locateOnMap() {
        if (locateMeButton) locateMeButton.disabled = true;
        if (mapStatus) mapStatus.textContent = 'Finding your current location...';
        try {
            const location = await getCurrentLocation();
            const map = ensureLeafletMap();
            if (!map) return;
            currentLocationLayer?.remove();
            currentLocationLayer = L.layerGroup().addTo(map);
            L.circle([location.latitude, location.longitude], {
                radius: Math.max(5, location.accuracy || 0),
                weight: 1,
                fillOpacity: 0.08
            }).addTo(currentLocationLayer);
            L.circleMarker([location.latitude, location.longitude], {
                radius: 7,
                weight: 3,
                fillOpacity: 1
            }).bindTooltip('You are here').addTo(currentLocationLayer);
            map.setView([location.latitude, location.longitude], Math.max(map.getZoom(), 16));
            if (mapStatus) {
                mapStatus.textContent = `Current location found - accuracy +/-${Math.round(location.accuracy || 0)} m.`;
            }
        } catch (error) {
            if (mapStatus) mapStatus.textContent = error.message;
            showToast(error.message, 'fa-location-dot');
        } finally {
            if (locateMeButton) locateMeButton.disabled = false;
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

        gardenProgression = {
            level: 1,
            unlockedPlots: 4,
            maxPlots: MAX_SLOTS,
            nextLevel: 2,
            nextCost: 150,
            nextPlots: 6
        };

        biodiversity = {
            todayUnique: 0,
            totalUnique: 0,
            multiplier: 1,
            nextTarget: 3,
            nextMultiplier: 1.25,
            newAreaRadiusMetres: 250
        };

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

        gardenProgression =
            state.garden
            && typeof state.garden === 'object'
                ? {
                    level:
                        Number(
                            state.garden.level
                            || state.gardenLevel
                            || 1
                        ),

                    unlockedPlots:
                        Number(
                            state.garden.unlockedPlots
                            || 4
                        ),

                    maxPlots:
                        Number(
                            state.garden.maxPlots
                            || MAX_SLOTS
                        ),

                    nextLevel:
                        state.garden.nextLevel == null
                            ? null
                            : Number(
                                state.garden.nextLevel
                            ),

                    nextCost:
                        state.garden.nextCost == null
                            ? null
                            : Number(
                                state.garden.nextCost
                            ),

                    nextPlots:
                        state.garden.nextPlots == null
                            ? null
                            : Number(
                                state.garden.nextPlots
                            )
                }
                : {
                    level:
                        Number(
                            state.gardenLevel
                            || 1
                        ),

                    unlockedPlots:
                        MAX_SLOTS,

                    maxPlots:
                        MAX_SLOTS,

                    nextLevel:
                        null,

                    nextCost:
                        null,

                    nextPlots:
                        null
                };

        biodiversity =
            state.biodiversity
            && typeof state.biodiversity === 'object'

                ? {
                    todayUnique:
                        Number(
                            state.biodiversity.todayUnique
                            || 0
                        ),

                    totalUnique:
                        Number(
                            state.biodiversity.totalUnique
                            || 0
                        ),

                    multiplier:
                        Number(
                            state.biodiversity.multiplier
                            || 1
                        ),

                    nextTarget:
                        state.biodiversity.nextTarget == null
                            ? null
                            : Number(
                                state.biodiversity.nextTarget
                            ),

                    nextMultiplier:
                        state.biodiversity.nextMultiplier == null
                            ? null
                            : Number(
                                state.biodiversity.nextMultiplier
                            ),

                    newAreaRadiusMetres:
                        Number(
                            state.biodiversity.newAreaRadiusMetres
                            || 250
                        )
                }

                : {
                    todayUnique: 0,
                    totalUnique: 0,
                    multiplier: 1,
                    nextTarget: 3,
                    nextMultiplier: 1.25,
                    newAreaRadiusMetres: 250
                };

        biodiversity =
            state.biodiversity
            && typeof state.biodiversity === 'object'

                ? {
                    todayUnique:
                        Number(
                            state.biodiversity.todayUnique
                            || 0
                        ),

                    totalUnique:
                        Number(
                            state.biodiversity.totalUnique
                            || 0
                        ),

                    multiplier:
                        Number(
                            state.biodiversity.multiplier
                            || 1
                        ),

                    nextTarget:
                        state.biodiversity.nextTarget == null
                            ? null
                            : Number(
                                state.biodiversity.nextTarget
                            ),

                    nextMultiplier:
                        state.biodiversity.nextMultiplier == null
                            ? null
                            : Number(
                                state.biodiversity.nextMultiplier
                            ),

                    newAreaRadiusMetres:
                        Number(
                            state.biodiversity.newAreaRadiusMetres
                            || 250
                        )
                }

                : {
                    todayUnique: 0,
                    totalUnique: 0,
                    multiplier: 1,
                    nextTarget: 3,
                    nextMultiplier: 1.25,
                    newAreaRadiusMetres: 250
                };

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

        renderProgression();

        renderBiodiversity();

        renderNextGoal();

        renderStore();

        if (
            !gardenPickerBackdrop
                .classList
                .contains('hidden')
        ) {
            renderCollectionPicker();
        }
    }

    async function loadQuests() {
        if (!currentUser) return;
        try {
            const data = await api('/api/quests');
            quests = data.quests;
            renderQuests();
        } catch (error) {
            if (error.status !== 401) {
                showToast('Could not load quests.', 'fa-triangle-exclamation');
            }
        }
    }

    function questProgressBar(progress, target) {
        const percent = Math.min(100, Math.round((progress / target) * 100));
        return `<div class="quest-progress"><span style="width: ${percent}%"></span></div>`;
    }


    function renderQuests() {

        if (
            !quests
            || !dailyQuestList
        ) {
            return;
        }

        const rewardSummary = (
            quest
        ) =>
            (
                `${Number(
                    quest.reward
                    || 0
                )} coins · `
                + `${Number(
                    quest.xp_reward
                    || 0
                )} XP`
            );

        // -----------------------------------------
        // Daily
        // -----------------------------------------

        dailyQuestList
            .innerHTML =
            quests.daily
                .map(
                    quest => `
                        <article
                            class="quest-card daily-quest-card ${
                                quest.completed
                                && !quest.claimed
                                    ? 'claimable'
                                    : ''
                            } ${
                                quest.claimed
                                    ? 'completed'
                                    : ''
                            }"
                            data-quest-key="${escapeHtml(quest.key)}"
                            ${
                                quest.completed
                                && !quest.claimed
                                    ? 'tabindex="0" role="button"'
                                    : ''
                            }
                        >
                            <div class="quest-card-icon">
                                <i class="fas ${
                                    quest.completed
                                        ? 'fa-check'
                                        : 'fa-camera'
                                }"></i>
                            </div>

                            <div class="quest-card-body">
                                <strong>
                                    ${escapeHtml(quest.title)}
                                </strong>

                                <p>
                                    ${escapeHtml(quest.description)}
                                </p>

                                ${
                                    questProgressBar(
                                        quest.progress,
                                        quest.target
                                    )
                                }

                                <span>
                                    ${quest.progress}
                                    /
                                    ${quest.target}
                                    ·
                                    ${rewardSummary(quest)}
                                </span>
                            </div>

                            <div
                                class="quest-reward ${
                                    quest.claimed
                                        ? 'claimed'
                                        : ''
                                }"
                            >
                                <i class="fas ${
                                    quest.claimed
                                        ? 'fa-check'
                                        : 'fa-coins'
                                }"></i>

                                <strong>
                                    ${quest.reward}
                                </strong>

                                <small>
                                    ${
                                        quest.claimed
                                            ? 'Claimed'
                                            : quest.completed
                                                ? 'Claim'
                                                : 'coins'
                                    }
                                </small>
                            </div>
                        </article>
                    `
                )
                .join('');

        // -----------------------------------------
        // Weekly
        // -----------------------------------------

        if (
            weeklyQuestList
        ) {
            weeklyQuestList
                .innerHTML =
                (
                    quests.weekly
                    || []
                )
                    .map(
                        quest => `
                            <article
                                class="quest-card weekly-quest-card ${
                                    quest.completed
                                    && !quest.claimed
                                        ? 'claimable'
                                        : ''
                                } ${
                                    quest.claimed
                                        ? 'completed'
                                        : ''
                                }"
                                data-quest-key="${escapeHtml(quest.key)}"
                                ${
                                    quest.completed
                                    && !quest.claimed
                                        ? 'tabindex="0" role="button"'
                                        : ''
                                }
                            >
                                <div class="quest-card-icon weekly-icon">
                                    <i class="fas ${
                                        quest.completed
                                            ? 'fa-check'
                                            : 'fa-calendar-week'
                                    }"></i>
                                </div>

                                <div class="quest-card-body">
                                    <strong>
                                        ${escapeHtml(quest.title)}
                                    </strong>

                                    <p>
                                        ${escapeHtml(quest.description)}
                                    </p>

                                    ${
                                        questProgressBar(
                                            quest.progress,
                                            quest.target
                                        )
                                    }

                                    <span>
                                        ${quest.progress}
                                        /
                                        ${quest.target}
                                        ·
                                        ${rewardSummary(quest)}
                                    </span>
                                </div>

                                <div
                                    class="quest-reward ${
                                        quest.claimed
                                            ? 'claimed'
                                            : ''
                                    }"
                                >
                                    <i class="fas ${
                                        quest.claimed
                                            ? 'fa-check'
                                            : 'fa-coins'
                                    }"></i>

                                    <strong>
                                        ${quest.reward}
                                    </strong>

                                    <small>
                                        ${
                                            quest.claimed
                                                ? 'Claimed'
                                                : quest.completed
                                                    ? 'Claim'
                                                    : 'coins'
                                        }
                                    </small>
                                </div>
                            </article>
                        `
                    )
                    .join('');
        }

        // -----------------------------------------
        // Community
        // -----------------------------------------

        const community =
            quests.community;

        const nextMilestone =
            community
                .milestones
                .find(
                    milestone =>
                        !milestone
                            .reached
                );

        const claimableMilestones =
            community
                .milestones
                .filter(
                    milestone =>
                        milestone
                            .claimable
                );

        communityQuestCard
            .innerHTML = `
                <article
                    class="community-quest-card ${
                        community.progress
                        >= community.target
                            ? 'completed'
                            : ''
                    }"
                >
                    <div class="community-quest-heading">

                        <div>
                            <span class="eyebrow">
                                RESEARCHER-LED GOAL
                            </span>

                            <h2>
                                ${escapeHtml(community.title)}
                            </h2>

                            <p>
                                ${escapeHtml(community.description)}
                            </p>
                        </div>

                        <i class="fas fa-location-dot"></i>

                    </div>

                    <div class="community-contribution-note">

                        <i class="fas fa-leaf"></i>

                        You have contributed

                        <strong>
                            ${Number(
                                community.contribution
                                || 0
                            ).toLocaleString()}
                        </strong>

                        accepted sighting${
                            Number(
                                community.contribution
                                || 0
                            ) === 1
                                ? ''
                                : 's'
                        }.

                    </div>

                    <div class="community-tracker">

                        ${
                            questProgressBar(
                                community.progress,
                                community.target
                            )
                        }

                        <div class="community-milestones">

                            ${
                                community
                                    .milestones
                                    .map(
                                        milestone => `
                                            <div
                                                class="community-milestone ${
                                                    milestone.reached
                                                        ? 'reached'
                                                        : ''
                                                } ${
                                                    milestone.claimed
                                                        ? 'claimed'
                                                        : ''
                                                }"
                                                style="left: ${
                                                    (
                                                        milestone.target
                                                        / community.target
                                                    )
                                                    * 100
                                                }%"
                                            >
                                                <span
                                                    class="community-milestone-dot"
                                                ></span>

                                                <strong>
                                                    ${milestone.target.toLocaleString()}
                                                </strong>

                                                <small>
                                                    +${milestone.reward}
                                                    coins
                                                </small>
                                            </div>
                                        `
                                    )
                                    .join('')
                            }

                        </div>

                    </div>

                    <div class="community-quest-total">

                        <strong>
                            ${community.progress.toLocaleString()}
                        </strong>

                        /
                        ${community.target.toLocaleString()}
                        snaps

                    </div>

                    ${
                        claimableMilestones.length

                            ? `
                                <div class="community-claim-box">

                                    <strong>
                                        Contributor rewards ready
                                    </strong>

                                    ${
                                        claimableMilestones
                                            .map(
                                                milestone => `
                                                    <button
                                                        class="soft-btn community-claim-btn"
                                                        data-community-target="${milestone.target}"
                                                        type="button"
                                                    >
                                                        <i class="fas fa-gift"></i>

                                                        Claim
                                                        ${milestone.target.toLocaleString()}
                                                        reward ·
                                                        ${milestone.reward}
                                                        coins +
                                                        ${milestone.xp_reward}
                                                        XP
                                                    </button>
                                                `
                                            )
                                            .join('')
                                    }

                                </div>
                            `

                            : `
                                <div class="community-next-reward">

                                    ${
                                        Number(
                                            community.contribution
                                            || 0
                                        ) <= 0

                                            ? (
                                                'Make one accepted '
                                                + 'biodiversity snap '
                                                + 'to become a '
                                                + 'community contributor.'
                                            )

                                            : nextMilestone

                                                ? (
                                                    `Next contributor reward at `
                                                    + `${nextMilestone.target.toLocaleString()} `
                                                    + `sightings: `
                                                    + `${nextMilestone.reward} coins `
                                                    + `+ ${nextMilestone.xp_reward} XP.`
                                                )

                                                : (
                                                    'All community '
                                                    + 'milestones have '
                                                    + 'been reached.'
                                                )
                                    }

                                </div>
                            `
                    }

                </article>
            `;

        // -----------------------------------------
        // Special
        // -----------------------------------------

        specialQuestList
            .innerHTML =
            quests.special.length

                ? quests.special
                    .map(
                        quest => `
                            <article
                                class="quest-card special-quest-card ${
                                    quest.completed
                                        ? 'completed'
                                        : ''
                                }"
                            >
                                <button
                                    class="special-quest-delete"
                                    type="button"
                                    data-special-quest-id="${quest.id}"
                                    aria-label="Remove ${escapeHtml(quest.plant)} quest"
                                >
                                    <i class="fas fa-xmark"></i>
                                </button>

                                <div class="quest-card-icon">
                                    <i class="fas ${
                                        quest.completed
                                            ? 'fa-check'
                                            : 'fa-qrcode'
                                    }"></i>
                                </div>

                                <div class="quest-card-body">

                                    <strong>
                                        ${escapeHtml(quest.plant)}
                                        quest
                                    </strong>

                                    <p>
                                        ${
                                            quest.tasks
                                                ?.map(
                                                    task =>
                                                        `${escapeHtml(task.plant)} × ${task.required_snaps}`
                                                )
                                                .join(' · ')
                                            ||
                                            'Snap this quest target at the marked location.'
                                        }
                                    </p>

                                    ${
                                        questProgressBar(
                                            quest.progress,
                                            quest.target
                                        )
                                    }

                                    <span>
                                        ${quest.progress}
                                        /
                                        ${quest.target}
                                        snaps ·
                                        ${quest.reward}
                                        coins ·
                                        ${quest.xp_reward}
                                        XP
                                    </span>

                                </div>

                            </article>
                        `
                    )
                    .join('')

                : `
                    <div class="empty-state">
                        <i class="fas fa-qrcode"></i>
                        <strong>No special quests yet</strong>
                        <span>
                            Scan a sign or enter a code to add one.
                        </span>
                    </div>
                `;
    }


    function applyQuestBalance(
        data
    ) {
        if (
            !data
            || !data.balance
        ) {
            return;
        }

        points =
            Number(
                data
                    .balance
                    .coins
                ?? points
            );

        score =
            Number(
                data
                    .balance
                    .xp
                ?? score
            );

        renderEverything();
    }


    async function claimDailyQuest(
        questKey
    ) {
        try {
            const data =
                await api(
                    `/api/quests/daily/${encodeURIComponent(questKey)}/claim`,
                    {
                        method:
                            'POST'
                    }
                );

            applyQuestBalance(
                data
            );

            await loadQuests();

            showToast(
                `${data.title} complete! +${data.reward} coins and +${data.xp_reward} XP.`,
                'fa-map-signs'
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }


    async function claimWeeklyQuest(
        questKey
    ) {
        try {
            const data =
                await api(
                    `/api/quests/weekly/${encodeURIComponent(questKey)}/claim`,
                    {
                        method:
                            'POST'
                    }
                );

            applyQuestBalance(
                data
            );

            await loadQuests();

            showToast(
                `${data.title} complete! +${data.reward} coins and +${data.xp_reward} XP.`,
                'fa-calendar-week'
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }


    async function claimCommunityMilestone(
        target
    ) {
        try {
            const data =
                await api(
                    `/api/quests/community/${Number(target)}/claim`,
                    {
                        method:
                            'POST'
                    }
                );

            applyQuestBalance(
                data
            );

            await loadQuests();

            showToast(
                `Community reward claimed! +${data.reward} coins and +${data.xp_reward} XP.`,
                'fa-people-group'
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );
        }
    }

    async function deleteSpecialQuest(questId) {
        try {
            await api(`/api/quests/special/${questId}`, { method: 'DELETE' });
            await loadQuests();
            showToast('Special quest removed.', 'fa-xmark');
        } catch (error) {
            showToast(error.message, 'fa-triangle-exclamation');
        }
    }

    async function redeemSpecialQuest() {
        const code = specialQuestCodeInput.value.trim().toUpperCase();
        try {
            await api('/api/quests/special/redeem', {
                method: 'POST',
                body: JSON.stringify({ code })
            });
            specialQuestCodeInput.value = '';
            await loadQuests();
            showToast('Special quest added to your field guide.', 'fa-qrcode');
        } catch (error) {
            showToast(error.message, 'fa-triangle-exclamation');
        }
    }

    async function createSpecialQuest() {
        createSpecialQuestButton.disabled = true;
        try {
            const tasks = [...specialTaskList.querySelectorAll('.special-task-row')].map(row => ({
                plant: row.querySelector('.special-task-plant').value.trim(),
                required_snaps: Number(row.querySelector('.special-task-target').value)
            }));
            const data = await api('/api/quests/special/create', {
                method: 'POST',
                body: JSON.stringify({ tasks })
            });
            specialQuestResult.classList.remove('hidden');
            specialQuestCreatedCode.textContent = data.code;
            specialQuestCreatedDetails.textContent = `Complete ${data.tasks.length} task${data.tasks.length === 1 ? '' : 's'} (${data.target} snaps total). Share or print this code.`;
            specialQuestQr.innerHTML = '';
            if (window.QRCode) {
                new QRCode(specialQuestQr, {
                    text: data.code,
                    width: 128,
                    height: 128,
                    colorDark: '#26352d',
                    colorLight: '#ffffff'
                });
            }
            specialTaskList.innerHTML = `
                <div class="special-task-row">
                    <input class="special-task-plant" type="text" maxlength="80" placeholder="Plant name, e.g. Kangaroo Paw">
                    <input class="special-task-target" type="number" min="1" max="1000" value="5" aria-label="Required snaps">
                    <button class="icon-btn remove-special-task" type="button" aria-label="Remove task"><i class="fas fa-xmark"></i></button>
                </div>`;
            await loadQuests();
            showToast('Special quest created.', 'fa-wand-magic-sparkles');
        } catch (error) {
            showToast(error.message, 'fa-triangle-exclamation');
        } finally {
            createSpecialQuestButton.disabled = false;
        }
    }

    function addSpecialTask() {
        if (specialTaskList.children.length >= 10) {
            showToast('A quest can contain up to 10 tasks.', 'fa-list-check');
            return;
        }
        specialTaskList.insertAdjacentHTML('beforeend', `
            <div class="special-task-row">
                <input class="special-task-plant" type="text" maxlength="80" placeholder="Plant name">
                <input class="special-task-target" type="number" min="1" max="1000" value="5" aria-label="Required snaps">
                <button class="icon-btn remove-special-task" type="button" aria-label="Remove task"><i class="fas fa-xmark"></i></button>
            </div>`);
    }

    async function scanSpecialQuest() {
        if (!('BarcodeDetector' in window)) {
            showToast('QR scanning is not supported here. Enter the code manually.', 'fa-keyboard');
            specialQuestCodeInput.focus();
            return;
        }

        try {
            qrScanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
            qrScanVideo.srcObject = qrScanStream;
            qrScanBackdrop.classList.remove('hidden');
            document.body.classList.add('modal-open');
            qrScanStatus.textContent = 'Point your camera at the code.';
            const detector = new BarcodeDetector({ formats: ['qr_code'] });

            const scanFrame = async () => {
                if (!qrScanStream) return;
                try {
                    const codes = await detector.detect(qrScanVideo);
                    const code = codes[0]?.rawValue?.trim().toUpperCase();
                    if (code) {
                        specialQuestCodeInput.value = code;
                        closeQrScanner();
                        await redeemSpecialQuest();
                        return;
                    }
                } catch (_) {
                    qrScanStatus.textContent = 'Move the code into view and try again.';
                }
                qrScanFrame = requestAnimationFrame(scanFrame);
            };
            qrScanFrame = requestAnimationFrame(scanFrame);
        } catch (_) {
            closeQrScanner();
            showToast('Camera access was unavailable. Enter the code manually.', 'fa-triangle-exclamation');
        }
    }

    function closeQrScanner() {
        if (qrScanFrame) cancelAnimationFrame(qrScanFrame);
        qrScanFrame = null;
        qrScanStream?.getTracks().forEach(track => track.stop());
        qrScanStream = null;
        qrScanVideo.srcObject = null;
        qrScanBackdrop.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }

    // =========================================================
    // GARDEN
    // =========================================================

    function renderGarden() {
        plotGrid.innerHTML = '';

        const unlockedPlots = Math.max(
            0,
            Math.min(
                MAX_SLOTS,
                Number(
                    gardenProgression
                        .unlockedPlots
                    || 4
                )
            )
        );

        gardenSlots.forEach(
            (item, index) => {
                const locked =
                    index >=
                    unlockedPlots;

                const plot =
                    document.createElement(
                        'button'
                    );

                plot.type =
                    'button';

                plot.dataset.slot =
                    index;

                if (locked) {
                    plot.className =
                        'plot locked-plot';

                    plot.setAttribute(
                        'aria-label',
                        `Plot ${index + 1}: locked. Upgrade your garden to unlock this plot.`
                    );

                    plot.innerHTML = `
                        <i class="fas fa-lock"></i>
                        <span>
                            Level ${
                                gardenProgression
                                    .nextLevel
                                || gardenProgression
                                    .level
                            }
                        </span>
                    `;

                    plot.addEventListener(
                        'click',
                        () => {
                            const nextLevel =
                                gardenProgression
                                    .nextLevel;

                            showToast(
                                nextLevel
                                    ? `Upgrade your garden to Level ${nextLevel} to unlock more plots.`
                                    : 'This plot is not available yet.',
                                'fa-lock'
                            );
                        }
                    );

                    plotGrid.appendChild(
                        plot
                    );

                    return;
                }

                plot.className =
                    `plot ${
                        item
                            ? `filled rarity-${item.rarity} kind-${item.kind}`
                            : 'empty-plot'
                    }`;

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
                .slice(
                    0,
                    unlockedPlots
                )
                .filter(Boolean)
                .length;

        plantCounter.textContent =
            `${occupied} / ${unlockedPlots} placed`;
    }


    function getPlayerProgression() {
        const xp =
            Math.max(
                0,
                Number(
                    score
                    || 0
                )
            );

        let current =
            PLAYER_LEVELS[0];

        for (
            const level
            of PLAYER_LEVELS
        ) {
            if (
                xp >=
                level.minXp
            ) {
                current =
                    level;

            } else {
                break;
            }
        }

        const currentIndex =
            PLAYER_LEVELS.findIndex(
                level =>
                    level.level ===
                    current.level
            );

        const next =
            PLAYER_LEVELS[
                currentIndex + 1
            ]
            || null;

        const startXp =
            current.minXp;

        const endXp =
            next
                ? next.minXp
                : startXp;

        const range =
            Math.max(
                1,
                endXp - startXp
            );

        const progress =
            next
                ? Math.max(
                    0,
                    Math.min(
                        100,
                        (
                            (
                                xp
                                - startXp
                            )
                            / range
                        )
                        * 100
                    )
                )
                : 100;

        return {
            xp,
            current,
            next,
            progress
        };
    }


    function nextUnlockCopy(level) {
        if (level < 2) {
            return (
                'Next: Seed store at Level 2'
            );
        }

        if (level < 3) {
            return (
                'Next: Wildlife at Level 3'
            );
        }

        if (level < 4) {
            return (
                'Next: Special field quests at Level 4'
            );
        }

        if (level < 5) {
            return (
                'Next: Rare habitats at Level 5'
            );
        }

        return (
            'Keep exploring to raise your naturalist rank'
        );
    }


    function renderProgression() {
        const player =
            getPlayerProgression();

        if (playerLevelLabel) {
            playerLevelLabel.textContent =
                `Level ${player.current.level}`;
        }

        if (playerLevelTitle) {
            playerLevelTitle.textContent =
                player.current.title;
        }

        if (playerXpTotal) {
            playerXpTotal.textContent =
                player.xp
                    .toLocaleString();
        }

        if (playerXpProgress) {
            playerXpProgress
                .style
                .width =
                `${player.progress}%`;
        }

        if (playerXpText) {
            playerXpText.textContent =
                player.next
                    ? `${player.xp.toLocaleString()} / ${player.next.minXp.toLocaleString()} XP`
                    : `${player.xp.toLocaleString()} XP · maximum rank`;
        }

        if (playerNextUnlock) {
            playerNextUnlock.textContent =
                nextUnlockCopy(
                    player.current.level
                );
        }

        const unlockedPlots =
            Number(
                gardenProgression
                    .unlockedPlots
                || 4
            );

        if (gardenLevelLabel) {
            gardenLevelLabel.textContent =
                `Garden Level ${gardenProgression.level}`;
        }

        if (gardenPlotSummary) {
            gardenPlotSummary.textContent =
                `${unlockedPlots} plots unlocked`;
        }

        if (
            gardenUpgradeButton
            && gardenUpgradeText
            && gardenUpgradeHint
        ) {
            if (
                gardenProgression
                    .nextLevel == null
            ) {
                gardenUpgradeButton
                    .disabled =
                    true;

                gardenUpgradeText
                    .textContent =
                    'Fully expanded';

                gardenUpgradeHint
                    .innerHTML =
                    '<i class="fas fa-circle-check"></i> All 16 garden plots unlocked';

            } else {
                const cost =
                    Number(
                        gardenProgression
                            .nextCost
                        || 0
                    );

                const nextPlots =
                    Number(
                        gardenProgression
                            .nextPlots
                        || unlockedPlots
                    );

                gardenUpgradeButton
                    .disabled =
                    false;

                gardenUpgradeText
                    .textContent =
                    `Level ${gardenProgression.nextLevel} · ${cost} coins`;

                gardenUpgradeHint
                    .innerHTML =
                    `<i class="fas fa-lock-open"></i> Next upgrade unlocks ${nextPlots} plots`;
            }
        }
    }


    function formatMultiplier(
        value
    ) {
        const number =
            Number(
                value
                || 1
            );

        return Number.isInteger(
            number
        )
            ? number.toFixed(0)
            : String(number);
    }


    function renderBiodiversity() {

        const count =
            Math.max(
                0,
                Number(
                    biodiversity
                        .todayUnique
                    || 0
                )
            );

        const multiplier =
            Number(
                biodiversity
                    .multiplier
                || 1
            );

        if (
            biodiversityStreakCount
        ) {
            biodiversityStreakCount
                .textContent =
                count;
        }

        if (
            biodiversityMultiplier
        ) {
            biodiversityMultiplier
                .textContent =
                `×${formatMultiplier(multiplier)}`;
        }

        if (
            biodiversityTotalUnique
        ) {
            const total =
                Math.max(
                    0,
                    Number(
                        biodiversity
                            .totalUnique
                        || 0
                    )
                );

            biodiversityTotalUnique
                .textContent =
                `${total} species discovered overall`;
        }

        if (
            biodiversityStreakTrack
        ) {
            biodiversityStreakTrack
                .innerHTML =
                Array.from(
                    {
                        length: 10
                    },

                    (
                        _,
                        index
                    ) => {
                        const number =
                            index + 1;

                        const active =
                            number
                            <= count;

                        const milestone =
                            number === 3
                            || number === 5
                            || number === 10;

                        return `
                            <span
                                class="biodiversity-streak-dot ${
                                    active
                                        ? 'active'
                                        : ''
                                } ${
                                    milestone
                                        ? 'milestone'
                                        : ''
                                }"
                                title="${number} unique species"
                            ></span>
                        `;
                    }
                )
                .join('');
        }

        if (
            biodiversityNextBonus
        ) {

            if (
                biodiversity
                    .nextTarget
                == null
            ) {
                biodiversityNextBonus
                    .textContent =
                    'Maximum ×2 biodiversity bonus reached for today.';

            } else {
                const target =
                    Number(
                        biodiversity
                            .nextTarget
                    );

                const remaining =
                    Math.max(
                        0,
                        target
                        - count
                    );

                biodiversityNextBonus
                    .textContent =
                    `Find ${remaining} more different ${
                        remaining === 1
                            ? 'species'
                            : 'species'
                    } today to reach ×${
                        formatMultiplier(
                            biodiversity
                                .nextMultiplier
                        )
                    }.`;
            }
        }
    }



    function renderNextGoal() {

        if (
            !nextGoalCard
        ) {
            return;
        }

        const player =
            getPlayerProgression();

        const nextGardenLevel =
            gardenProgression
                .nextLevel;


        if (
            nextGardenLevel
            != null
        ) {
            const cost =
                Number(
                    gardenProgression
                        .nextCost
                    || 0
                );

            const nextPlots =
                Number(
                    gardenProgression
                        .nextPlots
                    || gardenProgression
                        .unlockedPlots
                );

            const currentPlots =
                Number(
                    gardenProgression
                        .unlockedPlots
                    || 0
                );

            const percent =
                cost > 0

                    ? Math.min(
                        100,

                        Math.max(
                            0,
                            (
                                points
                                / cost
                            )
                            * 100
                        )
                    )

                    : 100;

            nextGoalTitle
                .textContent =
                `Upgrade Garden → Level ${nextGardenLevel}`;

            nextGoalIcon
                .innerHTML =
                '<i class="fas fa-seedling"></i>';

            nextGoalProgressFill
                .style
                .width =
                `${percent}%`;

            nextGoalProgressText
                .textContent =
                `${Math.min(
                    points,
                    cost
                ).toLocaleString()} / ${cost.toLocaleString()} coins`;

            nextGoalUnlocks
                .textContent =
                `Unlocks ${Math.max(
                    0,
                    nextPlots
                    - currentPlots
                )} more garden plots.`;

            if (
                points
                >= cost
            ) {
                nextGoalButton
                    .dataset
                    .action =
                    'upgrade';

                nextGoalButton
                    .innerHTML =
                    '<i class="fas fa-arrow-up"></i><span>Upgrade now</span>';

            } else {
                nextGoalButton
                    .dataset
                    .action =
                    'quests';

                nextGoalButton
                    .innerHTML =
                    '<i class="fas fa-map-signs"></i><span>Earn coins in quests</span>';
            }

            return;
        }

        if (
            player.next
        ) {
            const currentXp =
                Number(
                    player.xp
                    || 0
                );

            const targetXp =
                Number(
                    player.next
                        .minXp
                    || currentXp
                );

            const startXp =
                Number(
                    player.current
                        .minXp
                    || 0
                );

            const span =
                Math.max(
                    1,
                    targetXp
                    - startXp
                );

            const percent =
                Math.min(
                    100,

                    Math.max(
                        0,
                        (
                            (
                                currentXp
                                - startXp
                            )
                            / span
                        )
                        * 100
                    )
                );

            nextGoalTitle
                .textContent =
                `Reach Level ${player.next.level} · ${player.next.title}`;

            nextGoalIcon
                .innerHTML =
                '<i class="fas fa-compass"></i>';

            nextGoalProgressFill
                .style
                .width =
                `${percent}%`;

            nextGoalProgressText
                .textContent =
                `${currentXp.toLocaleString()} / ${targetXp.toLocaleString()} XP`;

            nextGoalUnlocks
                .textContent =
                nextUnlockCopy(
                    player.current
                        .level
                );

            nextGoalButton
                .dataset
                .action =
                'snap';

            nextGoalButton
                .innerHTML =
                '<i class="fas fa-camera"></i><span>Go exploring</span>';

            return;
        }

        nextGoalTitle
            .textContent =
            'Complete this week’s fieldwork';

        nextGoalIcon
            .innerHTML =
            '<i class="fas fa-calendar-week"></i>';

        nextGoalProgressFill
            .style
            .width =
            '100%';

        nextGoalProgressText
            .textContent =
            'Maximum garden and player rank reached';

        nextGoalUnlocks
            .textContent =
            (
                'Weekly and community quests '
                + 'keep earning coins and XP.'
            );

        nextGoalButton
            .dataset
            .action =
            'quests';

        nextGoalButton
            .innerHTML =
            '<i class="fas fa-map-signs"></i><span>View quests</span>';
    }


    async function upgradeGarden() {
        if (
            gardenProgression
                .nextLevel == null
        ) {
            showToast(
                'Your garden is already fully expanded.',
                'fa-circle-check'
            );

            return;
        }

        const cost =
            Number(
                gardenProgression
                    .nextCost
                || 0
            );

        if (
            points <
            cost
        ) {
            showToast(
                `You need ${cost} coins for the next garden upgrade.`,
                'fa-coins'
            );

            return;
        }

        if (gardenUpgradeButton) {
            gardenUpgradeButton
                .disabled =
                true;
        }

        try {
            const data =
                await api(
                    '/api/garden/upgrade',
                    {
                        method:
                            'POST'
                    }
                );

            points =
                Number(
                    data.points
                    || 0
                );

            gardenProgression = {
                ...gardenProgression,
                ...data.garden
            };

            renderEverything();

            scheduleSave();

            showToast(
                `Garden upgraded to Level ${gardenProgression.level}! ${gardenProgression.unlockedPlots} plots are now available.`,
                'fa-arrow-up'
            );

        } catch (error) {
            showToast(
                error.message,
                'fa-triangle-exclamation'
            );

        } finally {
            if (
                gardenUpgradeButton
                && gardenProgression
                    .nextLevel != null
            ) {
                gardenUpgradeButton
                    .disabled =
                    false;
            }
        }
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
                        ${unlocked
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

    async function pullGacha() {
        const player =
            getPlayerProgression();

        if (
            player.current.level
            < 2
        ) {
            showToast(
                'The Seed store unlocks at player Level 2.',
                'fa-lock'
            );

            return;
        }

        if (
            points < 60
        ) {
            showToast(
                'You need 60 coins to open a seed packet.',
                'fa-coins'
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
                    +${config.points} XP
                </div>

                <div class="result-note">
                    ${alreadyUnlocked
                ? 'Already in your collection — XP is still awarded.'
                : 'Tap a garden plot on Home to place it.'
            }
                </div>

            </div>
        `;

        try {
            const data = await api('/api/quests/event', {
                method: 'POST',
                body: JSON.stringify({ event: 'gacha' })
            });
            points += Number(data.questUpdate?.reward || 0);
            if (data.questUpdate?.completed?.length) {
                showToast(`Quest complete! +${data.questUpdate.reward} coins.`, 'fa-map-signs');
            }
        } catch (error) {
            console.error('Could not update quest progress:', error);
        }

        renderEverything();

        scheduleSave();
        await loadQuests();

        showToast(
            alreadyUnlocked
                ? `${plant.name} was already unlocked — +${config.points} XP.`
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
                    'Djilba could not open the camera.'
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
            '<i class="fas fa-check"></i> Use photo <span>+10 XP · +15 coins</span>';


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
        cameraStatus.textContent = 'Getting your current location...';
        cameraStatus.classList.remove('hidden');

        try {
            const location = await getCurrentLocation();
            cameraStatus.textContent = 'Identifying and logging your plant...';
            const imageBlob = await fetch(capturedImageData).then(response => response.blob());
            const formData = new FormData();
            formData.append('image', imageBlob, 'djilba-snap.jpg');
            formData.append('latitude', String(location.latitude));
            formData.append('longitude', String(location.longitude));
            formData.append('accuracy', String(location.accuracy || 0));

            const data = await api('/api/identify', {
                method: 'POST',
                body: formData
            });
            const identification = data.identification;

            identifiedPlantName.textContent = identification.common_name || identification.scientific_name;
            identifiedPlantDetails.textContent = identification.common_name
                ? identification.scientific_name
                : 'Djilba field-note match';
            cameraIdentification.classList.remove('hidden');
            cameraStatus.classList.add('hidden');

            const questCoins =
                Number(
                    data.questUpdate?.reward
                    || 0
                );

            const questXp =
                Number(
                    data.questUpdate?.xp_reward
                    || 0
                );

            const reward =
                data.reward
                || {};

            const rewardCoins =
                Number(
                    reward.coins
                    || 0
                );

            const rewardXp =
                Number(
                    reward.xp
                    || 0
                );

            // Flask now returns the authoritative
            // post-snap balances.

            if (
                data.balance
            ) {
                points =
                    Number(
                        data.balance.coins
                        ?? points
                    );

                score =
                    Number(
                        data.balance.xp
                        ?? score
                    );
            }

            if (
                data.biodiversity
            ) {
                biodiversity = {
                    ...biodiversity,
                    ...data.biodiversity
                };
            }

            updateStats();
            renderProgression();
            renderBiodiversity();

            usePhotoButton.innerHTML =
                `<i class="fas fa-check"></i> Logged <span>+${rewardXp} XP · +${rewardCoins} coins</span>`;

            if (data.observation) {
                mapPlants = [
                    data.observation,
                    ...mapPlants.filter(item => item.id !== data.observation.id)
                ];
                renderMapPlants({ focusObservation: data.observation });
            } else {
                await loadMapPlants();
            }

            const remaining = Number(data.remaining_at_location);
            const remainingText = Number.isFinite(remaining)
                ? ` ${remaining} more of this species can be logged near here.`
                : '';
            const rewardLabel =
                reward.label
                || 'Biodiversity sighting';

            const multiplierText =
                Number(
                    reward.multiplier
                    || 1
                ) > 1

                    ? ` ×${formatMultiplier(
                        reward.multiplier
                    )} streak bonus!`

                    : '';

            const questText =
                (
                    questCoins
                    || questXp
                )

                    ? ` Quest bonus: +${questCoins} coins${questXp ? ` and +${questXp} XP` : ''}.`

                    : '';

            showToast(
                `${rewardLabel}: +${rewardXp} XP and +${rewardCoins} coins.${multiplierText}${questText}${remainingText}`,
                'fa-location-dot'
            );
            await loadQuests();

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
        usePhotoButton.innerHTML = '<i class="fas fa-check"></i> Use photo <span>+10 XP · +15 coins</span>';
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
        const player =
            getPlayerProgression();

        const wildlifeUnlocked =
            player.current.level
            >= 3;

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

                    button.disabled =
                        !owned
                        && !wildlifeUnlocked;

                    button.classList.toggle(
                        'level-locked',
                        !owned
                        && !wildlifeUnlocked
                    );

                    cost.textContent =
                        owned
                            ? 'Owned ✓'
                            : wildlifeUnlocked
                                ? `${button.dataset.cost} coins`
                                : 'Unlocks Level 3';
                }
            );
    }

    function buyDecor(button) {
        const player =
            getPlayerProgression();

        if (
            player.current.level
            < 3
        ) {
            showToast(
                'Wildlife unlocks at player Level 3.',
                'fa-lock'
            );

            return;
        }

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
                `You need ${cost} coins for this wildlife unlock.`,
                'fa-coins'
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
            points: `Have ${quest.target_value} coins`,
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
                        <strong>${Number(row.score || 0)} XP</strong>
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
                            <option value="points">Coins target</option>
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
        }

        if (
            viewId ===
            'achievementsView'
        ) {
            loadAchievements();
        }

        if (viewId === 'questsView') {
            loadQuests();
        }

        if (viewId === 'mapView') {
            loadMapPlants({ fitBounds: true });
            setTimeout(() => leafletMap?.invalidateSize(), 0);
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
                    <span class="achievement-points">+${ach.points} XP</span>
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

        redeemSpecialQuestButton.addEventListener(
            'click',
            redeemSpecialQuest
        );

        createSpecialQuestButton.addEventListener(
            'click',
            createSpecialQuest
        );

        addSpecialTaskButton.addEventListener(
            'click',
            addSpecialTask
        );

        specialTaskList.addEventListener(
            'click',
            event => {
                const removeButton = event.target.closest('.remove-special-task');
                if (!removeButton) return;
                if (specialTaskList.children.length === 1) {
                    showToast('Keep at least one task in the quest.', 'fa-list-check');
                    return;
                }
                removeButton.closest('.special-task-row').remove();
            }
        );

        scanSpecialQuestButton.addEventListener(
            'click',
            scanSpecialQuest
        );

        closeQrScanButton.addEventListener(
            'click',
            closeQrScanner
        );

        qrScanBackdrop.addEventListener(
            'click',
            event => {
                if (event.target === qrScanBackdrop) {
                    closeQrScanner();
                }
            }
        );

        specialQuestCodeInput.addEventListener(
            'keydown',
            event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    redeemSpecialQuest();
                }
            }
        );

        dailyQuestList.addEventListener('click', event => {

            const questCard =
                event.target.closest(
                    '.daily-quest-card.claimable'
                );

            if (
                questCard
            ) {
                claimDailyQuest(
                    questCard
                        .dataset
                        .questKey
                );
            }
        });

        if (
            weeklyQuestList
        ) {
            weeklyQuestList.addEventListener(
                'click',
                event => {

                    const questCard =
                        event.target.closest(
                            '.weekly-quest-card.claimable'
                        );

                    if (
                        questCard
                    ) {
                        claimWeeklyQuest(
                            questCard
                                .dataset
                                .questKey
                        );
                    }
                }
            );
        }

        if (
            communityQuestCard
        ) {
            communityQuestCard.addEventListener(
                'click',
                event => {

                    const claimButton =
                        event.target.closest(
                            '.community-claim-btn'
                        );

                    if (
                        claimButton
                    ) {
                        claimCommunityMilestone(
                            claimButton
                                .dataset
                                .communityTarget
                        );
                    }
                }
            );
        }

        specialQuestList.addEventListener('click', event => {
            const deleteButton = event.target.closest('.special-quest-delete');
            if (deleteButton) {
                deleteSpecialQuest(deleteButton.dataset.specialQuestId);
            }
        });

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

        if (locateMeButton) {
            locateMeButton.addEventListener('click', locateOnMap);
        }

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

        if (gardenUpgradeButton) {
            gardenUpgradeButton.addEventListener(
                'click',
                upgradeGarden
            );
        }

        if (
            nextGoalButton
        ) {
            nextGoalButton.addEventListener(
                'click',
                () => {

                    const action =
                        nextGoalButton
                            .dataset
                            .action;

                    if (
                        action
                        === 'upgrade'
                    ) {
                        upgradeGarden();
                        return;
                    }

                    if (
                        action
                        === 'snap'
                    ) {
                        snapPlant();
                        return;
                    }

                    navigateTo(
                        'questsView'
                    );
                }
            );
        }

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