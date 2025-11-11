const contentData = {
  types: {
    text: "Les monstres sont répartis en 5 types élémentaires : Eau, Feu, Vent, Lumière et Ténèbres. Chaque type a ses forces et faiblesses stratégiques.",
    img: "https://static.wikia.nocookie.net/summoners-war-sky-arena/images/9/94/Property_Relationships.png/revision/latest/scale-to-width-down/340?cb=20140703112332"
  },
  modes: {
    text: "Le jeu propose plusieurs modes : PvE, arène PvP, guerres de guildes, siège interserveur, et tour des épreuves.",
    img: "https://clan.fastly.steamstatic.com/images/44752586/40c88f023b197abef1a5bcdd45238902d50028cc_400x225.jpg"
  },
  tutos: {
    text: "Apprends à runer tes monstres, optimiser ton équipe et progresser rapidement grâce aux tutoriels communautaires, notamment les vidéos du grand et célèbre Le_Shiro.",
    img: "https://i.ytimg.com/vi/kk77A8JWHlg/maxresdefault.jpg"
  }
};

function showContent(key) {
  const section = document.getElementById('dynamic-content');
  const text = document.getElementById('content-text');
  text.textContent = contentData[key].text;
  const imageContainer = document.getElementById('image-wrapper');
  if (key === 'tutos') {
    imageContainer.innerHTML = `
      <a href="https://www.youtube.com/@Le_Shiro" target="_blank">
        <img id="content-image" src="${contentData[key].img}" alt="Illustration" />
      </a>
    `;
  } else {
    imageContainer.innerHTML = `
      <img id="content-image" src="${contentData[key].img}" alt="Illustration" />
    `;
  }
  section.classList.remove('hidden');
}



async function showStreamers() {
  const dynamicContent = document.getElementById('dynamic-content');
  const contentText = document.getElementById('content-text');
  const imageWrapper = document.getElementById('image-wrapper');

  // Affiche un message de chargement
  contentText.textContent = "Chargement des streameurs Twitch...";
  imageWrapper.innerHTML = '';
  dynamicContent.classList.remove('hidden');

  try {
    // Récupère les streameurs via l'API Twitch (nécessite une clé API)
    const clientId = 'TU_DOIS_REMPLACER_PAR_TA_CLE_API_TWITCH'; // Remplace par ta clé API Twitch
    const gameId = '50826'; // ID du jeu Summoner's War: Sky Arena sur Twitch
    const response = await fetch(`https://api.twitch.tv/helix/streams?game_id=${gameId}&first=20`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': 'Bearer TON_TOKEN_D_ACCES' // Remplace par un token d'accès valide
      }
    });

    const data = await response.json();
    const frCaStreamers = data.data.filter(streamer =>
      streamer.language === 'fr' ||
      streamer.language === 'fr-CA' ||
      streamer.title.toLowerCase().includes('québec')
    );

    if (frCaStreamers.length === 0) {
      contentText.textContent = "Aucun streameur francophone ou québécois trouvé pour Summoner's War: Sky Arena.";
      return;
    }

    // Affiche les streameurs
    let streamersHTML = '<h3>Streameurs Twitch (FR & Québec) :</h3><ul>';
    frCaStreamers.forEach(streamer => {
      streamersHTML += `
        <li>
          <a href="https://www.twitch.tv/${streamer.user_login}" target="_blank" style="color: #ffd700;">
            ${streamer.user_name} (${streamer.viewer_count} viewers)
          </a>
        </li>
      `;
    });
    streamersHTML += '</ul>';
    contentText.innerHTML = streamersHTML;
    imageWrapper.innerHTML = `
      <img src="https://static-cdn.jtvnw.net/ttv-boxart/Summoners%20War:%20Sky%20Arena-285x380.jpg" alt="Summoner's War" style="max-width: 200px;">
    `;

  } catch (error) {
    console.error("Erreur lors de la récupération des streameurs :", error);
    contentText.textContent = "Impossible de charger les streameurs. Veuillez réessayer plus tard.";
  }
}
