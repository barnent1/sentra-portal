# Sentra Portal

A modern web portal built with Next.js 14, TypeScript, and Docker for easy deployment and scalability.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Docker** support for containerized deployments
- **CI/CD** with GitHub Actions
- **Multiple deployment options** (Fly.io, Railway, Self-hosted)
- **Code quality tools** (ESLint, Prettier, Husky)
- **Environment-based configuration**

## Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Docker (for containerized development/deployment)
- Git

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd sentra-portal
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Docker Development

1. Build and run with Docker Compose:
```bash
docker-compose up
```

2. Access the application at [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests

## Project Structure

```
sentra-portal/
├── .github/            # GitHub Actions workflows
├── .husky/             # Git hooks
├── deployment/         # Deployment scripts
├── public/             # Static assets
├── src/                # Source code
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── lib/            # Utility functions
│   └── styles/         # Global styles
├── .env.example        # Environment variables template
├── .eslintrc.json      # ESLint configuration
├── .prettierrc         # Prettier configuration
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Docker image definition
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
```

## Environment Variables

See `.env.example` for all available environment variables. Key variables include:

- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - Database connection string
- `API_URL` - Backend API URL
- `JWT_SECRET` - JWT token secret

## Deployment

### Fly.io

```bash
npm run deploy:fly
```

### Railway

```bash
npm run deploy:railway
```

### Self-hosted

```bash
npm run deploy:docker
```

See the `deployment/` directory for platform-specific deployment scripts.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Style

This project uses ESLint and Prettier for code formatting. Pre-commit hooks are set up with Husky to ensure code quality.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@sentra.com or join our Slack channel.
