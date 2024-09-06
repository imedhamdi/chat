const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); // Importer l'application depuis app.js

const port = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server);

let usersConnected = 0; // Variable pour compter les utilisateurs connectés

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  let username = ''; // Stocker le nom d'utilisateur pour chaque socket

  usersConnected++; // Augmenter le nombre d'utilisateurs connectés
  io.emit('user count', usersConnected); // Envoyer le nombre d'utilisateurs à tous les clients

  console.log('Un utilisateur est connecté');

  // Recevoir et enregistrer le nom d'utilisateur
  socket.on('set username', (name) => {
    username = name;
    console.log(`Nom d'utilisateur défini: ${username}`);
  });

  // Recevoir et diffuser les messages
  socket.on('chat message', (data) => {
    console.log(`${data.user} a envoyé un message: ${data.msg} à ${data.time}`);
    io.emit('chat message', { user: data.user, msg: data.msg, time: data.time }); // Diffuser le message avec l'heure
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log(`${username} s'est déconnecté`);
    usersConnected--; // Diminuer le nombre d'utilisateurs connectés
    io.emit('user count', usersConnected); // Mettre à jour le nombre d'utilisateurs connectés
  });
});

server.listen(port, () => {
  console.log(`Le serveur écoute sur le port ${port}`);
});
