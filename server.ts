import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side lazily
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// ------------------------------------------------------------------
// HEALTH & AI API ENDPOINTS
// ------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'BNM Campus AI',
    timestamp: new Date().toISOString(),
    aiEnabled: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  });
});

// AI Chat Agent Endpoint (Server-Side Proxy)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, role, context, mode } = req.body;

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        agentName: 'BNM Campus AI (Offline Mode)',
        text: `Hello! I am operating in standard offline mode as no Gemini API Key is configured in environment secrets.\n\nRegarding your query: "${message}", you can track your real attendance records, assignment deadlines, and marks directly in your Supabase-powered BNM Campus AI dashboard!`
      });
    }

    let agentName = 'Orchestrator Agent';
    let systemPrompt = 'You are the BNM Campus AI Multi-Agent System assistant for BNM Institute of Technology students and faculty.';

    if (mode === 'academic_help') {
      agentName = 'Learning Assistant Agent';
      systemPrompt = `You are the BNM Campus AI Learning Assistant Agent for engineering students.
Explain concepts clearly, step-by-step, using structural bullet points, formulas, or short code snippets where appropriate.
Stay encouraging, clear, and relevant to university engineering curriculum topics like Automata, Networks, DBMS, and Machine Learning.`;
    } else if (mode === 'assignment_help') {
      agentName = 'Assignment Helper Agent';
      systemPrompt = `You are the BNM Campus AI Assignment Helper Agent.
Provide guidelines, outline structures, key formulas, pseudo-code, and problem-solving steps for college assignments without writing plain plagiarized code. Guide the student on how to approach and structure their solution.`;
    } else if (mode === 'exam_practice') {
      agentName = 'Exam Question Generator Agent';
      systemPrompt = `You are the BNM Campus AI Exam Practice Agent.
Generate 3 target Internal Assessment (IA) exam style questions (5 marks, 10 marks) with concise solution outlines on the user's requested topic.`;
    } else if (mode === 'progress_analysis') {
      agentName = 'Academic Progress Analysis Agent';
      systemPrompt = `You are the BNM Campus AI Progress Analysis Agent.
Analyze student metrics (attendance %, marks, pending assignments) and provide actionable study plans, attendance warnings, and score-booster strategies.`;
    }

    const fullPrompt = `Context: ${JSON.stringify(context || {})}
User Role: ${role || 'student'}
User Question: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({
      agentName,
      text: response.text || 'I analyzed your request and provided guidance based on your query.'
    });

  } catch (error: any) {
    console.error('[BNM AI API Error]:', error);
    res.status(500).json({
      agentName: 'BNM AI Assistant',
      text: `I encountered a processing issue while analyzing your request: ${error.message || 'Error executing AI pipeline'}. Please try again.`
    });
  }
});

// AI Progress Analysis Service (Dynamic calculation from parameters)
app.post('/api/ai/analyze-progress', async (req, res) => {
  try {
    const { studentName, attendancePct, avgMarks, pendingAssignmentsCount } = req.body;

    const ai = getGenAIClient();
    let aiSummary = `Academic Performance Summary for ${studentName || 'Student'}:\n- Overall Attendance: ${attendancePct ?? 0}%\n- Average Marks Score: ${avgMarks ?? 0}%\n- Pending Assignments: ${pendingAssignmentsCount ?? 0}`;

    if (ai) {
      try {
        const prompt = `Perform a concise 3-bullet academic performance analysis for student ${studentName || 'Student'}.
Attendance Rate: ${attendancePct}% (${attendancePct < 75 ? 'WARNING: BELOW 75% MANDATORY THRESHOLD' : 'Good attendance'})
Average Assignment Score: ${avgMarks}%
Pending Assignments: ${pendingAssignmentsCount}`;

        const aiRes = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: 'Provide 3 brief, encouraging, professional academic recommendations for engineering students.',
          }
        });
        if (aiRes.text) aiSummary = aiRes.text;
      } catch (e) {
        console.error('Gemini call failed for progress analysis:', e);
      }
    }

    res.json({
      overallPercentage: avgMarks || 0,
      attendancePct: attendancePct || 0,
      attendanceRisk: (attendancePct || 0) < 75,
      pendingAssignmentsCount: pendingAssignmentsCount || 0,
      strengths: [
        'Real-time metrics synced from Supabase records',
        'Direct tracking of submitted assignments & course marks',
        'Continuous attendance logging'
      ],
      recommendations: [
        (attendancePct || 0) < 75 ? '⚠️ Critical: Attend upcoming classes to clear the 75% mandatory attendance threshold.' : 'Maintain your attendance consistency above 80%.',
        (pendingAssignmentsCount || 0) > 0 ? `Submit your ${pendingAssignmentsCount} pending assignment(s) before due date to protect IA marks.` : 'All assignments are up to date!',
        'Review recent course study materials and test results in the portal.'
      ],
      aiSummary
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// VITE MIDDLEWARE FOR DEVELOPMENT / STATIC SERVING FOR PRODUCTION
// ------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 BNM Campus AI Server running on http://0.0.0.0:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer();
