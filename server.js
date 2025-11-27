const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Configuration Twitch
const CLIENT_ID = 'TON_CLIENT_ID';
const CLIENT_SECRET = 'TON_CLIENT_SECRET';
let ACCESS_TOKEN = '';
let TOKEN_EXPIRES_AT = 0;

// Fonction pour obtenir un nouveau token
async function getNewAccessToken() {
  try {
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`
    );
    ACCESS_TOKEN = response.data.access_token;
    TOKEN_EXPIRES_AT = Date.now() + (response.data.expires_in * 1000);
    console.log('Nouveau token généré :', ACCESS_TOKEN);
  } catch (error) {
    console.error('Erreur lors de la génération du token :', error.message);
  }
}

// Middleware pour vérifier le token
async function checkToken(req, res, next) {
  if (Date.now() >= TOKEN_EXPIRES_AT || !ACCESS_TOKEN) {
    await getNewAccessToken();
  }
  next();
}

// Route pour récupérer les streameurs
app.get('/api/streamers', checkToken, async (req, res) => {
  try {
    const response = await axios.get('https://api.twitch.tv/helix/streams?game_id=50826', {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Erreur API Twitch :', error.message);
    res.status(500).json({ error: 'Erreur API Twitch' });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  getNewAccessToken(); // Génère un token au démarrage
});
