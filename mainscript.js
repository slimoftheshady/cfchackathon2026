  (function() {
    // ---- state ----
    let points = 240;
    let plants = [
      { name: 'Monstera', icon: 'fa-leaf' },
      { name: 'Fern', icon: 'fa-feather' },
      { name: 'Succulent', icon: 'fa-cactus' },
      { name: 'Orchid', icon: 'fa-seedling' }
    ];
    const MAX_PLANTS = 16;

    const friends = [
      { name: 'Lena', icon: 'fa-flower', leaf: 8 },
      { name: 'Marco', icon: 'fa-tree', leaf: 12 },
      { name: 'Sofia', icon: 'fa-leaf', leaf: 5 },
      { name: 'Jamal', icon: 'fa-seedling', leaf: 20 }
    ];

    // DOM
    const plotGrid = document.getElementById('plotGrid');
    const pointSpan = document.getElementById('pointDisplay');
    const plantCounter = document.getElementById('plantCounter');
    const toast = document.getElementById('toastMessage');
    const snapBtn = document.getElementById('snapButton');
    const friendsGrid = document.getElementById('friendsGrid');
    const profilePlantCount = document.getElementById('profilePlantCount');
    const profilePoints = document.getElementById('profilePoints');

    // views & nav
    const views = {
      home: document.getElementById('homeView'),
      friends: document.getElementById('friendsView'),
      store: document.getElementById('storeView'),
      profile: document.getElementById('profileView')
    };
    const navBtns = document.querySelectorAll('.nav-btn');

    // ---- render garden ----
    function renderPlots() {
      plotGrid.innerHTML = '';
      for (let i = 0; i < MAX_PLANTS; i++) {
        const plot = document.createElement('div');
        plot.className = 'plot';
        if (i < plants.length) {
          const p = plants[i];
          plot.innerHTML = `<i class="fas ${p.icon}"></i><span class="plant-name">${p.name}</span>`;
          plot.style.background = '#2e5a2e';
          plot.style.backgroundImage = 'radial-gradient(circle at 30% 30%, #4d8a45, #1d3a1a)';
        } else {
          plot.classList.add('empty-plot');
          plot.innerHTML = `<i class="fas fa-plus-circle"></i><span style="font-size:10px;">empty</span>`;
        }
        plotGrid.appendChild(plot);
      }
      plantCounter.innerText = `${plants.length} / ${MAX_PLANTS}`;
      if (profilePlantCount) profilePlantCount.innerText = plants.length;
      if (profilePoints) profilePoints.innerText = points;
    }

    function updatePoints() {
      pointSpan.innerText = points;
      if (profilePoints) profilePoints.innerText = points;
    }

    // ---- toast ----
    function showToast(msg, icon = 'fa-spa') {
      toast.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
      clearTimeout(toast._timeout);
      toast._timeout = setTimeout(() => {
        toast.innerHTML = `<i class="fas fa-spa"></i> snap a plant to fill your garden!`;
      }, 3200);
    }

    // ---- snap ----
    function snapPlant() {
      if (plants.length >= MAX_PLANTS) {
        showToast('your garden is full! upgrade or trade plants 🌿', 'fa-exclamation-circle');
        return;
      }
      const names = ['Daisy', 'Rose', 'Tulip', 'Basil', 'Mint', 'Lavender', 'Aloe', 'Ivy', 'Palm', 'Ficus', 'Clover', 'Sage'];
      const icons = ['fa-leaf', 'fa-seedling', 'fa-tree', 'fa-feather', 'fa-cactus', 'fa-flower', 'fa-leaf', 'fa-seedling', 'fa-tree', 'fa-leaf', 'fa-seedling', 'fa-flower'];
      const idx = Math.floor(Math.random() * names.length);
      const newPlant = { name: names[idx], icon: icons[idx % icons.length] };
      plants.push(newPlant);
      points += 15;
      updatePoints();
      renderPlots();
      showToast(`+15 points! found ${newPlant.name} 🌱`, 'fa-camera');
      setTimeout(() => {
        toast.innerHTML = `<i class="fas fa-globe-americas"></i> biodiversity +1 · keep exploring!`;
      }, 2000);
    }

    // ---- buy ----
    function buyItem(item, cost) {
      if (points < cost) {
        showToast(`not enough points! need ${cost} ★`, 'fa-exclamation-circle');
        return;
      }
      points -= cost;
      updatePoints();
      if (plants.length < MAX_PLANTS) {
        const decoMap = { gnome: 'fa-frog', bench: 'fa-tree', lamp: 'fa-sun', fountain: 'fa-water', birdhouse: 'fa-dove', compost: 'fa-recycle' };
        const icon = decoMap[item] || 'fa-gem';
        plants.push({ name: item.charAt(0).toUpperCase() + item.slice(1), icon: icon });
        renderPlots();
        showToast(`✨ ${item} placed in your garden!`, 'fa-gem');
      } else {
        showToast(`garden full! can't place ${item}`, 'fa-exclamation-circle');
        points += cost;
        updatePoints();
        showToast(`refunded ${cost} points — garden full`, 'fa-undo');
      }
    }

    // ---- render friends ----
    function renderFriends() {
      friendsGrid.innerHTML = '';
      friends.forEach(f => {
        const card = document.createElement('div');
        card.className = 'friend-card';
        card.innerHTML = `
          <i class="fas ${f.icon}"></i>
          <div class="fname">${f.name}</div>
          <div class="leaf-count"><i class="fas fa-leaf"></i> ${f.leaf} plants</div>
        `;
        friendsGrid.appendChild(card);
      });
    }

    // ---- navigation ----
    function navigateTo(viewId) {
      // hide all views
      Object.values(views).forEach(v => v.classList.remove('active'));
      // show target
      const target = document.getElementById(viewId);
      if (target) target.classList.add('active');

      // update nav active
      navBtns.forEach(btn => {
        btn.classList.remove('active-tab');
        if (btn.dataset.view === viewId) {
          btn.classList.add('active-tab');
        }
      });
    }

    // ---- init ----
    function init() {
      renderPlots();
      updatePoints();
      renderFriends();

      snapBtn.addEventListener('click', snapPlant);

      // nav buttons
      navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const viewId = this.dataset.view;
          if (viewId) navigateTo(viewId);
        });
      });

      // store items
      document.querySelectorAll('.store-item').forEach(item => {
        item.addEventListener('click', function() {
          const cost = parseInt(this.dataset.cost, 10);
          const itemName = this.dataset.item;
          buyItem(itemName, cost);
        });
      });

      // click on plot -> conservation message
      plotGrid.addEventListener('click', function(e) {
        const plot = e.target.closest('.plot');
        if (plot && !plot.classList.contains('empty-plot')) {
          showToast('🌍 every plant helps biodiversity!', 'fa-globe-americas');
        }
      });

      setTimeout(() => {
        showToast('📸 tap SNAP to grow your garden!', 'fa-camera');
      }, 500);
    }

    init();
  })();