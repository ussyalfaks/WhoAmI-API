const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware - required for grading script
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/classify", async (req, res) => {
  const { name } = req.query;

  // --- Input Validation ---
  if (name === undefined || name === "") {
    return res.status(400).json({
      status: "error",
      message: "Missing or empty 'name' query parameter",
    });
  }

  if (typeof name !== "string") {
    return res.status(422).json({
      status: "error",
      message: "Invalid 'name' parameter: must be a string",
    });
  }

  // --- External API Call ---
  let apiData;
  try {
    const url = `https://api.genderize.io/?name=${encodeURIComponent(name)}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        status: "error",
        message: "Failed to reach Genderize API",
      });
    }

    apiData = await response.json();
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error while calling Genderize API",
    });
  }

  // --- Edge Case: no prediction available ---
  if (!apiData.gender || apiData.count === 0) {
    return res.status(200).json({
      status: "error",
      message: "No prediction available for the provided name",
    });
  }

  // --- Data Processing ---
  const gender = apiData.gender;
  const probability = apiData.probability;
  const sample_size = apiData.count; // renamed from count
  const is_confident = probability >= 0.7 && sample_size >= 100;
  const processed_at = new Date().toISOString(); // UTC ISO 8601

  return res.status(200).json({
    status: "success",
    data: {
      name,
      gender,
      probability,
      sample_size,
      is_confident,
      processed_at,
    },
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
