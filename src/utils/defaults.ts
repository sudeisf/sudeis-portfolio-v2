import { Project, ExperienceItem } from '../types';
import heroPortrait from '../assets/images/developer_hero_portrait_1782223685372.jpg';
import aboutPortrait from '../assets/images/developer_about_portrait_1782223704213.jpg';
import ogPortrait from '../assets/images/sudeis_portrait_1782228695665.jpg';

export const DEFAULT_HERO_IMAGE = heroPortrait;
export const DEFAULT_ABOUT_IMAGE = aboutPortrait;
export const DEFAULT_OG_IMAGE = ogPortrait;

export const DEFAULT_PROJECTS: Project[] = [];

export const DEFAULT_EXPERIENCES: ExperienceItem[] = [
  {
    id: 'kuraztech',
    role: 'Back End Developer Intern',
    company: 'Kuraztech',
    period: 'Jul 2025 - Oct 2025',
    bullets: [
      'Led the backend team and collaborated closely with frontend developers.',
      'Designed and implemented RESTful APIs with comprehensive API documentation.',
      'Improved system performance by ~35% using background queues and scheduled tasks.',
      'Developed secure callback webhooks for Chapa payment integration.',
      'Integrated Cloudinary for media/file uploads and implemented automated email services.'
    ],
    technologies: ['Laravel', 'PHP', 'MySQL', 'Redis', 'Cloudinary', 'Chapa API', 'RESTful APIs', 'Queues & Scheduling'],
  },
  {
    id: 'essti',
    role: 'Full-stack Developer Intern (ETHIOPIAN SPACE SCIENCE AND TECHNOLOGY INSTITUTE)',
    company: 'ESSTI',
    period: 'Mar 2025 - Jun 2025',
    bullets: [
      'Developed and designed scalable RESTful APIs using Django and DRF for a vehicle fleet management system.',
      'Built core backend logic for tracking, updating, and managing vehicles, drivers, and trip assignments.',
      'Integrated OpenStreetMap into the admin dashboard for real-time vehicle location visualization.',
      'Collaborated with frontend team for smooth API consumption and handled backend optimization.',
      'Gained hands-on experience with database modeling, user authentication, and role-based permissions.'
    ],
    technologies: ['Django', 'Django REST Framework'],
  }
];
