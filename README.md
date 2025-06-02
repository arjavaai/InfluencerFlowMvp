# InfluencerFlow AI Platform

A comprehensive two-sided influencer marketing platform that streamlines campaign management and financial transactions through intelligent creator discovery, collaboration, and performance tracking.

## Overview

InfluencerFlow is a full-stack web application designed for the Indian market, featuring authentic creator profiles and Indian Rupee (₹) currency integration. The platform connects brands with influencers across various niches including travel, food, tech, sports, and education.

## Features

### For Brands
- **Creator Discovery**: Search and filter from a curated database of verified Indian influencers
- **Campaign Management**: Create, manage, and track influencer marketing campaigns
- **Offer Management**: Send collaboration offers to creators with custom terms
- **Contract Generation**: Automated contract creation and digital signing
- **Payment Processing**: Integrated Stripe payment gateway with INR support
- **Performance Analytics**: Track campaign ROI, reach, engagement, and performance metrics
- **Reports Dashboard**: Comprehensive campaign performance reports

### For Creators
- **Profile Management**: Showcase skills, niche, follower count, and engagement rates
- **Offer Management**: Receive, review, accept, or counter brand offers
- **Contract Management**: View and sign contracts digitally
- **Earnings Tracking**: Monitor payment history and pending earnings
- **Performance Insights**: Track campaign performance and engagement metrics

### Technical Features
- **Responsive Design**: Mobile-friendly interface across all screen sizes
- **Dark Theme**: Modern glassmorphism design with purple/pink gradients
- **Real-time Updates**: Live data synchronization across dashboards
- **Secure Authentication**: Role-based access control for brands and creators
- **Payment Integration**: Stripe payment processing with Indian market support

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for data fetching and state management
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Wouter** for client-side routing
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** (Neon) for data storage
- **Stripe** for payment processing
- **Passport.js** for authentication

### Database Schema
- Users, Creators, and Brands management
- Campaigns, Offers, and Contracts workflow
- Payments and Performance Reports tracking
- Session management for authentication

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account for payment processing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd influencerflow-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

4. Set up the database:
```bash
npm run db:push
```

5. Seed the database with demo data:
```bash
curl -X POST http://localhost:5000/api/add-real-influencers
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── brand/      # Brand-specific components
│   │   │   ├── creator/    # Creator-specific components
│   │   │   └── ui/         # Base UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Application pages
├── server/                 # Backend Express application
│   ├── auth.ts             # Authentication logic
│   ├── db.ts               # Database connection
│   ├── routes.ts           # API route handlers
│   ├── storage.ts          # Data access layer
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Creators
- `GET /api/creators` - Get creators with filtering
- `POST /api/creators` - Create creator profile

### Campaigns
- `GET /api/campaigns` - Get brand campaigns
- `POST /api/campaigns` - Create new campaign

### Offers
- `GET /api/offers` - Get offers (filtered by user role)
- `POST /api/offers` - Send offers to creators

### Contracts
- `GET /api/contracts` - Get contracts
- `POST /api/contracts` - Generate contract from offer

### Payments
- `GET /api/payments` - Get payment history
- `POST /api/create-payment-intent` - Create Stripe payment
- `PUT /api/payments/:id/mark-paid` - Mark payment as completed

## Demo Data

The platform includes authentic Indian influencer data across multiple niches:

- **Travel**: Dimpi Sanghvi (5M followers), Shashank Sanghvi (3.4M), Shakir Subhan (2.3M)
- **Food**: Pooja Dhingra (7M), Shipra Khanna (6.2M), Vikas Khanna (5.4M)
- **Sports**: Neeraj Chopra (8.4M followers)
- **Tech**: Gaurav Chaudhary (6.1M), Shlok Srivastava (4.6M)
- **Education**: Dhruv Rathee (14M), Alakh Pandey (4M)

## Deployment

The application is designed to run on Replit with automatic deployment capabilities. For production deployment:

1. Configure environment variables in your hosting platform
2. Set up PostgreSQL database
3. Configure Stripe webhooks for payment processing
4. Deploy using `npm run build` and serve the built files

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact the development team or create an issue in the repository.

---

Built with ❤️ for the Indian influencer marketing ecosystem.