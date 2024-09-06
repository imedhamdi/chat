const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const usernameForm = document.getElementById('usernameForm');
const usernameInput = document.getElementById('usernameInput');
const usersConnected = document.getElementById('usersConnected');
const languageSelect = document.getElementById('languageSelect');
const setLangBtn = document.getElementById('setLangBtn');
let username = '';
let userLanguage = 'fr'; // Langue par défaut

// Configuration de la langue
setLangBtn.addEventListener('click', () => {
  userLanguage = languageSelect.value;
  // Optionnel: sauvegarde des préférences linguistiques
});

// Formulaire de connexion
usernameForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (usernameInput.value) {
    username = usernameInput.value;
    socket.emit('set username', { username, language: userLanguage });
    usernameForm.style.display = 'none';
    form.style.display = 'flex';
  }
});

// Envoi de messages
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    const messageData = {
      user: username,
      msg: input.value,
      time: new Date().toLocaleTimeString(),
      lang: userLanguage
    };
    socket.emit('chat message', messageData);
    input.value = '';
  }
});

// Réception des messages
socket.on('chat message', function(data) {
  // Optionnel: Traduire les messages en fonction de la langue de l'utilisateur
  translateMessage(data.msg, data.lang).then(translatedMessage => {
    const item = document.createElement('li');
    item.textContent = `${data.user}: ${translatedMessage} (${data.time})`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
});

// Mise à jour du nombre d'utilisateurs connectés
socket.on('user count', function(count) {
  usersConnected.textContent = `Utilisateurs connectés : ${count}`;
});

// Fonction de traduction
async function translateMessage(message, targetLang) {
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
