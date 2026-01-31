# Azmoon-Saz Frontend

A modern exam builder platform built with Next.js 14, React 18, and Material UI. This frontend application provides a comprehensive interface for creating, managing, and distributing exams through partner websites.

## Features

### 🎯 Core Functionality
- **Exam Creation**: Build custom exams with questions from a question bank or create custom questions
- **Deep Link Integration**: Seamless integration with partner websites via deep links
- **Question Bank Management**: Comprehensive CRUD interface for managing questions and categories
- **PDF Generation**: Download exam PDFs after completion
- **RTL Support**: Full support for Persian/Farsi language with RTL layout

### 👥 User Roles
- **Partner Website Users**: Access via deep links to create and edit exams
- **Content Managers**: Manage the question bank and content
- **System Administrators**: Manage partners, users, and system settings

### 🎨 UI/UX Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Material UI Components**: Modern, accessible, and consistent design system
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Internationalization**: Support for English and Persian languages

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: Material UI (MUI) v7
- **Language**: TypeScript
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Emotion (CSS-in-JS) with RTL support
- **Icons**: Material UI Icons

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd azmonsaz-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
azmonsaz-frontend/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin panel pages
│   ├── exams/                    # Exam-related pages
│   │   └── create/              # Exam creation page
│   ├── questions/               # Question bank management
│   ├── partners/                # Partner management
│   ├── providers/               # React Query provider
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── LocaleSwitcher.tsx       # Language switcher
├── components/                   # Reusable components
│   ├── ExamQuestionList.tsx     # Exam question management
│   ├── PDFDownload.tsx          # PDF download functionality
│   └── QuestionSelector.tsx     # Question selection interface
├── lib/                         # Utility libraries
│   ├── api.ts                   # API client
│   ├── query-client.ts          # React Query configuration
│   └── validation.ts            # Zod validation schemas
├── theme/                       # MUI theme configuration
│   └── ThemeRegistry.tsx        # Theme provider with RTL support
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Core application types
└── public/                      # Static assets
```

## Key Components

### Exam Creation Flow
1. **Deep Link Access**: Users arrive via partner website deep links
2. **Question Selection**: Choose from question bank or create custom questions
3. **Exam Configuration**: Set title, description, and subject
4. **Question Management**: Add, edit, and arrange questions
5. **Completion**: Save exam and redirect to partner website with PDF link

### Question Bank Management
- **CRUD Operations**: Create, read, update, and delete questions
- **Categorization**: Organize questions by categories and tags
- **Difficulty Levels**: Easy, medium, and hard difficulty settings
- **Search & Filter**: Find questions by text, category, or difficulty
- **Bulk Operations**: Manage multiple questions efficiently

### Admin Panel
- **Partner Management**: Add, edit, and manage partner websites
- **User Management**: Create and manage user accounts and roles
- **System Settings**: Configure application-wide settings
- **Access Control**: Role-based permissions and restrictions

## API Integration

The application integrates with a Laravel backend API. Key endpoints include:

- **Exams**: `/api/exams` - CRUD operations for exams
- **Questions**: `/api/questions` - Question bank management
- **Partners**: `/api/partners` - Partner website management
- **Users**: `/api/users` - User account management
- **Categories**: `/api/question-categories` - Question categorization

## Deep Link Integration

Partner websites can integrate with the exam builder using deep links:

```
https://azmonsaz.com/exams/create?partner_id=123&callback_url=https://partner.com/callback&exam_id=456
```

Parameters:
- `partner_id`: Partner website identifier
- `callback_url`: URL to redirect after exam completion
- `exam_id`: (Optional) Existing exam ID for editing

## RTL Support

The application includes comprehensive RTL support for Persian/Farsi:

- **Automatic Detection**: Detects language from URL parameters or user preference
- **Theme Switching**: Switches between LTR and RTL layouts
- **Font Support**: Uses appropriate fonts for each language
- **Component Adaptation**: All MUI components adapt to RTL layout

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Code formatting (if configured)
- **Functional Components**: Use React hooks and functional components
- **Custom Hooks**: Extract reusable logic into custom hooks

### Testing

برای اطلاعات کامل درباره تست‌نویسی، به [TESTING_GUIDE.md](./TESTING_GUIDE.md) مراجعه کنید.

```bash
# Run tests in watch mode (recommended for development)
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run tests once (for CI/CD)
npm run test:run
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Static export or serverless functions
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment
- **Traditional Hosting**: Build and serve static files

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Azmoon-Saz` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Documentation

برای اطلاعات بیشتر، به مستندات زیر مراجعه کنید:

- **[STATUS_REPORT.md](./STATUS_REPORT.md)** - گزارش وضعیت پروژه و کارهای انجام شده
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - راهنمای کامل تست‌نویسی
- **[STORYBOOK_SETUP.md](./STORYBOOK_SETUP.md)** - راهنمای راه‌اندازی و استفاده از Storybook
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - راهنمای رفع مشکلات رایج
- **[MOCK_DATA_GUIDE.md](./MOCK_DATA_GUIDE.md)** - راهنمای استفاده از Mock Data
- **[PACKAGES_TO_INSTALL.md](./PACKAGES_TO_INSTALL.md)** - لیست پکیج‌های مورد نیاز
- **[services/README.md](./services/README.md)** - مستندات Service Layer
- **[docs/UI_STANDARDS.md](./docs/UI_STANDARDS.md)** - استانداردهای UI/UX

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation files above

## Roadmap

### Upcoming Features
- [ ] Real-time collaboration on exams
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Offline support with PWA
- [ ] Advanced question types (drag & drop, matching, etc.)
- [ ] Integration with learning management systems
- [ ] Automated grading and feedback
- [ ] Multi-language support expansion

### Performance Improvements
- [ ] Image optimization and lazy loading
- [ ] Code splitting and bundle optimization
- [ ] Caching strategies
- [ ] Performance monitoring
- [ ] Accessibility improvements

---

Built with ❤️ using Next.js and Material UI