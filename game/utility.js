// Utility functions

// Function to broadcast data to all clients
function broadcastToAllClients(data) {
    wsServer.clients.forEach(client => {
        // if they have open connection
        if (client.readyState === WebSocket.OPEN) {
            // send updated player list
            client.send(data);
        }
    });
}

module.exports = { broadcastToAllClients };