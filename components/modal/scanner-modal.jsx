"use client";

import { useEffect } from "react";
import { Modal } from "@/components/modal";
import { FiCamera } from "react-icons/fi";
import { Html5Qrcode } from "html5-qrcode";
import { useAlertActions } from "@/contexts/AlertContext";
import { motion, AnimatePresence } from "framer-motion";
import { resetScannerLock } from "@/controller/firebase/get/getScanner";

export function ScannerModal({
	isOpen,
	onClose,
	setResult,
	allowedPrefix = "TRN",
}) {
	const { showDanger } = useAlertActions();
	const qrRegionId = "qr-reader";

	useEffect(() => {
		let html5QrCode;

		const prefixes = allowedPrefix.split("|");
		const pattern = new RegExp(
			prefixes.map((p) => `^${p}-\\d{4}-\\d+$`).join("|")
		);

		if (isOpen) {
			html5QrCode = new Html5Qrcode(qrRegionId);

			html5QrCode
				.start(
					{ facingMode: "environment" },
					{ fps: 10, qrbox: { width: 250, height: 200 } },
					async (decodedText) => {
						if (pattern.test(decodedText)) {
							setResult(decodedText);
							resetScannerLock();
							onClose();
						} else {
							showDanger(
								`❌ Invalid format. Allowed: ${prefixes
									.map((p) => `${p}-YYYY-ID`)
									.join(", ")}`
							);
							onClose();
						}
					},
					() => {}
				)
				.catch((err) => {
					console.error("Failed to start scanner", err);
				});
		}

		return () => {
			if (html5QrCode) {
				html5QrCode
					.stop()
					.then(() => html5QrCode.clear())
					.catch(() => {});
			}
		};
	}, [isOpen, onClose, setResult, allowedPrefix]);

	return (
		<AnimatePresence>
			{isOpen && (
				<Modal
					isOpen={isOpen}
					onClose={onClose}
					title="Scan QR or Barcode"
					size="md"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.25, ease: "easeOut" }}
						className="p-6 space-y-6"
					>
						{/* Info Box */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.3, delay: 0.1 }}
							className="flex items-start gap-3 p-4   border border-primary  rounded-lg shadow-sm"
						>
							<FiCamera className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
							<p className="text-primary/90 text-[12px] leading-relaxed">
								Point your camera at a QR code or barcode with allowed prefixes:
								{allowedPrefix.split("|").map((prefix, i) => (
									<strong key={i} className="ml-1 text-primary ">
										{prefix}
									</strong>
								))}
							</p>
						</motion.div>

						{/* QR Scanner Region */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.3, delay: 0.15 }}
							id={qrRegionId}
							className="w-full  rounded-xl border border-border bg-black/5 dark:bg-white/5 flex items-center justify-center"
						/>
					</motion.div>
				</Modal>
			)}
		</AnimatePresence>
	);
}
