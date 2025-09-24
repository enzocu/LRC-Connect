"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import GenerateQrBarcode from "@/components/generateCode";

export function CodeModal({
	isOpen,
	onClose,
	value = "",
	title = "Generated Code",
}) {
	const barcodeRef = useRef(null);
	const [showQR, setShowQR] = useState(true);

	const handleDownload = () => {
		if (barcodeRef.current) {
			barcodeRef.current.download();
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="md" title={title}>
			<div className="p-6 space-y-6">
				<div className="flex flex-col items-center">
					<div className="w-80 h-80 bg-white rounded-lg flex items-center justify-center shadow">
						<GenerateQrBarcode
							ref={barcodeRef}
							value={value}
							type={showQR ? "qr" : "barcode"}
						/>
					</div>
					<p className="text-muted-foreground text-[14px] mt-3">
						Scan this {showQR ? "QR code" : "barcode"}
					</p>
				</div>

				<div className="flex justify-center items-center gap-2">
					<Button
						variant={showQR ? "default" : "outline"}
						size="sm"
						className="text-[12px] px-4 h-10"
						onClick={() => setShowQR(true)}
					>
						QR Code
					</Button>
					<Button
						variant={!showQR ? "default" : "outline"}
						size="sm"
						className="text-[12px] px-4 h-10"
						onClick={() => setShowQR(false)}
					>
						Barcode
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-10 border-border text-foreground hover:bg-accent text-[12px] px-4"
						onClick={handleDownload}
					>
						<Download className="w-3 h-3 mr-1" />
						Download
					</Button>
				</div>
			</div>
		</Modal>
	);
}
