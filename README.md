Overview

This is a real-time chat application built with Next.js, Socket.io, and Node.js/Express. Users can start conversations, send text and image messages, and receive updates in real-time.

Database Structure
Collections

Users

{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "passwordHash": "string",
  "createdAt": "Date"
}


Conversations

{
  "_id": "ObjectId",
  "participants": ["UserId1", "UserId2"],
  "createdAt": "Date",
  "updatedAt": "Date"
}


Messages

{
  "_id": "ObjectId",
  "conversationId": "ConversationId",
  "senderId": "UserId",
  "receiverId": "UserId",
  "text": "string",
  "imageUrl": "string (optional)",
  "createdAt": "Date"
}


- Relationships:

    A conversation links multiple participants (usually 2 for private chats).
    
    Messages are tied to a conversation and store sender/receiver info.

Technical Approach
1. Frontend

    Built with Next.js and React Hooks.
    
    Framer Motion for animations.
    
    Real-time updates using Socket.io client.
    
    Image uploads handled via <input type="file"> and FormData.

2. Backend

    Node.js/Express API.
    
    REST endpoints for users, conversations, and messages.
    
    Socket.io server emits/receives real-time events:
    
    addUser – register connected users
    
    sendMessage – broadcast new messages
    
    newConversation – notify participants of new chats

3. Real-time Workflow

    User connects → Socket registers them via addUser.
    
    Sending a message:
    
    Saved in database.
    
    Broadcast to the recipient via sendMessage.
    
    New conversations:
    
    Created via API.
    
    Emitted to participants via newConversation.

- Tech Stack

  Frontend: Next.js, React, TailwindCSS, Framer Motion, Socket.io-client
  
  Backend: Node.js, Express, Socket.io, MongoDB
  
