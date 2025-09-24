"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

const GenerateQrBarcode = forwardRef(({ value = "", type = "qr" }, ref) => {
	const canvasRef = useRef(null);

	useEffect(() => {
		if (!value || !canvasRef.current) return;

		const canvas = canvasRef.current;

		if (type === "qr") {
			QRCode.toCanvas(canvas, value, {
				width: canvas.offsetWidth,
				margin: 1,
			});
		} else if (type === "barcode") {
			JsBarcode(canvas, value, {
				format: "CODE128",
				width: 2,
				height: canvas.offsetHeight,
				displayValue: true,
			});
		}
	}, [value, type]);

	useImperativeHandle(ref, () => ({
		download: () => {
			const canvas = canvasRef.current;
			const link = document.createElement("a");
			link.download = `${value}-${type}.png`;
			link.href = canvas.toDataURL("image/png");
			link.click();
		},
	}));

	return (
		<canvas
			ref={canvasRef}
			className="w-full h-full rounded shadow p-1 bg-white"
			style={{ border: "none" }}
		/>
	);
});

export default GenerateQrBarcode;
