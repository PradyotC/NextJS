import {
	faAndroid, faAngular, faAws, faCss3Alt, faDocker, faGolang, faHtml5,
	faJava, faJs, faMicrosoft, faNodeJs, faPhp, faPython, faReact, faSwift
} from '@fortawesome/free-brands-svg-icons';
import {
	faDatabase, faFire, faLeaf, faRankingStar, faTrophy,
	IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { JSX } from 'react';

export const PERSONAL_INFO = {
	name: "Pradyot Chhatwani",
	role: "Computer Science Professional",
	location: "Thane, Maharashtra, India",
	email: "pradyot.o.c@gmail.com",
	phone: "+91 9769667429",
	bio: "Highly motivated computer science professional with a strong background in software engineering, data analysis, and game development. Passionate about world geography, cultures, and sports (Football, F1, Cricket, Kabaddi).",
};

// --- FIXED TYPES ---
export type SkillItem = {
	item: string;
	// Allow both standard FA Icons AND custom JSX (like your C++ composite)
	icon: IconDefinition | JSX.Element;
	color?: string;
};

type SkillCategory = {
	category: string;
	items: SkillItem[];
};


export type Project = {
	id: number;
	name: string;
	description: string;
	image: string;
	category: 'All' | 'Web Development' | 'Software Development' | 'Others';
	code?: string;
	demo?: string;
	publication?: string;
	video?: string;
	// Add additional fields as necessary
};

// 1. NextJS Logo (Black/White, modern)
const NextJsLogo = () => (
	<svg height="1024pt" viewBox=".5 -.2 1023 1024.1" width="1024pt" xmlns="http://www.w3.org/2000/svg">
		<path d="m478.5.6c-2.2.2-9.2.9-15.5 1.4-145.3 13.1-281.4 91.5-367.6 212-48 67-78.7 143-90.3 223.5-4.1 28.1-4.6 36.4-4.6 74.5s.5 46.4 4.6 74.5c27.8 192.1 164.5 353.5 349.9 413.3 33.2 10.7 68.2 18 108 22.4 15.5 1.7 82.5 1.7 98 0 68.7-7.6 126.9-24.6 184.3-53.9 8.8-4.5 10.5-5.7 9.3-6.7-.8-.6-38.3-50.9-83.3-111.7l-81.8-110.5-102.5-151.7c-56.4-83.4-102.8-151.6-103.2-151.6-.4-.1-.8 67.3-1 149.6-.3 144.1-.4 149.9-2.2 153.3-2.6 4.9-4.6 6.9-8.8 9.1-3.2 1.6-6 1.9-21.1 1.9h-17.3l-4.6-2.9c-3-1.9-5.2-4.4-6.7-7.3l-2.1-4.5.2-200.5.3-200.6 3.1-3.9c1.6-2.1 5-4.8 7.4-6.1 4.1-2 5.7-2.2 23-2.2 20.4 0 23.8.8 29.1 6.6 1.5 1.6 57 85.2 123.4 185.9s157.2 238.2 201.8 305.7l81 122.7 4.1-2.7c36.3-23.6 74.7-57.2 105.1-92.2 64.7-74.3 106.4-164.9 120.4-261.5 4.1-28.1 4.6-36.4 4.6-74.5s-.5-46.4-4.6-74.5c-27.8-192.1-164.5-353.5-349.9-413.3-32.7-10.6-67.5-17.9-106.5-22.3-9.6-1-75.7-2.1-84-1.3zm209.4 309.4c4.8 2.4 8.7 7 10.1 11.8.8 2.6 1 58.2.8 183.5l-.3 179.8-31.7-48.6-31.8-48.6v-130.7c0-84.5.4-132 1-134.3 1.6-5.6 5.1-10 9.9-12.6 4.1-2.1 5.6-2.3 21.3-2.3 14.8 0 17.4.2 20.7 2z" /><path d="m784.3 945.1c-3.5 2.2-4.6 3.7-1.5 2 2.2-1.3 5.8-4 5.2-4.1-.3 0-2 1-3.7 2.1zm-6.9 4.5c-1.8 1.4-1.8 1.5.4.4 1.2-.6 2.2-1.3 2.2-1.5 0-.8-.5-.6-2.6 1.1zm-5 3c-1.8 1.4-1.8 1.5.4.4 1.2-.6 2.2-1.3 2.2-1.5 0-.8-.5-.6-2.6 1.1zm-5 3c-1.8 1.4-1.8 1.5.4.4 1.2-.6 2.2-1.3 2.2-1.5 0-.8-.5-.6-2.6 1.1zm-7.6 4c-3.8 2-3.6 2.8.2.9 1.7-.9 3-1.8 3-2 0-.7-.1-.6-3.2 1.1z" />
	</svg>
);

// 2. Django Logo (Clean official 'D' shape, set to brand color)
const DjangoLogo = () => (
	<svg width="800px" height="800px" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
		<g>
			<rect fill="#092E20" x="0" y="0" width="256" height="256" rx="28">

			</rect>
			<path d="M186.377012,94.197636 L186.377012,160.424478 C186.377012,183.243286 184.707519,194.187745 179.699037,203.649406 C175.060358,212.741266 168.937684,218.490548 156.323731,224.798721 L129.794937,212.183571 C142.410087,206.247593 148.531564,201.05481 152.427049,193.074749 C156.509231,184.91278 157.808923,175.451119 157.808923,150.593015 L157.808923,94.197636 L186.377012,94.197636 Z M140.928486,50.0787207 L140.928486,182.316986 C126.272844,185.099476 115.512688,186.212472 103.826231,186.212472 C68.9487718,186.212472 50.7686431,170.445031 50.7686431,140.205054 C50.7686431,111.079269 70.0629644,92.1583404 99.9295492,92.1583404 C104.567032,92.1583404 108.091519,92.5281423 112.359199,93.6411381 L112.359199,50.0787207 L140.928486,50.0787207 Z M102.713236,115.160254 C88.243093,115.160254 79.8944275,124.065418 79.8944275,139.647359 C79.8944275,154.860696 87.8720944,163.208164 102.527736,163.208164 C105.680028,163.208164 108.278215,163.022665 112.359199,162.467364 L112.359199,116.643052 C109.020212,115.531253 106.237722,115.160254 102.713236,115.160254 Z M186.377012,50.2307105 L186.377012,79.5419941 L157.808923,79.5419941 L157.808923,50.2307105 L186.377012,50.2307105 Z" fill="#FFFFFD">

			</path>
		</g>
	</svg>
);

// 3. C/C++ Logo (Simplified C++ on blue background)
const CPlusPlusLogo = () => (
	<svg fill="#00599C" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="500px" height="500px">
		<path d="M 43.910156 12.003906 L 27.070313 2.539063 C 25.792969 1.824219 24.207031 1.824219 22.929688 2.539063 L 6.089844 12.003906 C 4.800781 12.726563 4 14.082031 4 15.535156 L 4 34.464844 C 4 35.917969 4.800781 37.273438 6.089844 37.996094 L 22.929688 47.460938 C 23.570313 47.820313 24.285156 48 25 48 C 25.714844 48 26.429688 47.820313 27.070313 47.460938 L 43.910156 37.996094 C 45.199219 37.273438 46 35.917969 46 34.464844 L 46 15.535156 C 46 14.082031 45.199219 12.726563 43.910156 12.003906 Z M 25 37 C 18.382813 37 13 31.617188 13 25 C 13 18.382813 18.382813 13 25 13 C 28.78125 13 32.273438 14.753906 34.542969 17.742188 L 30.160156 20.277344 C 28.84375 18.835938 26.972656 18 25 18 C 21.140625 18 18 21.140625 18 25 C 18 28.859375 21.140625 32 25 32 C 26.972656 32 28.84375 31.164063 30.160156 29.722656 L 34.542969 32.257813 C 32.273438 35.246094 28.78125 37 25 37 Z M 37 26 L 35 26 L 35 28 L 33 28 L 33 26 L 31 26 L 31 24 L 33 24 L 33 22 L 35 22 L 35 24 L 37 24 Z M 44 26 L 42 26 L 42 28 L 40 28 L 40 26 L 38 26 L 38 24 L 40 24 L 40 22 L 42 22 L 42 24 L 44 24 Z" />
	</svg>
);


export const SKILLS: SkillCategory[] = [
	{
		category: "Languages",
		items: [
			{ item: "Python", icon: faPython, color: "#3776AB" },
			{ item: "JavaScript", icon: faJs, color: "#F7DF1E" },
			{ item: "Java", icon: faJava, color: "#007396" },
			// REPLACED C/C++ FONT AWESOME COMBO with Custom SVG
			{ item: "C/C++", icon: <CPlusPlusLogo /> },
			{ item: "Go", icon: faGolang, color: "#00ADD8" },
			{ item: "PHP", icon: faPhp, color: "#777BB4" },
			{ item: "Swift", icon: faSwift, color: "#F05138" },
		],
	},
	{
		category: "Frameworks",
		items: [
			{ item: "React", icon: faReact, color: "#61DAFB" },
			{ item: "Node.js", icon: faNodeJs, color: "#339933" },
			// REPLACED NextJS faN with Custom SVG
			{ item: "NextJS", icon: <NextJsLogo /> },
			{ item: "Angular", icon: faAngular, color: "#DD0031" },
			// REPLACED Django FA COMBO with Custom SVG
			{ item: "Django", icon: <DjangoLogo /> },
			{ item: "Android", icon: faAndroid, color: "#3DDC84" },
		],
	},
	{
		category: "Technologies",
		items: [
			{ item: "HTML5", icon: faHtml5, color: "#E34F26" },
			{ item: "CSS3", icon: faCss3Alt, color: "#1572B6" },
			{ item: "MySQL", icon: faDatabase, color: "#4479A1" },
			{ item: "MongoDB", icon: faLeaf, color: "#47A248" },
			{ item: "Firebase", icon: faFire, color: "#FFCA28" },
			{ item: "AWS", icon: faAws, color: "#232F3E" },
			{ item: "Docker", icon: faDocker, color: "#2496ED" },
		],
	},
];

export const TIMELINE = [
	{
		id: 1,
		type: "education",
		title: "MS in Computer Science",
		org: "University of Southern California",
		date: "Jan 2022 - Dec 2023",
		desc: "Grade: 3.71/4. Viterbi School of Engineering.",
	},
	{
		id: 2,
		type: "work",
		title: "STEM ED Researcher",
		org: "USC Viterbi School of Engineering",
		date: "Nov 2022 - Apr 2025",
		desc: "Designing and delivering technical lessons on robotics and coding to primary students.",
	},
	{
		id: 3,
		type: "education",
		title: "BE in Computer Engineering",
		org: "University of Mumbai (VESIT)",
		date: "Aug 2017 - June 2021",
		desc: "Grade: 9.02/10.",
	},
	{
		id: 4,
		type: "work",
		title: "Web Developer Intern",
		org: "VESIT Renaissance Cell",
		date: "Dec 2018 - Jan 2019",
		desc: "Developed a library management system using Bootstrap 4 and Java Servlets.",
	}
];

export const sampleProjects: Project[] = [
	{
		id: 1,
		name: 'Fantasy Plot Hole Recognizer',
		description: 'Technologies: Python, BERT, Knowledge Graph',
		image: '/noImage.svg', // Replace with path to your image
		category: 'Software Development',
		code: 'https://github.com/PradyotC/NLP-plot-hole-detection',
		publication: 'https://drive.google.com/file/d/1FEhLJsxEb2ZxJt8uwvZYB7hhI0P0-uYd/view',
	},
	{
		id: 2,
		name: 'Endless Runner (Game)',
		description: 'Technologies: Unity, C#, WebGL',
		image: '/noImage.svg', // Replace with path to your image
		category: 'Software Development',
		code: 'https://github.com/PradyotC/Captain_Prady',
		demo: 'https://play.unity.com/mg/other/build-gdq-1',
	},
	{
		id: 3,
		name: 'Cloud Storage Management System',
		description: 'Technologies: Owncloud, Heroku, Flask',
		image: '/noImage.svg', // Replace with path to your image
		category: 'Web Development',
		code: 'https://github.com/PradyotC/D17B_CC_Project',
		video: 'https://drive.google.com/file/d/10yJ14vFIw7KqgyHlR3kA37DhxaSeXcaI/view'
	},
	{
		id: 4,
		name: 'Currency Detection System',
		description: 'Technologies: OpenCV, ORB, Brute Force Matcher',
		image: '/noImage.svg', // Replace with path to your image
		category: 'Others',
		code: 'https://github.com/PradyotC/Currency-Detection-System',
	},
	{
		id: 5,
		name: 'GIS Approach to Determine Suitability of Trees for Afforestation',
		description: 'Technologies: ESRI ArcGIS Pro',
		image: '/noImage.svg', // Replace with path to your image
		category: 'Others',
		publication: 'https://www.ijircst.org/DOC/3-gis-approach-to-determine-suitability-of-trees-for-afforestation.pdf'
	},
	{
		id: 6,
		name: 'Relational DB and Query Language',
		description: 'Technologies: Python, RegEx, CMD',
		image: '/noImage.svg', // Replace with path to your image
		category: 'Software Development',
		code: 'https://github.com/PradyotC/DSCI-551-project',
	},
	{
		id: 7,
		name: 'Ebay Search Using Angular',
		description: 'Technologies: Angular, Node JS',
		image: '/noImage.svg', // Replace with path to your image
		category: 'Web Development',
		code: 'https://github.com/PradyotC/Ebay-Angular',
		demo: 'https://frontend-412720.uw.r.appspot.com/',
	},
	{
		id: 8,
		name: 'Ebay Search Using Flask',
		description: 'Technologies: Flask, Express JS, Python',
		image: '/noImage.svg', // Replace with path to your image
		category: 'Web Development',
		code: 'https://github.com/PradyotC/Ebay-Flask/',
		demo: 'https://flaskproject-412708.uw.r.appspot.com',
	}
];

export const ACHIEVEMENTS = [
	{
		id: 1,
		title: "Buoyanci Innovation Challenge",
		desc: "2nd Prize among 150 groups. Won ₹12,000.",
		icon: faTrophy
	},
	{
		id: 2,
		title: "Microsoft AI for Earth Grant",
		desc: "Led project with $13,446 Azure credits.",
		icon: faMicrosoft
	},
	{ id:3,
		title: "Quarter-Finalist in India Innovation Challenge Design Contest 2019",
		desc: "Competed amoung 2000+ teams",
		icon: faRankingStar
	}
];

