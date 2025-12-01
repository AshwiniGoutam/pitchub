// File: /app/api/predict-sectors/route.js
import { summarizeEmail } from "../../../lib/gemini";

// 🔹 Sector keywords
const sectorKeywords = {
  AgriTech: [
    "agritech","agriculture technology","farming","crop","farm","agricultural",
    "precision farming","smart farming","food production","sustainable agriculture",
    "crop monitoring","soil health","irrigation","harvest","livestock","agri",
    "food security","vertical farming","hydroponics","aquaponics","agribusiness",
    "farm management","crop yield","agriculture innovation","digital farming",
    "crop protection","agricultural robotics","farm tech","agriculture platform",
  ],
  Mobility: [
    "mobility","transportation","logistics","automotive","autonomous vehicles",
    "electric vehicles","ev","ride sharing","ride-hailing","last mile delivery",
    "supply chain","fleet management","smart transportation","urban mobility",
    "public transit","micromobility","scooters","bike sharing","car sharing",
    "transport tech","delivery services","shipping","freight","logistics tech",
    "vehicle tracking","route optimization","delivery platform","mobility as a service",
  ],
  SaaS: [
    "software as a service","saas","subscription","mrr","arr","cloud software",
    "web application","platform","api","integration","enterprise software",
    "b2b software","product-led growth","crm","erp","bi","workflow automation",
    "digital transformation","software platform","cloud-based solution",
    "subscription model","software service",
  ],
  FinTech: [
    "fintech","financial technology","banking","payments","lending","investment",
    "wealth management","blockchain","crypto","digital wallet","mobile payments",
    "insurtech","regtech","financial services","neobank","digital bank","paytech",
    "investment platform","p2p lending","digital insurance","payment processing",
    "financial inclusion","robo-advisor","stock trading","digital payments",
    "financial platform","banking technology","payment gateway",
  ],
  Healthcare: [
    "healthtech","healthcare","medical","telemedicine","digital health","patient",
    "health records","ehr","medical device","biotech","pharmaceutical","clinical",
    "health insurance","wellness","fitness","medtech","health diagnostics",
    "remote patient monitoring","healthcare analytics","hospital","mental health",
    "healthcare platform","medical technology","patient care","healthcare innovation",
  ],
  "E-commerce": [
    "ecommerce","e-commerce","online store","marketplace","retail","shopping",
    "d2c","consumer goods","product sales","inventory","logistics",
    "supply chain","online marketplace","social commerce","digital storefront",
    "payment gateway","order management","customer reviews","product catalog",
    "online shopping","retail platform","digital commerce",
  ],
  "AI/ML": [
    "artificial intelligence","ai","machine learning","ml","deep learning",
    "neural networks","nlp","computer vision","predictive analytics","data science",
    "algorithm","automation","intelligent","ai platform","ml model",
    "ai solution","ai technology","machine intelligence",
  ],
  EdTech: [
    "edtech","education technology","online learning","e-learning","educational",
    "course platform","lms","digital education","skills","training","tutoring",
    "remote learning","education platform","virtual classroom","skill development",
    "learning platform","digital learning","education innovation",
  ],
  CleanTech: [
    "cleantech","clean technology","renewable energy","solar","wind","sustainability",
    "green energy","carbon reduction","environmental","climate tech","battery",
    "sustainable","green tech","carbon footprint","solar power","wind energy",
    "clean energy","environmental tech","carbon neutral",
  ],
  "Real Estate": [
    "proptech","real estate","property","housing","mortgage",
    "real estate investment","property tech","smart home","real estate platform",
    "property listing","real estate analytics","property valuation","housing tech",
  ],
  Marketplace: [
    "marketplace","platform","p2p","transaction platform","buyer seller platform",
    "digital marketplace","service marketplace","product marketplace","gig economy",
    "sharing economy","multi-sided platform","vendor platform",
  ],
  Consumer: [
    "consumer tech","consumer goods","b2c","business to consumer","consumer product",
    "retail tech","consumer app","lifestyle","consumer brand","d2c brand",
    "consumer electronics","consumer service","consumer innovation",
  ],
  Enterprise: [
    "enterprise","b2b","business to business","enterprise solution","corporate",
    "business software","enterprise platform","b2b service","enterprise tech",
    "business platform","corporate platform",
  ],
  Gaming: [
    "gaming","game","esports","video games","mobile gaming","game development",
    "gaming platform","interactive entertainment","game streaming",
    "gaming community","virtual reality gaming","vr gaming",
  ],
  Media: [
    "media","entertainment","content","streaming","digital media",
    "content creation","media platform","entertainment tech","digital content",
    "media streaming","content platform","digital entertainment",
  ],
};

// 🔹 Precompute keyword -> sector mapping & single regex
const keywordMap = {};
const allKeywords = [];

for (const [sector, keywords] of Object.entries(sectorKeywords)) {
  keywords.forEach((kw) => {
    const lowerKw = kw.toLowerCase();
    keywordMap[lowerKw] = sector;
    allKeywords.push(lowerKw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); // escape regex
  });
}

const allKeywordsRegex = new RegExp(`\\b(${allKeywords.join("|")})\\b`, "gi");

// 🔹 Fast sector prediction
function predictSectorFast(text) {
  const counts = {};
  const matches = text.toLowerCase().matchAll(allKeywordsRegex);

  for (const match of matches) {
    const kw = match[0];
    const sector = keywordMap[kw];
    counts[sector] = (counts[sector] || 0) + 1;
  }

  if (!Object.keys(counts).length) return null;

  return Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

// 🔹 Main API route
export async function POST(request) {
  try {
    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails)) {
      return Response.json({ error: "Emails array is required" }, { status: 400 });
    }

    console.log(`Starting fast sector prediction for ${emails.length} emails...`);

    // Full parallel processing
    const promises = emails.map(async (email) => {
      try {
        let sector = predictSectorFast(email.content + " " + email.subject);

        // Only call Gemini if keyword detection failed
        if (!sector) {
          try {
            const result = await summarizeEmail(email.content + " " + email.subject, {
              sectorOnly: true,
            });
            sector = result || "Other";
          } catch (err) {
            console.error(`Gemini failed for email ${email.id}:`, err);
            sector = "Other";
          }
        }

        return { emailId: email.id, sector };
      } catch (err) {
        console.error(`Error predicting sector for email ${email.id}:`, err);
        return { emailId: email.id, sector: "Other" };
      }
    });

    const results = await Promise.allSettled(promises);

    return Response.json({
      status: "completed",
      sectors: results.map((r) => (r.status === "fulfilled" ? r.value : { sector: "Other" })),
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: "Failed to predict sectors", details: error.message },
      { status: 500 }
    );
  }
}
