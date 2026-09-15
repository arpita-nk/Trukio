# Trukio

**Truck automation platform**

Trukio is an end-to-end warehouse and truck automation platform that streamlines everything from dock scheduling to fleet coordination — built to make yard operations simpler, faster, and less chaotic for the teams running them.

## Overview

Managing trucks, docks, and warehouse flow often means juggling spreadsheets, radios, and guesswork. Trukio brings it all into one system — automating scheduling, tracking inventory movement, and coordinating fleet activity in real time, so teams spend less time firefighting and more time moving freight.

## Key Features

- **Dock & yard scheduling** – Automatically assign and optimize dock slots, reducing truck idle time and yard congestion
- **Inventory tracking** – Real-time visibility into stock movement across the warehouse
- **Fleet & route coordination** – Track trucks, plan routes, and manage driver assignments from a single dashboard
- **End-to-end automation** – Connects warehouse operations and fleet logistics into one seamless workflow
- **Friendly, intuitive interface** – Designed for warehouse staff and dispatchers, not just engineers

## Project Structure

```
Trukio/
├── Backend/     # Server-side application and APIs
├── Frontend/    # Client-side application
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn
- A database instance (if applicable — see Backend configuration)

> ⚠️ Update this section with the exact runtime, database, and any other dependencies your `Backend` and `Frontend` folders actually require.

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/arpita-nk/Trukio.git
   cd Trukio
   ```

2. Install backend dependencies
   ```bash
   cd Backend
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../Frontend
   npm install
   ```

### Running the App

1. Start the backend server
   ```bash
   cd Backend
   npm start
   ```

2. Start the frontend
   ```bash
   cd Frontend
   npm start
   ```

3. Open your browser at `http://localhost:3000` (or whichever port your frontend runs on)

> Live demo is available `https://trukio.onrender.com/`

## Environment Variables

If your Backend requires configuration (database URL, API keys, ports, etc.), document them here, for example:

```
PORT=5000
DATABASE_URL=your_database_connection_string
```

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

## License

Specify your project's license here (e.g. MIT).
