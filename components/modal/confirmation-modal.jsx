"use client";
import { Button } from "@/components/ui/button";

export const ConfirmationModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	subtitle,
	confirmText,
	cancelText,
	variant,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="fixed inset-0 bg-black/50" onClick={onClose} />
			<div className="relative bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
				<h3 className="text-[16px] font-semibold text-foreground mb-2">
					{title}
				</h3>
				<p className="text-muted-foreground mb-6 text-[12px]">{subtitle}</p>
				<div className="flex gap-3 justify-end">
					<Button
						onClick={onClose}
						variant="outline"
						className="h-9 px-4 text-[12px]"
					>
						{cancelText}
					</Button>
					<Button
						onClick={onConfirm}
						className={`h-9 px-4 text-[12px] px-4 ${
							variant === "danger"
								? "bg-red-600 hover:bg-red-700 text-white"
								: "bg-primary-custom hover:bg-secondary-custom text-white"
						}`}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</div>
	);
};

export function Card({ className = "", children }) {
	return (
		<div
			className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
		>
			{children}
		</div>
	);
}

export function CardHeader({ className = "", children }) {
	return (
		<div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
			{children}
		</div>
	);
}

export function CardTitle({ className = "", children, style }) {
	return (
		<h3
			className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
			style={style}
		>
			{children}
		</h3>
	);
}

export function CardContent({ className = "", children }) {
	return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

export function Switch({ checked, onCheckedChange }) {
	return (
		<button
			className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
				checked ? "bg-primary" : "bg-input"
			}`}
			onClick={() => onCheckedChange(!checked)}
		>
			<span
				className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
					checked ? "translate-x-5" : "translate-x-0"
				}`}
			/>
		</button>
	);
}
