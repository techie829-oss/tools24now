'use client';

import React, { useState } from 'react';
import { Download, Plus, Trash2, Eye, Briefcase, GraduationCap, Award, User, Github, Linkedin, Twitter, Globe, FileText, FolderGit2, Mail, Phone, MapPin } from 'lucide-react';
import jsPDF from 'jspdf';
import { renderToStaticMarkup } from 'react-dom/server';

type Template = 'professional' | 'modern' | 'minimal';

interface ContactInfo {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    twitter: string;
    portfolio: string;
}

interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

interface Education {
    id: string;
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa: string;
}

interface Project {
    id: string;
    name: string;
    role: string;
    link: string;
    description: string;
    technologies: string;
}

interface Skill {
    id: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export default function ResumeBuilder() {
    const [template, setTemplate] = useState<Template>('professional');
    const [showPreview, setShowPreview] = useState(true);

    const [contact, setContact] = useState<ContactInfo>({
        name: 'John Doe',
        title: 'Full Stack Developer',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        website: 'johndoe.dev',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        twitter: '@johndoe',
        portfolio: 'portfolio.johndoe.dev'
    });

    const [summary, setSummary] = useState('Passionate Full Stack Developer with 5+ years of experience building scalable web applications. Expert in React, Node.js, and Cloud Architecture. Proven track record of delivering high-quality code and leading engineering teams.');

    const [experiences, setExperiences] = useState<Experience[]>([
        {
            id: '1',
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            startDate: '2021-01',
            endDate: '',
            current: true,
            description: 'Led development of microservices architecture serving 1M+ users. Optimized database queries reducing latency by 40%.'
        }
    ]);

    const [education, setEducation] = useState<Education[]>([
        {
            id: '1',
            degree: 'Bachelor of Science in Computer Science',
            school: 'University of California',
            location: 'Berkeley, CA',
            graduationDate: '2020-05',
            gpa: '3.8'
        }
    ]);

    const [projects, setProjects] = useState<Project[]>([
        {
            id: '1',
            name: 'E-Commerce Platform',
            role: 'Lead Developer',
            link: 'github.com/johndoe/shop',
            description: 'Built a full-featured e-commerce platform with Stripe payment integration.',
            technologies: 'Next.js, Tailwind CSS, Stripe, PostgreSQL'
        }
    ]);

    const [skills, setSkills] = useState<Skill[]>([
        { id: '1', name: 'React', level: 'Expert' },
        { id: '2', name: 'Node.js', level: 'Advanced' },
        { id: '3', name: 'TypeScript', level: 'Advanced' },
        { id: '4', name: 'AWS', level: 'Intermediate' }
    ]);

    // -- Helpers for Icon Generation --
    const svgToPngDataUrl = (svgString: string, width: number, height: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    reject(new Error('Canvas context not found'));
                }
                URL.revokeObjectURL(url);
            };
            img.onerror = (e) => {
                URL.revokeObjectURL(url);
                reject(e);
            };
            img.src = url;
        });
    };

    const getIconDataUrl = async (IconComponent: React.ElementType, color: string = '#4b5563') => {
        const svgString = renderToStaticMarkup(
            <IconComponent
                width={24}
                height={24}
                stroke={color}
                strokeWidth={2}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            />
        );
        return await svgToPngDataUrl(svgString, 24, 24);
    };

    // -- Handlers --

    const addExperience = () => {
        setExperiences([...experiences, {
            id: Date.now().toString(),
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        }]);
    };

    const removeExperience = (id: string) => {
        setExperiences(experiences.filter(exp => exp.id !== id));
    };

    const addEducation = () => {
        setEducation([...education, {
            id: Date.now().toString(),
            degree: '',
            school: '',
            location: '',
            graduationDate: '',
            gpa: ''
        }]);
    };

    const removeEducation = (id: string) => {
        setEducation(education.filter(edu => edu.id !== id));
    };

    const addProject = () => {
        setProjects([...projects, {
            id: Date.now().toString(),
            name: '',
            role: '',
            link: '',
            description: '',
            technologies: ''
        }]);
    };

    const removeProject = (id: string) => {
        setProjects(projects.filter(proj => proj.id !== id));
    };

    const addSkill = () => {
        setSkills([...skills, {
            id: Date.now().toString(),
            name: '',
            level: 'Intermediate'
        }]);
    };

    const removeSkill = (id: string) => {
        setSkills(skills.filter(skill => skill.id !== id));
    };

    const generatePDF = async () => {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        // Generate Icons
        // We use a light grey for neutral icons: #4b5563 (rgb 75, 85, 99)
        const iconColor = '#4b5563';
        const [
            emailIcon,
            phoneIcon,
            locIcon,
            linkedinIcon,
            githubIcon,
            globeIcon,
            twitterIcon
        ] = await Promise.all([
            getIconDataUrl(Mail, iconColor),
            getIconDataUrl(Phone, iconColor),
            getIconDataUrl(MapPin, iconColor),
            getIconDataUrl(Linkedin, iconColor),
            getIconDataUrl(Github, iconColor),
            getIconDataUrl(Globe, iconColor),
            getIconDataUrl(Twitter, iconColor)
        ]);

        // Helper for sections
        const checkPageBreak = (spaceNeeded: number) => {
            if (y + spaceNeeded > 280) {
                pdf.addPage();
                y = 20;
            }
        };

        // Header
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(contact.name, pageWidth / 2, y, { align: 'center' });
        y += 8;

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100);
        pdf.text(contact.title, pageWidth / 2, y, { align: 'center' });
        y += 10;

        // Contact Info Row (Centered with Icons)
        pdf.setFontSize(9);
        pdf.setTextColor(80);

        const contactItems = [
            { icon: emailIcon, text: contact.email },
            { icon: phoneIcon, text: contact.phone },
            { icon: locIcon, text: contact.location }
        ].filter(i => i.text);

        const socialItems = [
            { icon: globeIcon, text: contact.website },
            { icon: linkedinIcon, text: contact.linkedin },
            { icon: githubIcon, text: contact.github },
            { icon: twitterIcon, text: contact.twitter }
        ].filter(i => i.text);

        // Helper to draw a row of items centered
        const drawIconRow = (items: { icon: string, text: string }[], startY: number) => {
            const iconSize = 3; // mm
            const gap = 1.5; // gap between icon and text
            const itemGap = 6; // gap between items

            // Calculate total width
            let totalWidth = 0;
            items.forEach((item, idx) => {
                const textWidth = pdf.getTextWidth(item.text);
                totalWidth += iconSize + gap + textWidth;
                if (idx < items.length - 1) totalWidth += itemGap;
            });

            let currentX = (pageWidth - totalWidth) / 2;

            items.forEach((item, idx) => {
                // Draw Icon
                pdf.addImage(item.icon, 'PNG', currentX, startY - 2.5, iconSize, iconSize);
                currentX += iconSize + gap;

                // Draw Text
                pdf.text(item.text, currentX, startY);
                currentX += pdf.getTextWidth(item.text);

                if (idx < items.length - 1) currentX += itemGap;
            });
        };

        if (contactItems.length > 0) {
            drawIconRow(contactItems, y);
            y += 6;
        }

        if (socialItems.length > 0) {
            drawIconRow(socialItems, y);
            y += 6;
        }

        y += 6; // Extra spacing after header

        pdf.setTextColor(0);

        // Summary
        if (summary) {
            checkPageBreak(30);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Professional Summary', margin, y);
            y += 6;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const summaryLines = pdf.splitTextToSize(summary, pageWidth - 40);
            pdf.text(summaryLines, margin, y);
            y += (summaryLines.length * 5) + 6;
        }

        // Experience
        if (experiences.length > 0) {
            checkPageBreak(30);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Experience', margin, y);
            pdf.setLineWidth(0.5);
            pdf.line(margin, y + 2, pageWidth - margin, y + 2);
            y += 8;

            experiences.forEach((exp) => {
                checkPageBreak(35);
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text(exp.title, margin, y);

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                const dateStr = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`;
                pdf.text(dateStr, pageWidth - margin, y, { align: 'right' });
                y += 5;

                pdf.setFont('helvetica', 'italic');
                pdf.text(`${exp.company} | ${exp.location}`, margin, y);
                y += 6;

                pdf.setFont('helvetica', 'normal');
                const descLines = pdf.splitTextToSize(exp.description, pageWidth - 40);
                pdf.text(descLines, margin, y);
                y += (descLines.length * 5) + 6;
            });
        }

        // Projects
        if (projects.length > 0) {
            checkPageBreak(30);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Projects', margin, y);
            pdf.setLineWidth(0.5);
            pdf.line(margin, y + 2, pageWidth - margin, y + 2);
            y += 8;

            projects.forEach((proj) => {
                checkPageBreak(25);
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text(proj.name, margin, y);

                if (proj.link) {
                    pdf.setFontSize(9);
                    pdf.setTextColor(0, 0, 255);
                    pdf.text(proj.link, pageWidth - margin, y, { align: 'right' });
                    pdf.setTextColor(0);
                }
                y += 5;

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'italic');
                pdf.text(proj.role, margin, y);
                y += 5;

                pdf.setFont('helvetica', 'normal');
                const descLines = pdf.splitTextToSize(`${proj.description} (${proj.technologies})`, pageWidth - 40);
                pdf.text(descLines, margin, y);
                y += (descLines.length * 5) + 6;
            });
        }

        // Education
        if (education.length > 0) {
            checkPageBreak(25);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Education', margin, y);
            pdf.setLineWidth(0.5);
            pdf.line(margin, y + 2, pageWidth - margin, y + 2);
            y += 8;

            education.forEach((edu) => {
                checkPageBreak(25);
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.text(edu.degree, margin, y);

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.text(edu.graduationDate, pageWidth - margin, y, { align: 'right' });
                y += 5;

                pdf.text(`${edu.school}, ${edu.location}`, margin, y);
                if (edu.gpa) {
                    pdf.text(`GPA: ${edu.gpa}`, pageWidth - margin, y, { align: 'right' });
                }
                y += 6;
            });
            y += 4;
        }

        // Skills
        if (skills.length > 0) {
            checkPageBreak(30);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Skills', margin, y);
            pdf.setLineWidth(0.5);
            pdf.line(margin, y + 2, pageWidth - margin, y + 2);
            y += 8;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const skillsText = skills.map(s => `${s.name} (${s.level})`).join(', ');
            const skillLines = pdf.splitTextToSize(skillsText, pageWidth - 40);
            pdf.text(skillLines, margin, y);
        }

        pdf.save(`${contact.name.replace(/\s+/g, '_')}_Resume.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                        Professional Resume Builder
                    </h1>
                    <p className="mt-2 text-lg text-gray-500">
                        Create a full professional resume with GitHub, LinkedIn, and Projects.
                    </p>
                </div>

                <div className="flex justify-center gap-3 mb-6">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
                    >
                        <Eye className="w-4 h-4" />
                        {showPreview ? 'Hide' : 'Show'} Preview
                    </button>
                    <button
                        onClick={generatePDF}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* --- EDITOR COLUMN --- */}
                    <div className="space-y-4">

                        {/* 1. Contact Info */}
                        <div className="bg-white rounded-xl shadow p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                Contact & Socials
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={contact.name}
                                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                                    className="col-span-2 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Professional Title"
                                    value={contact.title}
                                    onChange={(e) => setContact({ ...contact, title: e.target.value })}
                                    className="col-span-2 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={contact.email}
                                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone"
                                    value={contact.phone}
                                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={contact.location}
                                    onChange={(e) => setContact({ ...contact, location: e.target.value })}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Website/Portfolio"
                                    value={contact.website}
                                    onChange={(e) => setContact({ ...contact, website: e.target.value })}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                                {/* New Social Fields */}
                                <input
                                    type="text"
                                    placeholder="LinkedIn URL"
                                    value={contact.linkedin}
                                    onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 col-span-2"
                                />
                                <input
                                    type="text"
                                    placeholder="GitHub URL"
                                    value={contact.github}
                                    onChange={(e) => setContact({ ...contact, github: e.target.value })}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Twitter/X"
                                    value={contact.twitter}
                                    onChange={(e) => setContact({ ...contact, twitter: e.target.value })}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* 2. Professional Summary */}
                        <div className="bg-white rounded-xl shadow p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Professional Summary
                            </h3>
                            <textarea
                                placeholder="Write a brief professional summary..."
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 resize-none"
                                rows={4}
                            />
                        </div>

                        {/* 3. Experience */}
                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                    Experience
                                </h3>
                                <button onClick={addExperience} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {experiences.map((exp, idx) => (
                                    <div key={exp.id} className="p-3 border border-gray-200 rounded relative bg-gray-50">
                                        <button onClick={() => removeExperience(exp.id)} className="absolute top-1 right-1 text-red-500 hover:bg-red-50 p-0.5 rounded">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <input
                                            type="text"
                                            placeholder="Job Title"
                                            value={exp.title}
                                            onChange={(e) => {
                                                const newExp = [...experiences];
                                                newExp[idx].title = e.target.value;
                                                setExperiences(newExp);
                                            }}
                                            className="w-full mb-2 px-2 py-1 text-sm border border-gray-300 rounded"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Company"
                                            value={exp.company}
                                            onChange={(e) => {
                                                const newExp = [...experiences];
                                                newExp[idx].company = e.target.value;
                                                setExperiences(newExp);
                                            }}
                                            className="w-full mb-2 px-2 py-1 text-sm border border-gray-300 rounded"
                                        />
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <input
                                                type="month"
                                                value={exp.startDate}
                                                onChange={(e) => {
                                                    const newExp = [...experiences];
                                                    newExp[idx].startDate = e.target.value;
                                                    setExperiences(newExp);
                                                }}
                                                className="px-2 py-1 text-xs border border-gray-300 rounded"
                                            />
                                            <input
                                                type="month"
                                                value={exp.endDate}
                                                disabled={exp.current}
                                                onChange={(e) => {
                                                    const newExp = [...experiences];
                                                    newExp[idx].endDate = e.target.value;
                                                    setExperiences(newExp);
                                                }}
                                                className="px-2 py-1 text-xs border border-gray-300 rounded disabled:bg-gray-100"
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Job Description"
                                            value={exp.description}
                                            onChange={(e) => {
                                                const newExp = [...experiences];
                                                newExp[idx].description = e.target.value;
                                                setExperiences(newExp);
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                                            rows={2}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Projects (New) */}
                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <FolderGit2 className="w-4 h-4 text-blue-600" />
                                    Projects
                                </h3>
                                <button onClick={addProject} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {projects.map((proj, idx) => (
                                    <div key={proj.id} className="p-3 border border-gray-200 rounded relative bg-gray-50">
                                        <button onClick={() => removeProject(proj.id)} className="absolute top-1 right-1 text-red-500 hover:bg-red-50 p-0.5 rounded">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <input
                                            type="text"
                                            placeholder="Project Name"
                                            value={proj.name}
                                            onChange={(e) => {
                                                const newProj = [...projects];
                                                newProj[idx].name = e.target.value;
                                                setProjects(newProj);
                                            }}
                                            className="w-full mb-2 px-2 py-1 text-sm border border-gray-300 rounded"
                                        />
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <input
                                                type="text"
                                                placeholder="Role (e.g. Creator)"
                                                value={proj.role}
                                                onChange={(e) => {
                                                    const newProj = [...projects];
                                                    newProj[idx].role = e.target.value;
                                                    setProjects(newProj);
                                                }}
                                                className="px-2 py-1 text-sm border border-gray-300 rounded"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Repo Link"
                                                value={proj.link}
                                                onChange={(e) => {
                                                    const newProj = [...projects];
                                                    newProj[idx].link = e.target.value;
                                                    setProjects(newProj);
                                                }}
                                                className="px-2 py-1 text-sm border border-gray-300 rounded"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Technologies (React, AWS...)"
                                            value={proj.technologies}
                                            onChange={(e) => {
                                                const newProj = [...projects];
                                                newProj[idx].technologies = e.target.value;
                                                setProjects(newProj);
                                            }}
                                            className="w-full mb-2 px-2 py-1 text-sm border border-gray-300 rounded"
                                        />
                                        <textarea
                                            placeholder="Project Description"
                                            value={proj.description}
                                            onChange={(e) => {
                                                const newProj = [...projects];
                                                newProj[idx].description = e.target.value;
                                                setProjects(newProj);
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                                            rows={2}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 5. Education */}
                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-blue-600" />
                                    Education
                                </h3>
                                <button onClick={addEducation} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {education.map((edu, idx) => (
                                    <div key={edu.id} className="p-3 border border-gray-200 rounded relative bg-gray-50">
                                        <button onClick={() => removeEducation(edu.id)} className="absolute top-1 right-1 text-red-500 hover:bg-red-50 p-0.5 rounded">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <input
                                            type="text"
                                            placeholder="Degree"
                                            value={edu.degree}
                                            onChange={(e) => {
                                                const newEdu = [...education];
                                                newEdu[idx].degree = e.target.value;
                                                setEducation(newEdu);
                                            }}
                                            className="w-full mb-2 px-2 py-1 text-sm border border-gray-300 rounded"
                                        />
                                        <input
                                            type="text"
                                            placeholder="School"
                                            value={edu.school}
                                            onChange={(e) => {
                                                const newEdu = [...education];
                                                newEdu[idx].school = e.target.value;
                                                setEducation(newEdu);
                                            }}
                                            className="w-full mb-2 px-2 py-1 text-sm border border-gray-300 rounded"
                                        />
                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Location"
                                                value={edu.location}
                                                onChange={(e) => {
                                                    const newEdu = [...education];
                                                    newEdu[idx].location = e.target.value;
                                                    setEducation(newEdu);
                                                }}
                                                className="px-2 py-1 text-xs border border-gray-300 rounded"
                                            />
                                            <input
                                                type="month"
                                                value={edu.graduationDate}
                                                onChange={(e) => {
                                                    const newEdu = [...education];
                                                    newEdu[idx].graduationDate = e.target.value;
                                                    setEducation(newEdu);
                                                }}
                                                className="px-2 py-1 text-xs border border-gray-300 rounded"
                                            />
                                            <input
                                                type="text"
                                                placeholder="GPA"
                                                value={edu.gpa}
                                                onChange={(e) => {
                                                    const newEdu = [...education];
                                                    newEdu[idx].gpa = e.target.value;
                                                    setEducation(newEdu);
                                                }}
                                                className="px-2 py-1 text-xs border border-gray-300 rounded"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 6. Skills */}
                        <div className="bg-white rounded-xl shadow p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-blue-600" />
                                    Skills
                                </h3>
                                <button onClick={addSkill} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {skills.map((skill, idx) => (
                                    <div key={skill.id} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Skill"
                                            value={skill.name}
                                            onChange={(e) => {
                                                const newSkills = [...skills];
                                                newSkills[idx].name = e.target.value;
                                                setSkills(newSkills);
                                            }}
                                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                        />
                                        <select
                                            value={skill.level}
                                            onChange={(e) => {
                                                const newSkills = [...skills];
                                                newSkills[idx].level = e.target.value as Skill['level'];
                                                setSkills(newSkills);
                                            }}
                                            className="px-2 py-1 text-xs border border-gray-300 rounded"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                            <option value="Expert">Expert</option>
                                        </select>
                                        <button onClick={() => removeSkill(skill.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- PREVIEW COLUMN --- */}
                    {showPreview && (
                        <div className="lg:sticky lg:top-6 h-fit">
                            <div className="bg-white shadow-xl rounded-lg overflow-hidden" style={{ aspectRatio: '210/297' }}>
                                <div className="h-full overflow-y-auto p-10 text-xs text-gray-800">
                                    {/* Header */}
                                    <div className="text-center border-b border-gray-300 pb-5 mb-5">
                                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">{contact.name}</h2>
                                        <p className="text-lg text-blue-700 font-medium mt-1">{contact.title}</p>

                                        <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs text-gray-600">
                                            {contact.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</div>}
                                            {contact.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</div>}
                                            {contact.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {contact.location}</div>}
                                        </div>

                                        {/* Social Links */}
                                        <div className="flex flex-wrap justify-center gap-4 mt-3 text-gray-600">
                                            {contact.website && (
                                                <div className="flex items-center gap-1">
                                                    <Globe className="w-3 h-3" /> {contact.website}
                                                </div>
                                            )}
                                            {contact.linkedin && (
                                                <div className="flex items-center gap-1">
                                                    <Linkedin className="w-3 h-3" /> {contact.linkedin}
                                                </div>
                                            )}
                                            {contact.github && (
                                                <div className="flex items-center gap-1">
                                                    <Github className="w-3 h-3" /> {contact.github}
                                                </div>
                                            )}
                                            {contact.twitter && (
                                                <div className="flex items-center gap-1">
                                                    <Twitter className="w-3 h-3" /> {contact.twitter}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    {summary && (
                                        <div className="mb-5">
                                            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2 uppercase tracking-wider">Professional Summary</h3>
                                            <p className="leading-relaxed text-gray-700">{summary}</p>
                                        </div>
                                    )}

                                    {/* Experience */}
                                    {experiences.length > 0 && (
                                        <div className="mb-5">
                                            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Experience</h3>
                                            {experiences.map((exp) => (
                                                <div key={exp.id} className="mb-4">
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="font-bold text-gray-900 text-sm">{exp.title}</h4>
                                                        <span className="text-gray-500 text-xs italic">
                                                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                                        </span>
                                                    </div>
                                                    <div className="text-blue-700 font-medium mb-1">{exp.company}, {exp.location}</div>
                                                    <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Projects */}
                                    {projects.length > 0 && (
                                        <div className="mb-5">
                                            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Projects</h3>
                                            {projects.map((proj) => (
                                                <div key={proj.id} className="mb-4">
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="font-bold text-gray-900 text-sm">{proj.name}</h4>
                                                        {proj.link && <span className="text-blue-500 text-xs underline">{proj.link}</span>}
                                                    </div>
                                                    <div className="text-gray-600 italic text-xs mb-1">{proj.role}</div>
                                                    <p className="text-gray-700 mb-1">{proj.description}</p>
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-semibold">Tech:</span> {proj.technologies}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Education */}
                                    {education.length > 0 && (
                                        <div className="mb-5">
                                            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Education</h3>
                                            {education.map((edu) => (
                                                <div key={edu.id} className="mb-2">
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="font-bold text-gray-900 text-sm">{edu.degree}</h4>
                                                        <span className="text-gray-500 text-xs">{edu.graduationDate}</span>
                                                    </div>
                                                    <div className="text-gray-700">{edu.school}, {edu.location}</div>
                                                    {edu.gpa && <div className="text-gray-500 text-xs">GPA: {edu.gpa}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {skills.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Skills</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {skills.map((skill) => (
                                                    <span key={skill.id} className="px-2 py-1 bg-gray-100 text-gray-800 rounded border border-gray-200 text-xs font-medium">
                                                        {skill.name} <span className="text-gray-500 font-normal">({skill.level})</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
