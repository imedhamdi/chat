import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let usersConnected = 0; // Compteur des utilisateurs connectés

// Servir le fichier HTML
app.use(express.static(path.join(__dirname, 'public'))); // Utilisation du dossier public pour le fichier index.html et les assets

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fonction de traduction
async function translateMessage(message, targetLang) {
  const fetch = (await import('node-fetch')).default; // Importation dynamique pour node-fetch
  const apiKey = 'YOUR_TRANSLATION_API_KEY'; // Remplace par ta clé API
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: message,
      target: targetLang
    })
  });
  const data = await response.json();
  return data.data.translations[0].translatedText;
}

// Gestion des connexions des utilisateurs
io.on('connection', (socket) => {
  let username = ''; // Nom d'utilisateur local pour chaque connexion
  let userLanguage = 'fr'; // Langue par défaut

  // Incrémentation des utilisateurs connectés
  usersConnected++;
  io.emit('user count', usersConnected); // Diffusion du nombre d'utilisateurs à tous les clients

  console.log('Un utilisateur est connecté, total:', usersConnected);

  // Réception et enregistrement du nom d'utilisateur et de la langue
  socket.on('set username', (data) => {
    username = data.username;
    userLanguage = data.language || 'fr'; // Langue par défaut si non spécifiée
    console.log(`Nom d'utilisateur défini: ${username}, Langue: ${userLanguage}`);
  });

  // Réception et diffusion des messages avec date et heure
  socket.on('chat message', async (data) => {
    const timestamp = new Date().toLocaleTimeString(); // Génération de l'heure actuelle

    // Traduction du message
    const translatedMessage = await translateMessage(data.msg, data.lang || 'fr');

    console.log(`${data.user} a envoyé un message: "${data.msg}" à ${timestamp}`);
    
    // Envoi du message avec l'heure aux autres clients
    io.emit('chat message', { 
      user: data.user, 
      msg: translatedMessage, 
      time: timestamp,
      lang: data.lang || 'fr' // Langue du message d'origine
    });
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log(`${username} s'est déconnecté`);
    usersConnected--; // Réduction du nombre d'utilisateurs connectés
    io.emit('user count', usersConnected); // Mise à jour du nombre d'utilisateurs
  });
});

server.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});
