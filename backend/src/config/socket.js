export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join branch-specific room
    socket.on('join-branch', (branchId) => {
      socket.join(`branch-${branchId}`);
      console.log(`Socket ${socket.id} joined branch-${branchId}`);
    });

    // Join user-specific room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`Socket ${socket.id} joined user-${userId}`);
    });

    // Handle POS events
    socket.on('pos-sale', (data) => {
      // Broadcast to branch room
      socket.to(`branch-${data.branchId}`).emit('new-sale', data);
    });

    // Handle inventory updates
    socket.on('inventory-update', (data) => {
      socket.to(`branch-${data.branchId}`).emit('inventory-changed', data);
    });

    // Handle transfer updates
    socket.on('transfer-update', (data) => {
      socket.to(`branch-${data.fromBranchId}`).emit('transfer-updated', data);
      socket.to(`branch-${data.toBranchId}`).emit('transfer-updated', data);
    });

    // Handle repair status updates
    socket.on('repair-update', (data) => {
      socket.to(`branch-${data.branchId}`).emit('repair-updated', data);
      if (data.customerId) {
        socket.to(`user-${data.customerId}`).emit('repair-notification', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Global emitter helper
  global.io = io;
}

export function emitToBranch(branchId, event, data) {
  if (global.io) {
    global.io.to(`branch-${branchId}`).emit(event, data);
  }
}

export function emitToUser(userId, event, data) {
  if (global.io) {
    global.io.to(`user-${userId}`).emit(event, data);
  }
}
