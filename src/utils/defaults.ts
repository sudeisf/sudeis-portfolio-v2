import { Project } from '../types';
import heroPortrait from '../assets/images/developer_hero_portrait_1782223685372.jpg';
import aboutPortrait from '../assets/images/developer_about_portrait_1782223704213.jpg';
import ogPortrait from '../assets/images/sudeis_portrait_1782228695665.jpg';
import project1 from '../assets/images/website_project_1_1782223721946.jpg';
import project2 from '../assets/images/website_project_2_1782223736929.jpg';
import project3 from '../assets/images/poster_designs_1782223754679.jpg';
import project4 from '../assets/images/website_ui_mockups_1782223770173.jpg';

export const DEFAULT_HERO_IMAGE = heroPortrait;
export const DEFAULT_ABOUT_IMAGE = aboutPortrait;
export const DEFAULT_OG_IMAGE = ogPortrait;

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'WEBSITE PROJECT 1',
    category: 'Analytics Dashboard',
    image: project1,
    description: 'A powerful backend telemetry engine and dark dashboard presenting live service state updates.',
    fullDescription:
      'WEBSITE PROJECT 1 represents a high-performance backend integration featuring real-time data ingestion, Redis stream aggregation, and a low-latency analytics frontend. Engineered to process complex telemetry markers with tight performance overhead and present them through an eye-safe dark slate interface.',
    technologies: ['FastAPI', 'Redis', 'React', 'Tailwind CSS', 'Recharts', 'Docker'],
    link: 'https://demo.sudeisfedl.dev/analytics',
  },
  {
    id: 'proj-2',
    title: 'WEBSITE PROJECT 2',
    category: 'Architectural Portfolio',
    image: project2,
    description: 'A gorgeous editorial architecture catalog highlighting spatial minimalism with fluid, typography-driven states.',
    fullDescription:
      'WEBSITE PROJECT 2 is a tailored responsive mobile and desktop platform optimized for architectural showcases. Focused around rigorous grids, high-fidelity images with cross-fade transition cues, and custom routing states that mimic the elegant tactile flipping of a physical design magazine.',
    technologies: ['Laravel', 'PHP', 'React', 'Motion', 'PostgreSQL', 'Cloudinary'],
    link: 'https://demo.sudeisfedl.dev/architecture-catalog',
  },
  {
    id: 'proj-3',
    title: 'POSTER DESIGNS',
    category: 'Digital Art Collective',
    image: project3,
    description: 'Abstract mesh topologies and node clouds designed representing secure system architectures.',
    fullDescription:
      'POSTER DESIGNS is a visual exploration mapping node network complexities into fine-art vector prints. Employs mathematically generated glowing mesh clouds, 3D particles, and geometric vector lines to translate complex system backends into aesthetic graphic diagrams.',
    technologies: ['D3.js', 'Canvas API', 'Adobe Illustrator', 'WebGL'],
    link: 'https://demo.sudeisfedl.dev/posters',
  },
  {
    id: 'proj-4',
    title: 'WEBSITE UI MOCKUPS',
    category: 'Luxury Web Mockup',
    image: project4,
    description: 'High-end responsive user interfaces optimized for modern web layouts on clean physical displays.',
    fullDescription:
      'WEBSITE UI MOCKUPS delivers a suite of beautiful reusable wireframe templates and high-fidelity layouts featuring pixel-perfect grid compositions, adaptive editorial panels, and responsive media scaling utilities designed specifically for high-end boutique brands.',
    technologies: ['Figma', 'Next.js', 'Tailwind CSS', 'TypeScript'],
    link: 'https://demo.sudeisfedl.dev/luxury-mockups',
  },
];
