import ai from "../configs/ai.js";
import Resume from "../models/Resume.js";

// --- PROFESSIONAL SUMMARY ENHANCEMENT ---
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({
        message: "Missing required fields (userContent)",
      });
    }

    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Your are an expert in resume writing. Your task is to enhance to professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly and only return text no options or anything else.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;

    return res.status(200).json({
      enhancedContent,
    });
  } catch (error) {
    console.error("AI Summary Enhancement Error:", error);
    return res.status(500).json({
      message: "Failed to enhance summary via AI.",
      error: error.message,
    });
  }
};

// --- JOB DESCRIPTION ENHANCEMENT ---
export const enhanceJobDescription = async (req, res) => {
  try {
    const { promptContent } = req.body;

    if (!promptContent) {
      return res.status(400).json({
        message: "Missing required fields (promptContent)",
      });
    }

    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Your are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only 1-2 sentence also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly and only return text no options or anything else.",
        },
        {
          role: "user",
          content: promptContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;

    return res.status(200).json({
      enhancedContent,
    });
  } catch (error) {
    console.error("AI Job Description Enhancement Error:", error);
    return res.status(500).json({
      message: "Failed to enhance job description via AI.",
      error: error.message,
    });
  }
};

// --- RESUME UPLOAD AND DATA EXTRACTION ---
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;

    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({
        message: "Missing required fields (resumeText)",
      });
    }

    const systemPrompt =
      "You are an expert AI agent to extract data from resume.";

    const userPrompt = `extract data from this resume: ${resumeText}
    
    Provide data in the following JSON format with no additional text before or after, using the following schema keys:
    
    {
    "professional_summary": "",
    "skills": ["skill1", "skill2"],
    "personal_info": {
      "image": "",
      "full_name": "",
      "professional": "",
      "email": "",
      "phone": "",
      "location": "",
      "linkedin": "",
      "website": ""
    },
    "experience": [
      {
        "company": "",
        "position": "",
        "start_date": "YYYY-MM",
        "end_date": "YYYY-MM",
        "description": "",
        "is_current": true
      }
    ],
    "projects": [
      {
        "name": "",
        "type": "",
        "description": ""
      }
    ],
    "education": [
      {
        "institution": "",
        "degree": "",
        "field": "",
        "graduation_date": "YYYY-MM",
        "gpa": ""
      }
    ]
    }
    `;

    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      // ✅ REMOVED response_format - not supported by all Groq models
    });

    const extractedData = response.choices[0].message.content;

    // ✅ Clean markdown code blocks if Groq wraps response in ```json
    const cleanedData = extractedData
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleanedData);

    const newResume = await Resume.create({ userId, title, ...parsedData });

    return res.status(200).json({
      resumeId: newResume._id,
    });
  } catch (error) {
    console.error("AI Resume Upload/Parse Error:", error);
    return res.status(500).json({
      message: "Failed to parse and upload resume via AI.",
      error: error.message,
    });
  }
};