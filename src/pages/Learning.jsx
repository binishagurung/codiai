import { GoogleGenAI } from "@google/genai";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState } from "react";

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const Learning = () => {
  const [userRequest, setUserRequest] = useState("");
  const [topic, setTopic] = useState("");

  // 🔹 NEW STATE (added, not replacing anything)
  const [messages, setMessages] = useState([]);

  const handleRequest = async () => {
    if (!topic) {
      return console.log("Select topic first");
    }
    if (!userRequest || userRequest.trim() === "") {
      return console.log("type your question");
    }

    localStorage.setItem("topic", JSON.stringify(topic));
    const currentRequest = userRequest.trim();
    setUserRequest("");

    // 🔹 ADD USER MESSAGE (right side)
    setMessages((prev) => [...prev, { role: "user", text: currentRequest }]);

    const prompt = `
You are an expert ${topic} educator with 10+ years of teaching experience.
Respond to this user request: "${currentRequest}"

OUTPUT FORMAT REQUIREMENTS:
- Return ONLY valid JSON
- Output must be an array containing exactly 1 object.

{
  "summary": "Exactly four word title",
  "answer": "Structured explanation"
}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let cleanedResponse = response.text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const aiData = JSON.parse(cleanedResponse);
      const aiItem = Array.isArray(aiData) ? aiData[0] : aiData;

      // 🔹 ADD AI MESSAGE (left side)
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          summary: aiItem.summary,
          answer: aiItem.answer,
        },
      ]);
    } catch (error) {
      console.log(error, "Error to connect with AI");
    }
  };

  return (
    <>
      <Navbar />

      {/* 🔹 MAIN CHAT CONTAINER */}
      <div className="flex flex-col h-[calc(100vh-120px)] bg-zinc-950 text-white">
        {/* 🔹 CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((msg, index) =>
            msg.role === "user" ? (
              // USER QUESTION → RIGHT
              <div key={index} className="flex justify-end">
                <div className="max-w-md bg-red-600 text-white px-5 py-3 rounded-2xl rounded-tr-none text-sm">
                  {msg.text}
                </div>
              </div>
            ) : (
              // AI RESPONSE → LEFT
              <div key={index} className="flex justify-start">
                <div className="max-w-2xl bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl space-y-3 text-sm">
                  <h3 className="text-red-400 font-semibold">{msg.summary}</h3>
                  <pre className="whitespace-pre-wrap font-sans">
                    {msg.answer}
                  </pre>
                </div>
              </div>
            ),
          )}
        </div>

        {/* 🔹 INPUT BAR (BOTTOM) */}
        <div className="border-t border-zinc-800 p-4 bg-zinc-900">
          <div className="flex items-end gap-3">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2.5 outline-none"
            >
              <option value="" disabled>
                Select Subject
              </option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="Python">Python</option>
              <option value="HTML/CSS">HTML/CSS</option>
              <option value="Machine Learning">Machine Learning</option>
            </select>

            <textarea
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), handleRequest())
              }
              placeholder="Ask a technical question..."
              rows={1}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm resize-none outline-none"
            />

            <button
              onClick={handleRequest}
              className="bg-white text-black h-[52px] px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Learning;
