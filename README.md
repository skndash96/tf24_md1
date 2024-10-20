# Transfinitte 2024 MD1
    
Create a system that uses MongoDB change streams to power real-time analytics dashboards. The solution should handle data aggregation from multiplecollections, process real-time updates, and deliver insights within second.

# Usage
1. Clone this Repo
2. Run `npm install`
3. Run `npm run build`
4. Create a `.env` file and add the `MONGODB_URI` connection URI
5. For development mode, Run `npm run start`
6. Set `NODE_ENV=production`
7. Run `npm run prod`

# Tech Stack
Next JS - Frontend and Serverless API routes
Socket IO - Websocket connections for real-time communication
Mongo DB - Remote NoSQL Database
Tailwind CSS - Frontend CSS Framework
Shadcn Components - Frontend Components
Look at `./package.json` for a detailed list

# Overview
- `/login` - Signup/Login page.
- `/api/auth/signup`, `/api/auth/login` - API routes for handling auth
- `/user` - Buy Products and Buy subscription
- `/dashboard` - Admin Only Page. Shows Dashboard of MongoDB data

## Collections
users
```
{
    _id
    name
    email
    password //hash
    createdAt
}
```
items
```
{
    _id
    name
    price
}
```
sales
```
{
    _id
    itemId
    userId
    price
    createdAt
}
```

subscriptions
```
{
    _id
    userId
    planName
    createdAt
}
```

# Transfinitte Details

> Team Name: Hack Overflow

> Team Members: Dash Skndash, Mevan, Gaurav, Dhanwant, Premesh.

> Project Code: MD1

Project Overview: MongoDB system to handle real-time updates and provide insights in seconds.

Idea/Approach: Connecting Next.js to MongoDB, we created a web application (Dashboard) capable of handling real-time updates from multiple collections.

Requesting data from MongoDB using PyMongo library and feeding it to a gen ai / LLM like Gemini to highly enhance user experience and sharing data to the web app using server calls.

Use Cases: 
    - Sales Dashboard: Track sales metrics in real-time. 
    - Inventory Management: Monitor inventory levels and stock movements.
    - Customer Behavior Analysis: Analyze customer interactions and website traffic.