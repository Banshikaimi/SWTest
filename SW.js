// ==========================
// 📺 SUMMONER'S WAR STREAMERS (FR)
// ==========================
// Données statiques pour les attributs, modes et tutos
const contentData = {
  types: {
    text: "Les monstres sont répartis en 5 types élémentaires : Eau, Feu, Vent, Lumière et Ténèbres. Chaque type a ses forces et faiblesses stratégiques.",
    img: "https://static.wikia.nocookie.net/summoners-war-sky-arena/images/9/94/Property_Relationships.png"
  },
  modes: {
    text: "Le jeu propose plusieurs modes : PvE, arène PvP, guerres de guildes, siège interserveur, et tour des épreuves.",
    img: "https://clan.fastly.steamstatic.com/images/44752586/40c88f023b197abef1a5bcdd45238902d50028cc_400x225.jpg"
  },
  tutos: {
    text: "Apprends à runer tes monstres, optimiser ton équipe et progresser rapidement grâce aux tutoriels communautaires.",
    img: "https://i.ytimg.com/vi/kk77A8JWHlg/maxresdefault.jpg"
  }
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

  hamburgerIcon.addEventListener('click', function() {
    sidebar.classList.toggle('active');
    hamburgerIcon.classList.toggle('active');
  });
});
// ==========================
// 🔧 Fonctions d'affichage
// ==========================
function showContent(type) {
  const dynamicContent = document.getElementById('dynamic-content');
  const contentText = document.getElementById('content-text');
  const imageWrapper = document.getElementById('image-wrapper');

  if (contentData[type]) {
    contentText.innerHTML = `<p>${contentData[type].text}</p>`;
    imageWrapper.innerHTML = `<img src="${contentData[type].img}" alt="${type}">`;
    dynamicContent.classList.remove('hidden');
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
// 🌐 Affichage automatique
// ==========================
async function showCommunityStreamers() {
  if (isUpdating) return;
  isUpdating = true;
  const dynamicContent = document.getElementById('dynamic-content');
  const contentText = document.getElementById('content-text');
  const imageWrapper = document.getElementById('image-wrapper');
  contentText.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Chargement des streameurs Summoner's War FR...</p>
    </div>
  `;
  imageWrapper.innerHTML = '';
  dynamicContent.classList.remove('hidden');
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
  contentText.innerHTML = streamersHTML;
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
document.addEventListener('DOMContentLoaded', showCommunityStreamers);
