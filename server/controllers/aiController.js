import ai from "../configs/ai.js";
import Resume from "../models/Resume.js";

const MODEL = process.env.OPENAI_MODEL || "llama3-8b-8192";

// -------------------- PROFESSIONAL SUMMARY ENHANCEMENT --------------------

export const enhanceProfessionalSummary = async (req, res) => {
try {
const { userContent } = req.body;

```
if (!userContent) {
  return res.status(400).json({
    message: "Missing required fields (userContent)",
  });
}

const response = await ai.chat.completions.create({
  model: MODEL,
  messages: [
    {
      role: "system",
      content:
        "You are an expert resume writer. Enhance the professional summary of a resume. The summary should be 1-2 sentences highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. Return only the improved summary text.",
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
```

} catch (error) {
console.error("AI Summary Enhancement Error:", error);

```
return res.status(500).json({
  message: "Failed to enhance summary via AI.",
  error: error.message,
});
```

}
};

// -------------------- JOB DESCRIPTION ENHANCEMENT --------------------

export const enhanceJobDescription = async (req, res) => {
try {
const { promptContent } = req.body;

```
if (!promptContent) {
  return res.status(400).json({
    message: "Missing required fields (promptContent)",
  });
}

const response = await ai.chat.completions.create({
  model: MODEL,
  messages: [
    {
      role: "system",
      content:
        "You are an expert resume writer. Enhance the job description of a resume. Keep it 1-2 sentences highlighting responsibilities and achievements. Use action verbs and quantifiable results. Return only the improved description.",
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
```

} catch (error) {
console.error("AI Job Description Enhancement Error:", error);

```
return res.status(500).json({
  message: "Failed to enhance job description via AI.",
  error: error.message,
});
```

}
};

// -------------------- RESUME UPLOAD AND DATA EXTRACTION --------------------

export const uploadResume = async (req, res) => {
try {
const { resumeText, title } = req.body;

```
const userId = req.userId;

if (!resumeText) {
  return res.status(400).json({
    message: "Missing required fields (resumeText)",
  });
}

const systemPrompt =
  "You are an expert AI system that extracts structured information from resumes.";

const userPrompt = `
```

Extract structured information from this resume text:

${resumeText}

Return ONLY valid JSON using this schema:

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
"is_current": false
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

```
const response = await ai.chat.completions.create({
  model: MODEL,
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
  response_format: { type: "json_object" },
});

const extractedData = response.choices[0].message.content;

const parsedData = JSON.parse(extractedData);

const newResume = await Resume.create({
  userId,
  title,
  ...parsedData,
});

return res.status(200).json({
  resumeId: newResume._id,
});
```

} catch (error) {
console.error("AI Resume Upload/Parse Error:", error);

```
return res.status(500).json({
  message: "Failed to parse and upload resume via AI.",
  error: error.message,
});
```

}
};
