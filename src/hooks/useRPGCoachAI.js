import { useState, useRef, useCallback } from 'react';
import { CreateMLCEngine } from '@mlc-ai/web-llm';

const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

const SYSTEM_PROMPT = `You are a high-performance fitness coach and game master for an RPG Workout app. 
You draw heavily from evidence-based science (like Andy Galpin, Huberman, Peter Attia) to design workout protocols.
Your goal is to give the user personalized quests and workouts based on their chosen RPG Class and current level.

Classes:
- Barbarian (Tank): Focuses on heavy lifting, strength training, and maximum power output.
- Rogue (Speed): Focuses on running, sprinting, and high-intensity interval training (HIIT).
- Monk (Agility): Focuses on bodyweight exercises, calisthenics, yoga, and flexibility.
- Paladin (Balanced): A balanced protocol mixing strength, cardio, and endurance.

Rules:
- Speak in an encouraging, slightly magical/RPG gamemaster tone, but keep the science strictly accurate.
- When generating a quest, provide exactly 1 workout challenge suitable for their level.
- Output JSON ONLY in the following format:
{
  "questName": "Name of the Quest",
  "description": "Flavor text explaining why this helps their specific class based on fitness science. If they have no baseline, explain that this is a baseline assessment.",
  "task": "The specific workout task (e.g. Do 50 Pushups)",
  "rewardXP": 150,
  "rewardGold": 50
}
- DO NOT wrap the JSON in markdown code blocks, just return the raw JSON string.`;

export function useRPGCoachAI() {
  const engineRef = useRef(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  const ensureEngine = useCallback(async () => {
    if (engineRef.current) return engineRef.current;
    setIsDownloading(true);
    try {
      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: ({ text }) => setDownloadProgress(text || 'Loading Coach AI…'),
      });
      engineRef.current = engine;
      return engine;
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  }, []);

  const generateQuest = useCallback(async (rpgData) => {
    setIsThinking(true);
    try {
      const engine = await ensureEngine();
      
      const hasBaseline = rpgData.workoutLogs && rpgData.workoutLogs.length > 0;
      const recentLogs = hasBaseline ? rpgData.workoutLogs.slice(0, 3).map(l => `${l.type} x${l.value} (RPE: ${l.rpe || 'unknown'})`).join(', ') : 'None yet';

      let prompt = `Generate a new daily quest for a Level ${rpgData.level} ${rpgData.heroClass}. 
Their experience level is: ${rpgData.experienceLevel || 'Beginner'}.
Their stated goals are: "${rpgData.goals || 'General fitness'}".
They currently have ${rpgData.hp} HP out of ${rpgData.maxHp}.

Recent workout logs: ${recentLogs}.

IMPORTANT RULE: If their recent workout logs are "None yet", you MUST assign a "Baseline Assessment" quest. This should be a simple bodyweight assessment (like max pushups, a 1km walk/run, or a plank hold) and explicitly tell them to log their RPE (How did it feel?) so you can gauge their fitness level. DO NOT assign heavy weights or complex movements without a baseline.

If they DO have a baseline, design a quest that progressively overloads their recent workouts based on Andy Galpin's protocols and their specific class/goals.

Remember to return ONLY valid JSON.`;

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ];

      const response = await engine.chat.completions.create({
        messages,
        max_tokens: 300,
        temperature: 0.7,
      });

      let content = response.choices[0].message.content?.trim() || "";
      
      // Robust JSON extraction: find the first '{' and the last '}'
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON object found in LLM response");
      }
    } catch (err) {
      console.error("Error generating quest:", err);
      return null;
    } finally {
      setIsThinking(false);
    }
  }, [ensureEngine]);

  return { generateQuest, isThinking, isDownloading, downloadProgress };
}
