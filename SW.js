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

// Liste des streameurs FR/Québec jouant souvent à Summoner's War
const knownFrenchStreamers = [
  { name: "le_shiro", displayName: "Le_Shiro", twitchUrl: "https://www.twitch.tv/le_shiro" },
  { name: "summonerfr", displayName: "SummonerFR", twitchUrl: "https://www.twitch.tv/summonerfr" },
  { name: "quebecsw", displayName: "QuebecSW", twitchUrl: "https://www.twitch.tv/quebecsw" },
  { name: "summonerswarfr", displayName: "SummonersWarFR", twitchUrl: "https://www.twitch.tv/summonerswarfr" },
  { name: "sw_fr", displayName: "SW_FR", twitchUrl: "https://www.twitch.tv/sw_fr" },
  { name: "monstres_et_legendes", displayName: "MonstresEtLegendes", twitchUrl: "https://www.twitch.tv/monstres_et_legendes" }
];

// Variables globales
let updateInterval;
let isUpdating = false;

// Fonction pour afficher le contenu dynamique (attributs, modes, tutos)
function showContent(key) {
  const section = document.getElementById('dynamic-content');
  const text = document.getElementById('content-text');
  const imageContainer = document.getElementById('image-wrapper');

  text.innerHTML = contentData[key].text;
  imageContainer.innerHTML = `<img src="${contentData[key].img}" alt="Illustration" class="content-image">`;
  section.classList.remove('hidden');
}


// 🧩 Fonction pour récupérer dynamiquement l'ID du jeu "Summoner's War: Sky Arena"
async function getGameId(gameName = "Summoner's War: Sky Arena") {
  const clientId = 'TON_CLIENT_ID'; // Ton Client ID Twitch
  const accessToken = 'TON_ACCESS_TOKEN'; // Ton token d'accès Twitch

  try {
    const response = await fetch(`https://api.twitch.tv/helix/games?name=${encodeURIComponent(gameName)}`, {
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!response.ok) throw new Error(`Erreur API Twitch : ${response.status}`);

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      console.log(`✅ ID du jeu "${data.data[0].name}" : ${data.data[0].id}`);
      return data.data[0].id;
    } else {
      console.warn("⚠️ Jeu non trouvé dans l'API Twitch");
      return null;
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du Game ID :", error);
    return null;
  }
}


// Fonction pour récupérer les streameurs en live sur Summoner's War
async function fetchLiveStreamers() {
  const clientId = 'TON_CLIENT_ID'; // Remplace par ta clé API Twitch
  const accessToken = 'TON_ACCESS_TOKEN'; // Remplace par ton token d'accès
  const gameId = await getGameId("Summoner's War: Sky Arena") || '50826'; // Valeur de secours

  try {
    const response = await fetch(`https://api.twitch.tv/helix/streams?game_id=${gameId}&first=100`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) throw new Error(`Erreur API Twitch: ${response.status}`);
    const data = await response.json();

    // Filtre les streameurs FR/Québec
    return data.data.filter(streamer =>
      streamer.language === 'fr' || streamer.language === 'fr-CA'
    );

  } catch (error) {
    console.error("Erreur lors de la récupération des streameurs en live:", error);
    return [];
  }
}

// Fonction pour vérifier si un streameur spécifique est en live
async function checkStreamerStatus(streamerName) {
  const clientId = 'TON_CLIENT_ID'; // Remplace par ta clé API Twitch
  const accessToken = 'TON_ACCESS_TOKEN'; // Remplace par ton token d'accès

  try {
    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${streamerName}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) throw new Error(`Erreur API Twitch: ${response.status}`);
    const data = await response.json();
    return data.data[0] || null;

  } catch (error) {
    console.error(`Erreur pour ${streamerName}:`, error);
    return null;
  }
}

// Fonction pour afficher la communauté (live + hors ligne)
async function showCommunityStreamers() {
  if (isUpdating) return;
  isUpdating = true;

  const dynamicContent = document.getElementById('dynamic-content');
  const contentText = document.getElementById('content-text');
  const imageWrapper = document.getElementById('image-wrapper');

  // Affiche un spinner de chargement
  contentText.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Chargement des streameurs...</p>
    </div>
  `;
  imageWrapper.innerHTML = '';
  dynamicContent.classList.remove('hidden');

  // Récupère les streameurs en live
  const liveStreamers = await fetchLiveStreamers();

  // Vérifie le statut des streameurs habituels
  const knownStreamersWithStatus = await Promise.all(
    knownFrenchStreamers.map(async (streamer) => {
      const streamData = await checkStreamerStatus(streamer.name);
      return {
        ...streamer,
        isOnline: !!streamData,
        viewerCount: streamData ? streamData.viewer_count : "Hors ligne",
        thumbnailUrl: streamData ?
          streamData.thumbnail_url.replace('{width}', '320').replace('{height}', '180') :
          "https://static-cdn.jtvnw.net/ttv-boxart/Summoners%20War:%20Sky%20Arena-285x380.jpg",
        title: streamData ? streamData.title : "Hors ligne"
      };
    })
  );

  // Combine les streameurs en live et les streameurs habituels
  const allStreamers = [
    ...liveStreamers.map(streamer => ({
      name: streamer.user_login,
      displayName: streamer.user_name,
      twitchUrl: `https://www.twitch.tv/${streamer.user_login}`,
      isOnline: true,
      viewerCount: streamer.viewer_count,
      thumbnailUrl: streamer.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
      title: streamer.title
    })),
    ...knownStreamersWithStatus.filter(streamer =>
      !liveStreamers.some(live => live.user_login === streamer.name)
    )
  ];

  // Trie : en ligne d'abord
  allStreamers.sort((a, b) => b.isOnline - a.isOnline);

  // Génère le HTML
  let streamersHTML = `
    <h3>Streameurs Summoner's War (FR & Québec)</h3>
    <div class="streamers-list">
  `;

  allStreamers.forEach(streamer => {
    streamersHTML += `
      <div class="streamer-card ${streamer.isOnline ? 'online' : 'offline'}">
        <a href="${streamer.twitchUrl}" target="_blank" class="streamer-link">
          <div class="streamer-thumbnail-container">
            <img src="${streamer.thumbnailUrl}" alt="${streamer.displayName}" class="streamer-thumbnail" loading="lazy">
            ${streamer.isOnline ? `<div class="live-badge">LIVE</div>` : `<div class="offline-badge">HORS LIGNE</div>`}
          </div>
          <div class="streamer-info">
            <h4>${streamer.displayName}</h4>
            ${streamer.isOnline ?
              `<p class="streamer-title">${streamer.title}</p>
               <p class="streamer-viewers">${streamer.viewerCount} viewers</p>` :
              `<p class="streamer-offline">Habituellement sur Summoner's War</p>`}
          </div>
        </a>
      </div>
    `;
  });

  streamersHTML += `</div>`;
  contentText.innerHTML = streamersHTML;

  // Démarre la mise à jour automatique
  startAutoUpdate();
  isUpdating = false;
}

// Mise à jour automatique toutes les 30 secondes
function startAutoUpdate() {
  stopAutoUpdate();
  updateInterval = setInterval(showCommunityStreamers, 30000);
}

// Arrête la mise à jour automatique
function stopAutoUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

// Ajoute le CSS pour le spinner et les badges
const style = document.createElement('style');
style.textContent = `
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .spinner {
    border: 4px solid rgba(255, 215, 0, 0.3);
    border-radius: 50%;
    border-top: 4px solid #ffd700;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .live-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background-color: #ff0000;
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    z-index: 2;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  }
  .offline-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background-color: #555;
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    z-index: 2;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
  }
  .streamer-card.online {
    animation: pulse 2s infinite;
  }
`;
document.head.appendChild(style);
