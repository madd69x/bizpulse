// src/samples.js — Quick-pick sample business situations

const SAMPLES = {
  startup: `We're a 6-month-old SaaS startup. We raised a small friends & family round of ₹25L. Burn rate is ₹3.5L/month. Current MRR is ₹80K with 2 paying customers. Team is 4 people. Runway is about 6 months. We're struggling to close enterprise deals and our free trial conversion is only 3%. We have a strong product but weak sales process and no dedicated salesperson.`,

  ecom: `I run a D2C fashion e-commerce brand. Monthly revenue was ₹8L, now dropped to ₹3.2L over 3 months. Return rate has jumped from 12% to 28%. Ad costs on Meta have doubled in 6 months. We have ₹5L inventory stuck unsold. Margins were 40% but now barely 15% after returns and ad spend. I'm struggling to understand what's causing the drop — product quality, targeting, or competition.`,

  saas: `My B2B SaaS product has 120 customers paying ₹3K/month each. Last quarter we lost 22 customers — churn jumped from 3% to 18%. NPS dropped from 52 to 28. Support tickets have doubled. We added 2 major features but customers complain the core product is buggy. Revenue is flat at ₹3.6L/month. Team morale is low. I can't decide whether to freeze new features and fix bugs, or keep building.`,

  retail: `I have a clothing retail store in a Tier-2 city. Footfall dropped 40% since a new mall opened nearby 4 months ago. Monthly sales went from ₹6L to ₹2.8L. I have 3 staff members. Rent is ₹55K/month and I have 8 months left on my lease. No online presence at all. Stock is piling up with ₹4L unsold inventory. I have maybe 2 more months of savings. Unsure whether to pivot online or fight it out offline.`,

  agency: `I run a digital marketing agency with 6 clients. Just lost 2 big clients who together were 40% of revenue. Team is 5 full-time employees. Monthly revenue dropped from ₹4.5L to ₹2.7L overnight. Fixed costs are ₹2.2L/month including salaries. I need to either cut the team or find new clients fast. My pipeline is weak because I've been too busy with delivery to do sales. Not sure which services to double down on.`
};

// Attach click handlers once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.qpick').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const input = document.getElementById('situationInput');
      if (input && SAMPLES[key]) {
        input.value = SAMPLES[key];
        input.dispatchEvent(new Event('input'));
        input.focus();
      }
    });
  });
});
