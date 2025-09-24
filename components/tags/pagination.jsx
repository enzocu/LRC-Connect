"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";

const PaginationControls = ({ ctrPages, currentPage, setCurrentPage }) => {
	if (ctrPages <= 1) return null;

	return (
		<div className="flex items-right justify-between mt-6">
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground" style={{ fontSize: "10px" }}>
					This page on
				</span>
				<select
					value={currentPage}
					onChange={(e) => setCurrentPage(parseInt(e.target.value))}
					className="border border-border bg-card text-foreground rounded px-2 py-1"
					style={{ fontSize: "10px" }}
				>
					{Array.from({ length: ctrPages }, (_, i) => (
						<option key={i + 1} value={i + 1}>
							{i + 1}
						</option>
					))}
				</select>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					className="hover:bg-accent h-8 w-8 p-0"
					onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
					disabled={currentPage === 1}
				>
					<FiChevronLeft className="w-4 h-4" />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					className="hover:bg-accent h-8 w-8 p-0"
					onClick={() => setCurrentPage((prev) => Math.min(prev + 1, ctrPages))}
					disabled={currentPage === ctrPages}
				>
					<FiChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
};

export default PaginationControls;
