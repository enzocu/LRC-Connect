"use client";

import Lottie from "lottie-react";
import emptyAnim from "../../public/lottie/empty.json";

const EmptyState = ({ data, loading, message = "No data found." }) => {
	if (loading || (Array.isArray(data) && data.length > 0)) return null;

	return (
		<div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm ">
			<Lottie
				animationData={emptyAnim}
				loop
				style={{ width: 250, height: 250 }}
			/>
			<p>{message}</p>
		</div>
	);
};

export default EmptyState;
