# RecruitAI - AI Mock Interview Platform

RecruitAI is a cutting-edge web application designed to help job seekers prepare for their dream roles through realistic, voice-based mock interviews. Powered by the latest Gemini Live API, RecruitAI provides an immersive experience where you can speak naturally with an AI interviewer and receive instant, professional feedback.

## 🚀 Key Features

- **Real-Time Voice Interaction**: Engage in natural, low-latency conversations with an AI interviewer using the Gemini 2.5 Flash Live API.
- **Customizable Sessions**: Tailor your interview by specifying your target role, difficulty level, and the number of questions.
- **Live Transcription**: View a real-time transcript of your conversation to track your performance as you speak.
- **Instant Performance Analysis**: Receive a comprehensive feedback report immediately after your session, including an overall score, key strengths, and specific areas for improvement.
- **Zero Downtime Architecture**: Built with robust fallback mechanisms for both the voice agent and feedback generation to ensure the platform is always accessible.
- **Premium UI/UX**: A clean, modern, and professional interface designed for focus and ease of use.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **AI SDK**: `@google/genai` (Gemini API)
- **Audio Processing**: Web Audio API with custom PCM encoding/decoding

## 🤖 AI Models Used

RecruitAI uses a multi-model fallback strategy to ensure maximum reliability:

### Voice Agent (Gemini Live API)
1. `gemini-2.5-flash-native-audio-preview-09-2025` (Primary)
2. `gemini-2.5-flash-native-audio-preview-12-2025` (Fallback)

### Feedback Generator
1. `gemini-3-flash-preview` (Primary)
2. `gemini-3.1-pro-preview` (Fallback)
3. `gemini-flash-lite-latest` (Fallback)

## 💻 Local Development

To run RecruitAI on your local machine, follow these steps:

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Gemini API Key (obtainable from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd recruit-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to `http://localhost:3000` in your web browser.

## 🔒 Privacy

RecruitAI respects your privacy. All interview transcripts and audio data are processed in real-time and stored only in your browser's local state during the session. No personal data or interview recordings are persisted on our servers.

---
Built with ❤️ using Google Gemini AI.
