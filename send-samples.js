// Sends realistic sample inquiries to the local webhook, signed like a real form tool would.
// Usage: node send-samples.js   (server must be running)
import crypto from "node:crypto";

const URL = process.env.TARGET || "http://localhost:3001/webhook/inquiry";
const SECRET = process.env.WEBHOOK_SECRET || "dev-secret";

const samples = [
  { id: "f-101", name: "Ananya Rao", email: "ananya@brightbox.in", message: "Hi! We're planning corporate gifting for 400 employees this Diwali. Budget is around ₹6 lakh. Can you share bulk pricing by Friday?" },
  { id: "f-102", name: "Karan", email: "karan.m@gmail.com", message: "My order #4471 arrived damaged and nobody has replied to my email for 4 days. I want a replacement or refund." },
  { id: "f-103", name: "Meera Styles", email: "collabs@meerastyles.com", message: "Hey team, I'm a lifestyle creator (85k followers on Instagram). Would love to do a UGC collab for your new launch." },
  { id: "f-104", name: "SEO Pro", email: "x@spam.biz", message: "We offer SEO services ranking #1 on Google guaranteed. Also guest post opportunities." },
  { id: "f-105", name: "Rohit", email: "rohit@college.edu", message: "Hello, are there any internship openings in your marketing team? Attaching my resume." },
  { id: "f-101", name: "Ananya Rao", email: "ananya@brightbox.in", message: "(retry of the same webhook: should be ignored as a duplicate)" },
];

for (const s of samples) {
  const body = JSON.stringify(s);
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("hex");
  const r = await fetch(URL, { method: "POST", headers: { "Content-Type": "application/json", "x-signature": sig }, body });
  console.log(s.id, r.status, await r.text());
}

// And one with a bad signature, which must be rejected
const bad = await fetch(URL, { method: "POST", headers: { "Content-Type": "application/json", "x-signature": "nope" }, body: JSON.stringify(samples[0]) });
console.log("bad-sig", bad.status);
