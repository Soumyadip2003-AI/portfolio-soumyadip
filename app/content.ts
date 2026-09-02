/* ==========================================================================
   EDIT THIS FILE TO CHANGE THE SITE.

   Everything you can read on the page lives here: every sentence, every link,
   every project card, every number. The page and the AI chatbot both read from
   this one file, so a change here updates both and they can never disagree.

   THREE RULES
   1. Keep the quotes. Text goes between "double quotes".
   2. Keep the commas at the end of each line.
   3. Save the file. The site reloads on its own.

   ADDING A PROJECT
   Copy any block inside `projects` from its opening { to its closing }, paste it
   after the last one, and edit the values. It becomes a new card automatically.
   Delete a block to remove that card.

   ADDING AN IMAGE
   Put the file in the `public` folder, then write its name here starting with a
   slash. A file at public/myapp.png is written as "/myapp.png".
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. WHO YOU ARE
   -------------------------------------------------------------------------- */

export const profile = {
  /* Shown in the top-left corner, the footer, and used by the chatbot. */
  fullName: "Soumyadip Sarkar",
  role: "Software Engineer",
  location: "Kolkata, India",

  email: "soumyadip.0202@gmail.com",
  phone: "+91-7595027287",

  github: "https://github.com/Soumyadip2003-AI",
  linkedin: "https://linkedin.com/in/soumyadip1234",
  /* Your live portfolio URL. Fill this in after deploying; the chatbot shares it.
     Leave "" and the chatbot simply does not mention a website. */
  website: "https://portfolio-soumyadip.vercel.app",

  /* Public link to your latest resume. The chatbot hands this out when someone
     asks for your CV. Leave it as "" and the bot points them at your email.
     Make sure the file is shared as "Anyone with the link". */
  resumeUrl: "https://drive.google.com/file/d/1JPq59Y0u8hZgeLR_6jps7_9SrpCvl2Hp/view?usp=sharing",

  /* Shown in the very bottom bar of the footer. */
  footerNote: "Kolkata, India. 2026.",
};

/* --------------------------------------------------------------------------
   2. BROWSER TAB AND GOOGLE / LINK PREVIEWS
   -------------------------------------------------------------------------- */

export const seo = {
  title: "Soumyadip Sarkar - Software Engineer",
  description:
    "Soumyadip Sarkar is a software engineer in Kolkata building full-stack software and AI systems, from an autonomous GPT-5.1 coding agent to a calibrated clinical risk model.",
  /* Used when the link is pasted into Slack, WhatsApp, LinkedIn, etc. */
  shareTitle: "Soumyadip Sarkar - Software Engineer",
  shareDescription:
    "Full-stack and AI systems, built to hold up in production. Recent work: Nova, an autonomous GPT-5.1 coding agent, and NeuroPredict, a calibrated clinical risk model.",
  /* Where this site is deployed. On Vercel the real domain is detected
     automatically; this is the fallback for other hosts. */
  siteUrl: "https://portfolio-soumyadip.vercel.app",
};

/* --------------------------------------------------------------------------
   3. TOP MENU
   Each `href` starting with # jumps to a section on this page.
   -------------------------------------------------------------------------- */

export const nav = [
  { label: "Home", href: "#top" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/* The button in the top-right corner. */
export const navButton = { label: "Get in touch", href: "#contact" };

/* --------------------------------------------------------------------------
   4. THE FIRST SCREEN
   -------------------------------------------------------------------------- */

export const hero = {
  /* The big headline. Keep it short; it is set very large. */
  headline: "I build AI systems that don't fall over.",
  /* The paragraph underneath. Two sentences works best. */
  subtext:
    "Full-stack engineer from Kolkata. My last agent went from failing 15% of the time to under 1%, and most of that work was in the error recovery, not the model.",
  primaryButton: { label: "See the work", href: "#projects" },
  secondaryButton: { label: "Get in touch", href: "#contact" },
  /* Background video, from the public folder. */
  video: "/hero.mp4",
};

/* --------------------------------------------------------------------------
   5. THE BIG LINE UNDER THE HERO
   Written as two lines so the break lands where you want it.
   -------------------------------------------------------------------------- */

export const manifesto = ["So it keeps working", "when you look away."];

/* --------------------------------------------------------------------------
   6. PROJECTS
   Copy a whole { ... } block to add a card. Delete one to remove a card.

   image        a file in the public folder, or null for a coloured gradient
   imageFocus   which part of the screenshot to keep when it is cropped:
                "top" | "center" | "left" | "right" | "bottom"
   fallbackTint the gradient used when image is null: "sky" | "aurora" | "night"
   facets       the small pills. The first one is highlighted.
   -------------------------------------------------------------------------- */

export type Project = {
  name: string;
  tag: string;
  period: string;
  body: string;
  facets: string[];
  demo: string;
  repo: string;
  image: string | null;
  imageFocus: "top" | "center" | "left" | "right" | "bottom";
  fallbackTint: "sky" | "aurora" | "night";
};

export const projectsHeading = {
  eyebrow: "Selected work",
  /* Avoid hardcoding a count here; it goes stale when you add a card. */
  headline: "The work, and the parts that shipped.",
};

export const projects: Project[] = [
  {
    name: "Nova",
    tag: "AI-powered code generation platform",
    period: "Since Jan 2026",
    body: "An autonomous GPT-5.1 agent on Inngest multi-step async workflows with self-healing error recovery. The code-generation failure rate fell from about 15% to under 1%, verified in production logs.",
    facets: ["Autonomous agent", "Self-healing recovery", "Type-safe tRPC", "Under 1% failures"],
    demo: "https://nova-five-black.vercel.app",
    repo: "https://github.com/Soumyadip2003-AI/Nova",
    image: "/nova.jpg",
    imageFocus: "top",
    fallbackTint: "sky",
  },
  {
    name: "NeuroPredict",
    tag: "Calibrated clinical risk model, team of 5",
    period: "2023 to 2025",
    body: "A React and Flask stroke risk screener over one calibrated logistic regression. The model it replaced scored 95% accuracy by answering 'no stroke' for everyone, catching none of them. Balanced class weights and a threshold fitted out-of-fold took it to a held-out ROC-AUC of 0.84 and 84% of strokes caught.",
    facets: ["84% of strokes caught", "ROC-AUC 0.84", "Calibrated to 0.84 pts", "Team of 5"],
    demo: "https://final-2026-vert.vercel.app",
    repo: "https://github.com/Soumyadip2003-AI/stroke-prediction-system-ai-ml",
    image: "/stroke.jpg",
    imageFocus: "center",
    fallbackTint: "aurora",
  },
  {
    name: "SortLab",
    tag: "Sorting algorithm visualizer",
    period: "Since 2024",
    body: "A real-time visualizer for 9 sorting algorithms (Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, Counting, Radix) that streams every comparison and swap as a discrete step using JavaScript generator functions, so the animation stays non-blocking while the user controls array size and speed.",
    facets: ["9 algorithms", "Generator-driven", "Non-blocking", "Live stats panel"],
    demo: "https://sort-visualizer-1-gwic.onrender.com",
    repo: "https://github.com/Soumyadip2003-AI/Sort-Visualizer",
    image: "/sortlab.jpg",
    imageFocus: "left",
    fallbackTint: "night",
  },
];

/* --------------------------------------------------------------------------
   7. THE NUMBERS SECTION
   -------------------------------------------------------------------------- */

export const metricsSection = {
  eyebrow: "Measured, not claimed",
  /* Two lines, so the break lands where you want it. */
  headline: ["Numbers from production.", "Not from a pitch."],
  subtext: "Every figure here traces to a production log or a held-out test set.",
  button: { label: "See the work", href: "#projects" },
};

/* `value` is the big number, `label` is the small line under it. */
export const metrics = [
  { value: "<1%", label: "Agent failure rate on Nova" },
  { value: "<180ms", label: "p95 latency, core flows" },
  { value: "84%", label: "Strokes caught, up from none" },
  { value: "<24h", label: "Production issue turnaround" },
];

/* --------------------------------------------------------------------------
   8. SKILLS
   Add or remove rows freely.
   -------------------------------------------------------------------------- */

export const skillsHeading = { eyebrow: "Skills", headline: "The toolbox." };

export const skills = [
  { label: "Languages", items: "Python, Java, JavaScript, TypeScript, C++, C, SQL" },
  { label: "Front-end", items: "React, Next.js, HTML5, CSS3, Tailwind CSS" },
  { label: "Back-end and APIs", items: "Node.js, REST, tRPC, FastAPI, Django" },
  { label: "Databases", items: "PostgreSQL, MongoDB, Redis, Prisma ORM" },
  { label: "Cloud and DevOps", items: "Docker, AWS, Azure, Git, GitHub Actions, Vercel, Linux" },
  {
    label: "AI and ML",
    items: "LLMs and AI agents, GPT-5.1, scikit-learn, XGBoost, LightGBM, TensorFlow, Optuna, BERT",
  },
  {
    label: "Fundamentals",
    items:
      "Data structures and algorithms, system design, OOP, DBMS, operating systems, networks, test automation",
  },
];

/* --------------------------------------------------------------------------
   9. ABOUT
   -------------------------------------------------------------------------- */

export const about = {
  eyebrow: "About",
  headline: "I ship things, then I make them reliable.",
  intro:
    "I am Soumyadip, a software engineer from Kolkata, currently doing my MCA at IEM. I build full-stack systems and AI agents: most recently Nova, an autonomous GPT-5.1 coding agent where I brought the failure rate from about 15% to under 1%, and NeuroPredict, a clinical risk model I took from catching no strokes at all to catching 84% of them. I am looking for SDE roles where I can own features end to end.",

  /* The four boxes a recruiter reads first. */
  quickFacts: [
    { label: "Location", value: "Kolkata, India" },
    { label: "Focus", value: "Full-stack and AI/ML" },
    { label: "Currently", value: "MCA at IEM, 2026 to 2028" },
    { label: "Open to", value: "Roles and internships" },
  ],
};

/* Add another { ... } block here for a second job. */
export const experience = [
  {
    org: "Euphoria Genx",
    role: "Web Developer Intern",
    period: "May to July 2024, Kolkata",
    points: [
      "Designed and delivered REST API endpoints and dashboard UI modules for two live production applications, with SQL-backed back-end services, across 8-week Agile sprints with zero carry-overs.",
      "Debugged and resolved 5+ production issues within a 24-hour turnaround through systematic root-cause analysis, improving the reliability of customer-facing features.",
      "Worked with cross-functional teammates in Agile ceremonies, raising code quality through structured pull-request reviews and version-controlled delivery.",
    ],
  },
];

export const education = [
  {
    degree: "Master of Computer Applications",
    school: "Institute of Engineering and Management (IEM)",
    meta: "2026 to 2028, Kolkata",
  },
  {
    degree: "Bachelor of Computer Applications",
    school: "University of Engineering and Management (UEM)",
    meta: "2023 to 2026, Kolkata. CGPA 9.02 / 10",
  },
];

export const certifications = [
  "Oracle OCI 2025 Certified Generative AI Professional",
  "Oracle OCI 2025 Certified AI Foundations Associate",
  "Google 5-Day AI Agents Intensive",
];

/* Told to the chatbot only. Not shown on the page. */
export const achievements = [
  "Reduced AI-agent code-generation failure rate from about 15 percent to under 1 percent in a production system (Nova), architected end to end.",
  "Rebuilt a stroke risk model that was scoring 95 percent accuracy while catching none of the strokes, reaching a held-out ROC-AUC of 0.84 and 84 percent recall, while coordinating a 5-member engineering team.",
  "Maintained a 9.02 out of 10 CGPA in his BCA while shipping full-stack and AI/ML projects, and earned 3 AI/ML certifications from Google and Oracle.",
];

/* --------------------------------------------------------------------------
   9b. HIRING ANSWERS  ***REVIEW EVERY LINE BELOW***

   These are the questions a recruiter asks in the first two minutes, and none of
   them are on your resume, so the chatbot could not answer them before.

   They are your decisions, not facts I can look up. I filled them with the safest
   sensible defaults. Read each one and correct anything that is not true for you,
   because a recruiter will take these at face value.

   Leave any line as "" and the chatbot goes back to "ask him by email" for that
   question, which is always a safe answer.
   -------------------------------------------------------------------------- */

export const hiring = {
  /* When you can start. */
  availability:
    "He is studying for an MCA at IEM from 2026 to 2028. He is available for internships and part-time work now, and for full-time roles from 2028.",

  /* Notice period. Students and freshers usually have none. */
  noticePeriod: "None. He can start immediately for internships.",

  /* Money. The default deliberately quotes no number: a chatbot should never
     negotiate on your behalf. Put a range here only if you want one published. */
  salaryExpectation:
    "Open to discussion and in line with the market rate for the role. Best raised with him directly.",

  /* Relocation. Most Indian freshers say yes; change it if that is not you. */
  relocation:
    "Open to relocating anywhere in India, including Bangalore, Hyderabad, Pune, Chennai, and the NCR.",

  /* Office, hybrid, or remote. */
  workMode: "Open to onsite, hybrid, or fully remote work.",

  /* The sort of job he wants. */
  roleInterests:
    "Software engineering roles across full-stack, back-end, and AI/ML. Open to both internships and full-time positions.",

  /* CONFIRM: I could not verify these two. They are left blank on purpose so the
     bot says "ask him" rather than telling a recruiter something untrue. */
  languages: "",
  workAuthorization: "",

  /* Your pitch, in your own words. */
  strengths:
    "He ships measurable results: he cut an AI agent's failure rate from about 15 percent to under 1 percent, and rebuilt a clinical risk model that caught no strokes into one that catches 84 percent of them. He owns features end to end and backs his work with tests and CI.",

  careerGoal:
    "To grow as a software engineer building production AI systems and reliable full-stack products.",
};

/* --------------------------------------------------------------------------
   9c. PERSONAL

   Told to the chatbot only, never shown on the page. Recruiters do ask "what is
   he like outside work", and this gives the bot something real to answer with.

   Leave any line as "" and the bot simply says it does not have that detail,
   so a blank is always safe. Write these in your own words.
   -------------------------------------------------------------------------- */

export const personal = {
  /* e.g. "Chess, cricket, and building small side projects at night." */
  hobbies:
    "Reading books, playing guitar, and the gym for weight lifting and hybrid training. Football is his outdoor game and chess his indoor one.",
  /* e.g. "Blue." */
  favouriteColour: "Black.",
  /* e.g. "Biryani, and his mother's fish curry." */
  favouriteFood: "Mutton biriyani.",
  /* Anything else worth a smile. Optional. */
  funFact: "",
};

/* Told to the chatbot only. Your professional summary. */
export const summary =
  "Software engineer with hands-on experience designing, developing, testing and debugging full-stack software and REST APIs in Agile and Scrum teams using Python, JavaScript, TypeScript, Java and SQL. He builds React front-ends and Node.js back-end services and owns features end to end through Git-based code reviews, Docker containerization and CI/CD automation on cloud platforms. He actively explores emerging AI/ML and generative AI technologies, backed by strong data structures, algorithms and system design fundamentals.";

/* --------------------------------------------------------------------------
   10. THE CLOSING CONTACT SECTION
   -------------------------------------------------------------------------- */

export const contact = {
  eyebrow: "Open to roles and internships",
  headline: "Let's build something.",
  subtext:
    "I am finishing a BCA and starting an MCA at IEM in Kolkata. Open to software engineering roles and internships now.",
  primaryButton: { label: "Get in touch" },
  secondaryButton: { label: "View on GitHub" },
};

/* --------------------------------------------------------------------------
   11. FOOTER
   -------------------------------------------------------------------------- */

export const footer = {
  /* The serif line on the left, written as two lines. */
  tagline: ["Where ideas", "meet delivery."],
  columns: [
    {
      head: "Explore",
      items: [
        { label: "Projects", href: "#projects" },
        { label: "Skills", href: "#skills" },
        { label: "About", href: "#about" },
      ],
    },
    {
      head: "Projects",
      /* Derived from `projects` above, so adding a card cannot leave the footer
         silently out of date. */
      items: projects.map((p) => ({ label: p.name, href: p.demo })),
    },
    {
      head: "Elsewhere",
      items: [
        { label: "GitHub", href: "https://github.com/Soumyadip2003-AI" },
        { label: "LinkedIn", href: "https://linkedin.com/in/soumyadip1234" },
      ],
    },
  ],
};

/* --------------------------------------------------------------------------
   12. THE AI CHATBOT
   -------------------------------------------------------------------------- */

export const chat = {
  launcherOpen: "Ask about me",
  launcherClose: "Close",
  panelTitle: "Ask about Soumyadip",
  /* The small label in the top-right of the chat panel. */
  panelBadge: "AI Assistant",
  emptyState: "Ask about his projects, stack, experience, or availability.",
  /* The suggested question buttons. */
  /* Shown in small text above the input. Visitors should know chats are kept. */
  privacyNote: "Chats are saved so Soumyadip can see what people ask.",
  starters: [
    "What has he built?",
    "What is his tech stack?",
    "When can he join?",
    "Can I see his resume?",
  ],
};

/* --------------------------------------------------------------------------
   BELOW THIS LINE IS PLUMBING. You should not need to edit it.

   This turns everything above into the briefing the chatbot reads, so the bot
   and the page can never fall out of step.
   -------------------------------------------------------------------------- */

export function resumeFacts(): string {
  const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

  return `
${profile.fullName} is a ${profile.role.toLowerCase()} based in ${profile.location}.
Phone: ${profile.phone}. Email: ${profile.email}.
GitHub: ${profile.github}. LinkedIn: ${profile.linkedin}.${profile.website ? ` Portfolio: ${profile.website}.` : ""}
He is open to software engineering roles and internships.

SUMMARY
${summary}

EDUCATION
${education.map((e) => `- ${e.degree}, ${e.school}. ${e.meta}.`).join("\n")}

EXPERIENCE
${experience
  .map((j) => `- ${j.org}. ${j.role}, ${j.period}.\n${j.points.map((p) => `  ${p}`).join("\n")}`)
  .join("\n")}

PROJECTS
${projects
  .map(
    (p) =>
      `- ${p.name}, ${p.tag}, ${p.period}.\n  ${p.body}\n  Highlights: ${p.facets.join(", ")}.\n  Live demo: ${p.demo}\n  Source: ${p.repo}`,
  )
  .join("\n")}

SKILLS
${skills.map((s) => `- ${s.label}: ${s.items}.`).join("\n")}

CERTIFICATIONS
${list(certifications)}

ACHIEVEMENTS
${list(achievements)}

HIRING AND AVAILABILITY
${hiringLines()}

PERSONAL
${personalLines()}
`.trim();
}

/* Same rule as hiring: an empty line is omitted so the assistant says it does
   not have that detail instead of answering with nothing. */
function personalLines(): string {
  const rows: [string, string][] = [
    ["Hobbies and interests", personal.hobbies],
    ["Favourite colour", personal.favouriteColour],
    ["Favourite food", personal.favouriteFood],
    ["Fun fact", personal.funFact],
  ];
  const filled = rows.filter(([, v]) => v.trim());
  return filled.length
    ? filled.map(([k, v]) => `- ${k}: ${v}`).join("\n")
    : "- Nothing recorded. Say you do not have personal details and point at his email.";
}

/* Anything left blank in `hiring` is dropped rather than sent as an empty value,
   so the assistant falls back to "I do not have that, email him" instead of
   answering a recruiter with nothing. */
function hiringLines(): string {
  const rows: [string, string][] = [
    ["Availability and start date", hiring.availability],
    ["Notice period", hiring.noticePeriod],
    ["Salary expectations", hiring.salaryExpectation],
    ["Relocation", hiring.relocation],
    ["Work mode (remote, hybrid, onsite)", hiring.workMode],
    ["Roles he is interested in", hiring.roleInterests],
    ["Languages spoken", hiring.languages],
    ["Work authorization", hiring.workAuthorization],
    ["Key strengths", hiring.strengths],
    ["Career goal", hiring.careerGoal],
  ];
  const filled = rows.filter(([, v]) => v.trim());
  return filled.length
    ? filled.map(([k, v]) => `- ${k}: ${v}`).join("\n")
    : "- Not specified. Direct these questions to his email.";
}
