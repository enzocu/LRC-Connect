"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";

export default function HomePage() {
	const [menuOpen, setMenuOpen] = useState(false);

	const handleDownload = () => {
		// Open the app download hosted on Google Drive in a new tab
		if (typeof window !== "undefined") {
			window.open(
				"https://drive.google.com/file/d/1qBdwk49ESFCO6wM05cksMW8NV7hsS8Rd/view?usp=sharing",
				"_blank",
				"noopener,noreferrer"
			);
		}
	};

	return (
		<div className="bg-background text-foreground">
			{/* HEADER */}
			<header className="fixed top-0 left-0 z-50 w-full bg-primary/60 backdrop-blur-lg transition-all duration-300">
				<div className="py-3 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px] flex items-center justify-between">
					<Image
						src="/btech.png"
						alt="BTECH Logo"
						width={140}
						height={50}
						className="h-16 w-auto"
					/>

					{/* Desktop Nav */}
					<nav className="hidden md:flex items-center space-x-6">
						{["Features", "Materials", "AI Assistants", "Mobile App"].map(
							(item) => (
								<Link
									key={item}
									href={`#${item.toLowerCase().replace(" ", "")}`}
									className="relative text-white text-[14px] transition-colors duration-300 hover:text-yellow-400 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-yellow-400 after:transition-all after:duration-300 hover:after:w-full"
								>
									{item}
								</Link>
							)
						)}
					</nav>

					{/* Mobile Menu Button */}
					<button
						className="md:hidden text-white text-2xl"
						onClick={() => setMenuOpen(!menuOpen)}
					>
						{menuOpen ? <HiX /> : <HiMenu />}
					</button>
				</div>

				{/* Mobile Menu Dropdown */}
				{menuOpen && (
					<div className="md:hidden bg-primary/80 backdrop-blur-md px-6 py-4 space-y-4 shadow-lg">
						{["Features", "Materials", "AI Assistants", "Mobile App"].map(
							(item) => (
								<Link
									key={item}
									href={`#${item.toLowerCase().replace(" ", "")}`}
									className="block text-white text-[14px] transition-colors duration-300 hover:text-yellow-400"
									onClick={() => setMenuOpen(false)}
								>
									{item}
								</Link>
							)
						)}
					</div>
				)}
			</header>

			{/* HERO */}
			<section className="pt-32 pb-[114px] relative overflow-hidden bg-primary">
				<div className="absolute inset-0 overflow-hidden">
					<svg
						className="absolute bottom-0 left-0 w-full"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 1440 320"
					>
						<path
							fill="hsl(var(--background))"
							d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L0,320Z"
						></path>
					</svg>
				</div>

				<div className="px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center relative z-10">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="space-y-6"
						>
							<h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
								Best way to manage your{" "}
								<span className="text-accent">library resources</span>
							</h1>
							<p className="text-base text-white opacity-90">
								Access library materials, reserve resources, and utilize AI
								assistants to enhance your library experience.
							</p>
							<div className="flex flex-wrap gap-4">
								<Button
									onClick={handleDownload}
									size="lg"
									className="bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg shimmer"
								>
									Download Now
								</Button>
								<Button
									asChild
									size="lg"
									variant="secondary"
									className="bg-white text-primary hover:bg-gray-200"
								>
									<Link href="/login">Get Started</Link>
								</Button>
							</div>
							<div className="flex items-center space-x-2 text-white opacity-90 text-sm">
								<FaStar className="text-yellow-400" />
								<span>Rated 4.9/5 by our library patrons</span>
							</div>
						</motion.div>

						{/* RIGHT IMAGE */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="relative"
						>
							<div className="relative h-[500px] flex justify-center max-w-[600px]">
								{/* Back phone with floating animation */}
								<motion.div
									className="absolute top-0 right-0 w-[290px] h-[600px] rounded-3xl overflow-hidden shadow-2xl transform rotate-6  border-4 border-black/60"
									animate={{ y: [0, -10, 0], rotate: [6, 8, 6] }}
									transition={{
										duration: 3,
										repeat: Infinity,
										repeatType: "loop",
										ease: "easeInOut",
									}}
								>
									<Image
										src="/backpic.jpg"
										alt="Library App"
										fill
										className="object-cover"
									/>
								</motion.div>

								{/* Front phone with floating animation */}
								<motion.div
									className="absolute top-10 left-0 w-[290px] h-[600px] rounded-3xl overflow-hidden shadow-2xl transform -rotate-3 border-4 border-black/50"
									animate={{ y: [0, -8, 0], rotate: [-3, -5, -3] }}
									transition={{
										duration: 3,
										repeat: Infinity,
										repeatType: "loop",
										ease: "easeInOut",
										delay: 0.2,
									}}
								>
									<Image
										src="/frontpic.jpg"
										alt="Library App"
										fill
										className="object-cover"
									/>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>
		</div>
	);
}
