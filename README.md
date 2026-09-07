# Grandma's Stories

A phone-only storytelling app for **iOS and Android**. Upload a story and listen to it narrated in a warm **grandmother's voice** — first in **English**, with the option to switch to **Tamil**.

## Architecture

```
React Native (Expo)     →  API Gateway (8080)
                              ├── User Service (8081)      — profiles, language preference
                              ├── Story Service (8082)     — upload & paginate stories
                              ├── Narration Service (8083) — grandmother TTS (EN / TA)
                              └── Media Service (8084)     — audio file storage
```

## Tech stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native, Expo, TypeScript |
| Backend | Java 17, Spring Boot 3, Spring Cloud Gateway |
| Database | PostgreSQL |
| Cache | Redis |
| Queue | RabbitMQ |
| Storage | MinIO |
| Voice | ElevenLabs (production) / mock (development) |

## Language support

- **App UI**: English ↔ Tamil (Settings screen)
- **Narration**: English ↔ Tamil (Story Reader — regenerates voice on switch)
- Default language: **English**

## Quick start

### 1. Start infrastructure

```bash
cd backend
docker compose up -d
```

### 2. Start backend services

Open separate terminals for each service:

```bash
cd backend/api-gateway && mvn spring-boot:run
cd backend/user-service && mvn spring-boot:run
cd backend/story-service && mvn spring-boot:run
cd backend/narration-service && mvn spring-boot:run
cd backend/media-service && mvn spring-boot:run
```

### 3. Start mobile app

```bash
npm install
npm start
```

Then press **i** (iOS Simulator) or **a** (Android Emulator), or scan the QR code with **Expo Go**.

### Physical device API URL

Update `src/services/api.ts` — replace `localhost` with your machine's IP:

```typescript
const API_BASE_URL = 'http://192.168.x.x:8080';
```

- **Android emulator**: use `http://10.0.2.2:8080`
- **iOS simulator**: `http://localhost:8080` works

## Enable real grandmother voice (ElevenLabs)

Set environment variables before starting `narration-service`:

```bash
export ELEVENLABS_API_KEY=your_key
export ELEVENLABS_VOICE_EN=english_grandmother_voice_id
export ELEVENLABS_VOICE_TA=tamil_grandmother_voice_id
```

Update `backend/narration-service/src/main/resources/application.yml`:

```yaml
tts:
  provider: elevenlabs
```

## Project structure

```
mobile-app/
├── App.tsx
├── src/
│   ├── screens/       Home, AddStory, StoryReader, Settings
│   ├── components/    AudioPlayer, LanguageToggle
│   ├── navigation/
│   ├── services/      API client
│   ├── i18n/          en.json, ta.json
│   └── context/       Language preferences
└── backend/
    ├── api-gateway/
    ├── user-service/
    ├── story-service/
    ├── narration-service/
    ├── media-service/
    └── docker-compose.yml
```

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stories` | Create story |
| GET | `/api/stories?userId=1` | List stories |
| GET | `/api/stories/{id}` | Get story |
| POST | `/api/narrations/generate` | Generate grandmother narration |
| GET | `/api/narrations/story/{id}?language=en` | Get narrations |
| PUT | `/api/users/{id}/language` | Update user language |

## Next steps

- [ ] Connect ElevenLabs for production grandmother voice
- [ ] Store audio files in MinIO via Media Service
- [ ] Add JWT authentication
- [ ] Push notification when narration is ready
- [ ] Publish to App Store & Play Store via EAS Build
