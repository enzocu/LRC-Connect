"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/modal";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { fetchAddress } from "../../controller/api/fetchAddress";

export function PinLocation({ isOpen, onClose, setFormData, Alert }) {
	const [btnLoading, setBtnLoading] = useState(false);
	const [currentPosition, setCurrentPosition] = useState(null);
	const [selectedPosition, setSelectedPosition] = useState(null);

	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
	});

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const location = {
						lat: pos.coords.latitude,
						lng: pos.coords.longitude,
					};
					setCurrentPosition(location);
					setSelectedPosition(location);
				},
				(err) => console.error("Geolocation error:", err),
				{ enableHighAccuracy: true }
			);
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!selectedPosition) {
			Alert.showDanger("Please select a location first");
			return;
		}

		await fetchAddress(selectedPosition, setFormData, setBtnLoading, Alert);

		onClose();
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={() => onClose()}
			title="Get Library Location"
			size="lg"
		>
			<form onSubmit={handleSubmit} className="flex flex-col h-[500px]">
				{/* Map */}
				<div className="flex-1">
					{isLoaded && currentPosition ? (
						<GoogleMap
							mapContainerStyle={{ width: "100%", height: "100%" }}
							center={selectedPosition || currentPosition}
							zoom={16}
							onClick={(e) =>
								setSelectedPosition({
									lat: e.latLng.lat(),
									lng: e.latLng.lng(),
								})
							}
						>
							{selectedPosition && (
								<Marker
									position={selectedPosition}
									draggable={true}
									onDragEnd={(e) =>
										setSelectedPosition({
											lat: e.latLng.lat(),
											lng: e.latLng.lng(),
										})
									}
								/>
							)}
						</GoogleMap>
					) : (
						<p className="text-center text-gray-500 py-20">Loading map...</p>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
					<Button
						type="button"
						onClick={() => onClose()}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						className="bg-primary-custom hover:bg-secondary-custom text-white text-[11px] h-10 px-4 text-[12px]"
					>
						<LoadingSpinner loading={btnLoading} />
						Save Pin
					</Button>
				</div>
			</form>
		</Modal>
	);
}
