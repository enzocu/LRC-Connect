"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/lottie/loading.json";

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
	const pathname = usePathname();
	const [loading, setLoading] = useState(false);
	const [currentPath, setPath] = useState("");

	useEffect(() => {
		if (!currentPath && !location.pathname && currentPath !== pathname) {
			setLoading(false);
			alert();
		}
	}, [pathname, currentPath]);

	return (
		<LoadingContext.Provider value={{ loading, setLoading, setPath }}>
			<>
				{loading && (
					<div className="loading-container">
						<Lottie animationData={loadingAnimation} loop={true} />
					</div>
				)}
				{children}
			</>
		</LoadingContext.Provider>
	);
};
