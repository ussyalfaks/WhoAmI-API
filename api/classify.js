export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  const { name } = req.query;

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

  if (!apiData.gender || apiData.count === 0) {
    return res.status(200).json({
      status: "error",
      message: "No prediction available for the provided name",
    });
  }

  const gender = apiData.gender;
  const probability = apiData.probability;
  const sample_size = apiData.count;
  const is_confident = probability >= 0.7 && sample_size >= 100;
  const processed_at = new Date().toISOString();

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
}
