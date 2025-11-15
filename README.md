# LRC-Connect

LRC-Connect is a comprehensive management system for a library resource center, featuring a powerful web interface for administration and a versatile mobile application for users.

## Live Demo

You can view a live demo of the application at [lrc-connect.vercel.app](https://lrc-connect.vercel.app).

## Description

This project is a full-stack application designed to modernize library management. It provides a web-based dashboard for librarians to manage resources, users, and transactions, and a mobile app for patrons to interact with the library's services.

The platform integrates three distinct AI features:

- **General AI:** For answering general user queries.
- **Reading AI:** To assist with textual resources.
- **Resources AI:** To help users discover materials.

## Features

### Web Application

- **Dashboard:** Analytics and statistics for various library metrics.
- **Resource Management:** Add, edit, and manage books, computers, and other materials.
- **User Management:** Manage patron and administrator accounts.
- **Transaction Control:** Handle borrowing, returning, and renewing of resources.
- **Reporting:** Generate reports for audits and statistics.
- **News and Announcements:** Keep users informed about library events.

### Mobile Application

- **Location-based Entry/Exit:** A smart entry and exit system that functions only when the user is physically inside the library.
- **QR Code Scanner:** Easily access information about transactions, resources, and users by scanning QR codes.
- **Remote Control:** Control the web application using the mobile app's scanner for a seamless, interactive experience.
- **AI Assistants:** Access the General, Reading, and Resources AI on the go.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database:** [Firebase](https://firebase.google.com/)
- **Maps:** [Google Maps API](https://developers.google.com/maps)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm (or yarn) installed on your machine.
- A Firebase project set up.

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/enzocu/LRC-Connect.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables. Create a `.env.local` file in the root of the project and add your Firebase configuration keys.

### Running the Application

To run the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

To create a production build:

```sh
npm run build
```

To start the production server:

```sh
npm run start
```
