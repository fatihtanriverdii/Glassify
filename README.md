# Glassify - Smart Eyewear Recommendation System

A web application that helps users find the perfect eyewear by analyzing their face shape through photos and providing personalized recommendations.

## Features

### 📸 Photo Input Methods
- **Upload Photo**: Load existing photos from your device
- **Take Photo**: Use your device's camera to capture a new photo

### 🔍 Face Analysis
- Automatic face shape detection
- Classification into standard face shapes (Oval, Round, Square, Heart, Diamond, Rectangle)
- Fast and accurate processing

### 👓 Smart Recommendations
- Personalized eyewear suggestions based on face shape
- Curated database of glasses
- Ranked recommendations based on compatibility

## Tech Stack

### Frontend
- React
- React Webcam for camera integration
- Material UI/Tailwind for styling
- Axios for API communication

### Backend
- ASP.NET Core
- RESTful APIs
- ML-based face analysis
- SQL Database for glasses catalog

## Getting Started

### Prerequisites
- Node.js
- .NET 6.0 or later
- SQL Server

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Frontend setup
cd frontend
npm install

# Backend setup
cd backend
dotnet restore
```

## Usage

1. Start the application
2. Choose between uploading a photo or taking a new one
3. Wait for face analysis
4. Browse recommended glasses based on your face shape

## Project Structure
```
glassify/
├── frontend/          # React application
├── backend/           # ASP.NET Core application
├── database/          # Database scripts and models
└── docs/             # Additional documentation
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
[MIT License](LICENSE)

## Contact
Project Link: [repository-url]
