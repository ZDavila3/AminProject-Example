// This is a local mock that synthesizes 3 strategies based on answers.
// Replace with a fetch() to your backend that calls OpenAI.

function bullets(items) {
  return items.map((x) => `• ${x}`).join("\n");
}

export async function generatePlan(payload) {
  // simulate latency
  await new Promise((r) => setTimeout(r, 1200));

  const { business, campaign, brand, delivery } = payload;
  const who = business.customers.join(", ");
  const goal = campaign.goal || "Grow awareness";
  const channels = delivery.channels.length ? delivery.channels.join(", ") : "Instagram, Facebook";

  const core = `# Example Custom Marketing Plan\nBusiness: ${business.nameAndOffer}\nGoal: ${goal}\nAudience: ${who || "Local customers"}\nTone: ${brand.tone || "Friendly"}\nUnique: ${brand.unique || "Authentic, local, quality"}\nChannels: ${channels}\nBudget: ${delivery.budget || "Not specified"} | Timeframe: ${delivery.timeframe || "4–6 weeks"}\n\n`;

  const ideaA = `Tagline:\n"${brand.tone === "Premium & luxury" ? "Crafted for connoisseurs." : "Fresh. Local. Yours."}"\n\nPrimary Offer:\n${campaign.offer || "Limited-time special to drive trial and foot traffic."}\n\nPlatform Strategy:\n${bullets([
    "Instagram Reels: 15–30s reels showing product/people behind the scenes",
    "Facebook Events: create a kick-off event with invite link",
    "Google Business Profile: fresh photos + weekly updates",
    "Email: weekly short tips + the offer",
  ])}\n\nContent Types & Why It Works:\n${bullets([
    "Short-form video boosts reach & recall",
    "Events create urgency and social proof",
    "GBP posts help local SEO",
  ])}\n\nWhat to Post This Week:\n${bullets([
    "Teaser reel announcing the offer",
    "Carousel: ‘3 reasons locals love us’",
    "Story poll about flavors/options",
  ])}\n`;

  const ideaB = `Campaign Hook:\n"${goal} — in ${delivery.timeframe || "30 days"}"\n\nDrip Sequence (Email/SMS):\n${bullets([
    "Week 1: announce offer + simple CTA",
    "Week 2: social proof + UGC",
    "Week 3: behind-the-scenes + reminder",
    "Final 72h: countdown + scarcity",
  ])}\n\nLocal Partnerships:\n${bullets([
    "Cross-promote with 1–2 nearby brands",
    "Bundle giveaway with co-branded reel",
  ])}\n`;

  const ideaC = `Measurement Plan:\n${bullets([
    "Track clicks from Instagram bio + story link",
    "Use unique code for in-store redemptions",
    "Weekly KPI review: reach, CTR, redemptions",
  ])}\n\nOptimization:\n${bullets([
    "Double-down on top post format",
    "Adjust spend by CPA on the best channel",
  ])}\n`;

  return {
    plans: [core + ideaA, core + ideaB, core + ideaC],
  };
}