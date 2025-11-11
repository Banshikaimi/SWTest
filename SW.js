// ==========================
// 📺 SUMMONER'S WAR STREAMERS (FR)
// ==========================
// Données statiques pour les pages
const pages = {
  home: `
  <h1>Summoner's War : Sky Arena</h1>
  <p class="intro">Le RPG stratégique aux combats intenses et aux monstres légendaires</p>
  <div class="container">
    <p class="description">
      <strong>Summoner's War: Sky Arena</strong> est un jeu mobile développé par <strong>Com2uS</strong>
      où les joueurs invoquent, entraînent et affrontent des monstres dans des batailles stratégiques en 3D.
      Avec plus de <strong>1500 monstres</strong> à collectionner et un vaste contenu PvE et PvP,
      il s’impose comme une référence du jeu mobile compétitif.
      <br><br>
      <strong>Caractéristiques principales :</strong><br>
      🌀 Invoque des monstres de 5 éléments (Eau, Feu, Vent, Lumière, Ténèbres)<br>
      ⚔️ Participe à des guerres de guildes et arènes mondiales<br>
      🏰 Explore le Sky Island et les donjons légendaires
    </p>
  </div>
`,

  types: `
    <h2>Attributs des monstres</h2>
    <p>Les monstres sont répartis en 5 types élémentaires : Eau, Feu, Vent, Lumière et Ténèbres. Chaque type a ses forces et faiblesses stratégiques.</p>
    <img src="https://static.wikia.nocookie.net/summoners-war-sky-arena/images/9/94/Property_Relationships.png" alt="Attributs">
  `,
  modes: `
    <h2>Modes de jeu</h2>
    <p>Le jeu propose plusieurs modes : PvE, arène PvP, guerres de guildes, siège interserveur, et tour des épreuves.</p>
    <img src="https://clan.fastly.steamstatic.com/images/44752586/40c88f023b197abef1a5bcdd45238902d50028cc_400x225.jpg" alt="Modes">
  `,
  tutos: `
    <h2>Tutoriels</h2>
    <p>Apprends à runer tes monstres, optimiser ton équipe et progresser rapidement grâce aux tutoriels communautaires.</p>
    <img src="https://i.ytimg.com/vi/kk77A8JWHlg/maxresdefault.jpg" alt="Tutos">
  `,
  community: `
    <div id="dynamic-content">
      <div id="streamers-list"></div>
    </div>
  `
};

// ==========================
// 🔧 Variables globales
// ==========================
let updateInterval;
let isUpdating = false;

// ==========================
// 🧩 Menu Hamburger
// ==========================
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerIcon = document.getElementById('hamburgerIcon');
  const sidebar = document.getElementById('sidebar');
  hamburgerIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    sidebar.classList.toggle('active');
    hamburgerIcon.classList.toggle('active');
  });
  // Ferme le menu si on clique en dehors
  document.addEventListener('click', function(e) {
    if (!sidebar.contains(e.target) && !hamburgerIcon.contains(e.target)) {
      sidebar.classList.remove('active');
      hamburgerIcon.classList.remove('active');
    }
  });

  // Écouteurs pour les boutons du menu
  document.querySelectorAll('.sidebar-button').forEach(button => {
    button.addEventListener('click', function() {
      const page = this.getAttribute('data-page');
      changePage(page);
      sidebar.classList.remove('active');
      hamburgerIcon.classList.remove('active');
    });
  });
});

// ==========================
// 🔧 Fonction pour changer de page
// ==========================
function changePage(pageName) {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = pages[pageName] || pages.home;
  // Si c'est la page communauté, on lance la récupération des streameurs
  if (pageName === 'community') {
    showCommunityStreamers();
  }
}

// ==========================
// 📺 Récupération des streams francophones
// ==========================
async function fetchFrenchSummonersWarStreamers() {
  const clientId = 'qb3hhsv34cjcy264bo0tocei4v6gp8';
  const accessToken = 'qwhrtj3s47bg95itrkjp2jykrti61c';
  const gameId = '50826'; // ID fallback
  try {
    const response = await fetch(`https://api.twitch.tv/helix/streams?game_id=${gameId}&language=fr&first=100`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!response.ok) throw new Error(`Erreur API Twitch: ${response.status}`);
    const data = await response.json();
    return data.data.map(stream => ({
      name: stream.user_login,
      displayName: stream.user_name,
      twitchUrl: `https://www.twitch.tv/${stream.user_login}`,
      viewerCount: stream.viewer_count,
      thumbnailUrl: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
      title: stream.title
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des streams :", error);
    return [];
  }
}

// ==========================
// 🌐 Affichage des streameurs
// ==========================
async function showCommunityStreamers() {
  if (isUpdating) return;
  isUpdating = true;
  const streamersList = document.getElementById('streamers-list');
  streamersList.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Chargement des streameurs Summoner's War FR...</p>
    </div>
  `;
  const streamers = await fetchFrenchSummonersWarStreamers();
  let streamersHTML = `
    <h3>🔴 Streameurs Summoner's War (FR)</h3>
    <div class="streamers-list">
  `;
  if (streamers.length === 0) {
    streamersHTML += `<p>Aucun streameur francophone en live actuellement 😢</p>`;
  } else {
    streamers.forEach(streamer => {
      streamersHTML += `
        <div class="streamer-card online">
          <a href="${streamer.twitchUrl}" target="_blank" class="streamer-link">
            <div class="streamer-thumbnail-container">
              <img src="${streamer.thumbnailUrl}" alt="${streamer.displayName}" class="streamer-thumbnail" loading="lazy">
              <div class="live-badge">LIVE</div>
            </div>
            <div class="streamer-info">
              <h4>${streamer.displayName}</h4>
              <p class="streamer-title">${streamer.title}</p>
              <p class="streamer-viewers">${streamer.viewerCount} viewers</p>
            </div>
          </a>
        </div>
      `;
    });
  }
  streamersHTML += `</div>`;
  streamersList.innerHTML = streamersHTML;
  startAutoUpdate();
  isUpdating = false;
}

// ==========================
// 🔄 Rafraîchissement auto
// ==========================
function startAutoUpdate() {
  stopAutoUpdate();
  updateInterval = setInterval(showCommunityStreamers, 30000);
}
function stopAutoUpdate() {
  if (updateInterval) clearInterval(updateInterval);
}

// ==========================
// 🚀 Démarrage automatique
// ==========================
document.addEventListener('DOMContentLoaded', () => changePage('home'));
