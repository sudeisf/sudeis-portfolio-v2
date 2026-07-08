import { ResumeData } from '../types';

export const defaultResumeData: ResumeData = {
  name: "Sudeis Fedlu",
  title: "Full Stack Developer & Digital Architect",
  email: "sudeisfed@gmail.com",
  phone: "+251 974 126 234",
  location: "Addis Ababa, Ethiopia",
  website: "https://sudeisfedlu.et/",
  linkedin: "https://linkedin.com/in/sudeis-fedlu-554147341",
  github: "https://github.com/sudeisf",
  summary: "Innovative Full-Stack Developer with 3+ years of experience building high-performance, containerized web applications. Proven track record of architecting scalable Python & PHP backends, cloud-integrated maps ecosystems, and interactive frontends. Strong advocate for clean architecture, low latency, and robust structural designs.",
  skills: {
    languages: ["TypeScript", "JavaScript", "Python", "PHP", "SQL", "HTML/CSS"],
    frameworks: ["React", "Express", "Vite", "FastAPI", "Django", "Tailwind CSS"],
    tools: ["Docker", "Git", "Nginx", "Linux", "PostgreSQL", "Google Maps API"]
  },
  experience: [
    {
      id: "exp-1",
      role: "Lead Full-Stack Architect",
      company: "Monolith Tech",
      location: "Addis Ababa, Ethiopia",
      period: "2024 - Present",
      description: "• Engineered robust backend frameworks utilizing Python FastAPI and PostgreSQL, boosting API response performance by 40%\n• Developed a custom location-based mapping service powered by Google Maps API, managing over 50k daily active client coordinates with 99.9% uptime\n• Spearheaded high-fidelity UI redesigns with React and Tailwind CSS, reducing page load times by 25% and enhancing mobile user retention metrics"
    },
    {
      id: "exp-2",
      role: "Software Engineer",
      company: "Symmetrical Digital",
      location: "Addis Ababa, Ethiopia",
      period: "2022 - 2024",
      description: "• Maintained and scaled legacy PHP/Laravel codebases, optimizing query execution loops and reducing server resource overhead by 15%\n• Implemented containerized deployment architectures using Docker, cutting dev-to-prod release cycles from hours to minutes\n• Fabricated client-facing real-time analytics panels utilizing React, D3.js, and modular REST API structures"
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Bachelor of Science in Computer Science",
      school: "Addis Ababa University",
      location: "Addis Ababa, Ethiopia",
      period: "2019 - 2023",
      details: "Focus on Distributed Systems, Software Engineering, and Database Design. Graduated with top honors."
    }
  ],
  projects: [
    {
      title: "Dynamic Cloud-Mapping Suite",
      description: "A secure mapping utility featuring real-time telemetry plots, custom geofence triggers, and spatial visualizations.",
      technologies: ["React", "Google Maps API", "Express", "PostgreSQL"]
    },
    {
      title: "Admin Portfolio Control Hub",
      description: "An offline-first portfolio manager with dynamic message streaming, theme synchronization, and visual control panels.",
      technologies: ["React", "Vite", "Express", "Tailwind CSS"]
    }
  ]
};

export function printResume(resume: ResumeData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const experiencesHtml = resume.experience.map(e => `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11pt;">
        <span>${e.role} — ${e.company}</span>
        <span style="font-weight: normal; font-size: 10pt;">${e.period}</span>
      </div>
      <div style="font-style: italic; font-size: 10pt; color: #555; margin-bottom: 4px;">${e.location}</div>
      <div style="margin-left: 15px; font-size: 10pt; line-height: 1.4;">
        ${e.description.split('\n').map(b => `<div style="margin-bottom: 2px;">${b}</div>`).join('')}
      </div>
    </div>
  `).join('');

  const educationHtml = resume.education.map(e => `
    <div style="margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11pt;">
        <span>${e.degree}</span>
        <span style="font-weight: normal; font-size: 10pt;">${e.period}</span>
      </div>
      <div style="font-size: 10pt;">${e.school}, ${e.location}</div>
      ${e.details ? `<div style="font-size: 9.5pt; color: #444; margin-top: 2px;">${e.details}</div>` : ''}
    </div>
  `).join('');

  const projectsHtml = resume.projects.map(p => `
    <div style="margin-bottom: 8px;">
      <div style="font-weight: bold; font-size: 11pt;">${p.title} <span style="font-weight: normal; font-size: 9.5pt; color: #555;">(${p.technologies.join(', ')})</span></div>
      <div style="font-size: 10pt; line-height: 1.3;">${p.description}</div>
    </div>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>${resume.name} - ATS Resume</title>
        <style>
          @page {
            size: letter;
            margin: 0.75in;
          }
          body {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.35;
            margin: 0;
            padding: 0;
            background-color: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
          }
          .name {
            font-size: 22pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .title {
            font-size: 12pt;
            font-style: italic;
            color: #333;
            margin-bottom: 5px;
          }
          .contact {
            font-size: 9.5pt;
            color: #444;
          }
          .section-title {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            margin-top: 15px;
            margin-bottom: 8px;
            padding-bottom: 1px;
          }
          .skills-grid {
            font-size: 10pt;
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 5px 15px;
          }
          .skills-label {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${resume.name}</div>
          <div class="title">${resume.title}</div>
          <div class="contact">
            ${resume.location} | ${resume.phone} | ${resume.email}
            ${resume.website ? ` | ${resume.website}` : ''}
            ${resume.github ? `<br/>GitHub: ${resume.github.replace('https://', '')}` : ''}
            ${resume.linkedin ? ` | LinkedIn: ${resume.linkedin.replace('https://', '')}` : ''}
          </div>
        </div>

        <div class="section-title">Professional Summary</div>
        <div style="font-size: 10pt; text-align: justify; line-height: 1.4;">${resume.summary}</div>

        <div class="section-title">Core Skills</div>
        <div class="skills-grid">
          <span class="skills-label">Languages:</span>
          <span>${resume.skills.languages.join(', ')}</span>
          <span class="skills-label">Frameworks:</span>
          <span>${resume.skills.frameworks.join(', ')}</span>
          <span class="skills-label">Tools:</span>
          <span>${resume.skills.tools.join(', ')}</span>
        </div>

        <div class="section-title">Professional Experience</div>
        ${experiencesHtml}

        <div class="section-title">Key Projects</div>
        ${projectsHtml}

        <div class="section-title">Education</div>
        ${educationHtml}

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
