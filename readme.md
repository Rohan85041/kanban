# Kanaban Task Management

kanaban Task Management is a Kanban-style board application that allows users to register, log in, manage tasks, and track their progress. Built with a Node.js backend using Express and MongoDB, and a React.js frontend, this app is perfect for organizing tasks and projects efficiently.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Features

- User registration and authentication
- Create, read, update, and delete tasks
- Change task status (To Do, In Progress, Done)
- Set task priorities (low, medium, high)
- Assign due dates to tasks

## Technologies Used

- **Backend:** Node.js, Express, MongoDB, Mongoose, Joi, JWT, bcrypt
- **Frontend:** React.js, Axios (for API requests)

## Project Structure

```plaintext
Kanaban-task-management/
├── server/                # Backend folder
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies and scripts
└── frontend/              # Frontend folder (React app)
    ├── src/              # Source files for React app
    ├── public/           # Public assets
    └── package.json       # Frontend dependencies and scripts


Frontend Setup
#Install Dependencies: Ensure Node.js is installed, then run:

npm install

#Run the Frontend Application:

npm start

#backend setup
cd kanaban-task-management/server

#Install Dependencies: Ensure you have Node.js installed, then run:
npm install

#Run the Backend Server:
node server.js

The server will run at http://localhost:3000.
