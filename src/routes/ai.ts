import { Router } from "express";
import { openai } from "../openai";
import { aiRateLimit } from "../middleware/aiRateLimit";

const router = Router();

// 🔒 Rate-limit ALL AI routes
router.use(aiRateLimit);

/**
 * Detect platform from link WITHOUT AI
 */
function detectPlatform(link: string): string {
  const lower = link.toLowerCase();

  if (lower.includes("linkedin.com")) return "LinkedIn";
  if (lower.includes("indeed.com")) return "Indeed";
  if (lower.includes("greenhouse.io")) return "Greenhouse";
  if (lower.includes("lever.co")) return "Lever";
  if (lower.includes("myworkdayjobs.com")) return "Workday";

  return "Company Website";
}

router.post("/autocomplete", async (req, res) => {
  const { prompt, link } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }

  if (!link || typeof link !== "string") {
    return res.status(400).json({ error: "link is required" });
  }

  try {
    const aiPrompt = `
You are a STRICT information extraction engine.

ABSOLUTE RULES:
- Output MUST be valid JSON
- Output MUST NOT include markdown, backticks, or explanations
- NEVER include URLs or domains
- NEVER guess or infer information
- If information is missing, return an empty string ""

FIELD DEFINITIONS:

company:
- Company name ONLY
- Alphabetic words and spaces only
- Must be explicitly written

position:
- Job title ONLY
- No company names

salary:
- Compensation ONLY if explicitly stated
- Lowest single value
- Preserve original formatting
- If missing, return 0

notes:
- Concise factual notes useful for preparing for the role
- Extract ONLY explicitly stated skills, tools, or requirements
- No advice, no opinions, no inferred expectations
- Max 3 short bullet-style sentences combined into ONE string
- If none, return ""

OUTPUT FORMAT (EXACT):
{
  "company": "",
  "position": "",
  "salary": "",
  "notes": ""
}

JOB DESCRIPTION:
"""
${prompt.slice(0, 6000)}
"""
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0
    });

    const raw = completion.choices[0].message.content ?? "";

    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed: {
      company?: string;
      position?: string;
      salary?: string;
      notes?: string;
    };

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("RAW AI RESPONSE:", raw);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    const platform = detectPlatform(link);
    const today = new Date();
    function parseSalaryToInt(value?: string): number | null {
    if (!value) return null;

  // Remove commas and dollar signs
  const cleaned = value.replace(/[$,]/g, "");

  // Extract first integer found
  const match = cleaned.match(/\b\d{2,7}\b/);

  if (!match) return null;

  return parseInt(match[0], 10);
  }

    const jobApp = {
      jobid: 0,
      name: typeof parsed.company === "string" ? parsed.company : "",
      position: typeof parsed.position === "string" ? parsed.position : "",
      salary: parseSalaryToInt(parsed.salary), // ✅ number | null
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      status: "Pending",
      link,
      platform,
      month: today.getMonth() + 1,
      day: today.getDate(),
      year: today.getFullYear()
    };

    return res.json(jobApp);

  } catch (err: any) {
    console.error("AI parse error:", err);

    if (err?.status === 429) {
      return res.status(429).json({
        error: "AI quota exceeded. Please try again later."
      });
    }

    return res.status(500).json({
      error: err?.message || "AI processing failed"
    });
  }
});

export default router;
