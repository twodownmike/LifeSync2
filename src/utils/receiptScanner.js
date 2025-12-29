export async function scanReceipt(imageFile, apiKey) {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  // Convert file to base64
  const base64Image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this receipt image and extract the following details in JSON format: 'total_amount' (number), 'merchant_name' (string), 'date' (YYYY-MM-DD string, if not found use today), and 'category' (one of: Food, Transport, Shopping, Housing, Utilities, Health, Entertainment, Other). Return ONLY the raw JSON." 
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      max_tokens: 300
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  const content = data.choices[0].message.content;
  
  // Clean up code blocks if present
  const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse receipt JSON", content);
    throw new Error("Could not parse receipt data");
  }
}
