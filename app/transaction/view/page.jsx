"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/tags/empty";

import {
	ArrowLeft,
	Play,
	Pause,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
	Calendar,
	Hash,
	ZoomIn,
	ZoomOut,
	ChevronLeft,
	ChevronRight,
	Maximize2,
	Minimize2,
} from "lucide-react";

import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";

import AssistantPage from "@/components/tags/assistant";
import { getTransactionDetails } from "../../../controller/firebase/get/getTransactionDetails";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";
const ListenPage = () => {
	const router = useRouter();
	const pathname = usePathname();
	const { setLoading, setPath, loading } = useLoading();
	const Alert = useAlertActions();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const [transactionData, setTransactionData] = useState({});
	const [audioSrc, setAudioSrc] = useState("");
	const [pdfUrl, setPdfUrl] = useState("");
	const [baseWidth, setBaseWidth] = useState(701);

	// Audio state
	const audioRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(0.9);
	const [muted, setMuted] = useState(false);
	const [rate, setRate] = useState(1);
	const [audioLoaded, setAudioLoaded] = useState(false);
	const [audioError, setAudioError] = useState(null);

	//PDF state
	const [numPages, setNumPages] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [zoom, setZoom] = useState(100);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [focusAI, setFocusAI] = useState(true);

	const togglePlay = async () => {
		if (!audioRef.current || !audioLoaded) {
			console.warn("Audio not ready");
			return;
		}

		try {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				await audioRef.current.play();
			}
		} catch (error) {
			setAudioError("Failed to play audio. Please try again.");
			setIsPlaying(false);
		}
	};

	const onTimeUpdate = () => {
		if (!audioRef.current) return;
		setCurrentTime(audioRef.current.currentTime || 0);
	};

	const onPlay = () => {
		setIsPlaying(true);
	};

	const onPause = () => {
		setIsPlaying(false);
	};

	const onEnded = () => {
		setIsPlaying(false);
		setCurrentTime(0);
	};

	const onError = (e) => {
		console.error("Audio error:", e);
		setAudioError(
			"Failed to load audio file. Please check your connection and try again."
		);
		setIsPlaying(false);
		setAudioLoaded(false);
	};

	const onCanPlay = () => {
		setAudioLoaded(true);
		setAudioError(null);
	};

	const seek = (value) => {
		if (!audioRef.current || !audioLoaded) return;
		audioRef.current.currentTime = value;
		setCurrentTime(value);
	};

	const skip = (secs) => {
		if (!audioRef.current || !audioLoaded) return;
		const next = Math.min(
			Math.max(0, audioRef.current.currentTime + secs),
			duration || audioRef.current.duration || 0
		);
		seek(next);
	};

	const changeVolume = (value) => {
		const v = Math.min(1, Math.max(0, value));
		setVolume(v);
		if (audioRef.current) {
			audioRef.current.volume = v;
		}
	};

	const toggleMute = () => {
		setMuted((m) => {
			const newMuted = !m;
			if (audioRef.current) {
				audioRef.current.muted = newMuted;
			}
			return newMuted;
		});
	};

	const changeRate = (value) => {
		setRate(value);
		if (audioRef.current) {
			audioRef.current.playbackRate = value;
		}
	};

	const onLoadedMetadata = () => {
		if (!audioRef.current) return;
		setDuration(audioRef.current.duration || 0);
		setAudioLoaded(true);
		setAudioError(null);
	};

	useEffect(
		() => {
			const audio = audioRef.current;
			if (!audio || !audioSrc || transactionData?.tr_format != "Audio Copy")
				return;

			setAudioLoaded(false);
			setAudioError(null);
			setIsPlaying(false);
			setCurrentTime(0);
			setDuration(0);

			audio.addEventListener("loadedmetadata", onLoadedMetadata);
			audio.addEventListener("canplay", onCanPlay);
			audio.addEventListener("play", onPlay);
			audio.addEventListener("pause", onPause);
			audio.addEventListener("ended", onEnded);
			audio.addEventListener("timeupdate", onTimeUpdate);
			audio.addEventListener("error", onError);

			audio.volume = volume;
			audio.muted = muted;
			audio.playbackRate = rate;

			audio.load();

			return () => {
				audio.removeEventListener("loadedmetadata", onLoadedMetadata);
				audio.removeEventListener("canplay", onCanPlay);
				audio.removeEventListener("play", onPlay);
				audio.removeEventListener("pause", onPause);
				audio.removeEventListener("ended", onEnded);
				audio.removeEventListener("timeupdate", onTimeUpdate);
				audio.removeEventListener("error", onError);
			};
		},
		[audioSrc, transactionData?.tr_format],
		focusAI
	);

	//PDF Controll

	const onDocumentLoadSuccess = ({ numPages }) => {
		setNumPages(numPages);
		setCurrentPage(1);
	};

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < numPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handleZoomIn = () => {
		if (zoom < 200) {
			setZoom(zoom + 25);
		}
	};

	const handleZoomOut = () => {
		if (zoom > 50) {
			setZoom(zoom - 25);
		}
	};

	const handleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	const handleFocusAI = () => {
		setFocusAI(!focusAI);
	};

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume;
		}
	}, [volume]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.muted = muted;
		}
	}, [muted]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.playbackRate = rate;
		}
	}, [rate]);

	const formattedCurrent = useMemo(
		() => formatTime(currentTime),
		[currentTime]
	);
	const formattedDuration = useMemo(() => formatTime(duration), [duration]);

	useEffect(() => {
		if (!id) return;
		setPath(pathname);
		getTransactionDetails(id, setTransactionData, setLoading, Alert);
	}, [id]);

	useEffect(() => {
		if (transactionData?.tr_format == "Audio Copy") {
			setAudioSrc(transactionData?.tr_resource.ma_audioURL);
		} else if (transactionData?.tr_format == "Soft Copy") {
			setPdfUrl(transactionData?.tr_resource.ma_softURL);
		}
	}, [transactionData]);

	useEffect(() => {
		const updateWidth = () => {
			if (window.innerWidth < 540) {
				setBaseWidth(370);
			} else if (window.innerWidth < 640) {
				setBaseWidth(450);
			} else if (window.innerWidth < 820) {
				setBaseWidth(580);
			} else if (window.innerWidth < 1024) {
				setBaseWidth(701);
			} else if (window.innerWidth < 1120) {
				setBaseWidth(520);
			} else if (window.innerWidth < 1320) {
				setBaseWidth(580);
			} else {
				setBaseWidth(701);
			}
		};

		updateWidth();
		window.addEventListener("resize", updateWidth);
		return () => window.removeEventListener("resize", updateWidth);
	}, []);

	return (
		<div className="min-h-screen bg-background transition-colors duration-300">
			<Header />

			<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
				<div className="mb-6">
					<button
						onClick={() => router.back()}
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[11px]"
					>
						<ArrowLeft className="w-3 h-3" />
						Back to Previous page
					</button>
				</div>

				<div className="mb-8 animate-slide-up">
					<h1 className="font-semibold text-foreground text-[20px]">
						{transactionData?.tr_format == "Audio Copy"
							? "Audio Player"
							: "Reading Page"}
					</h1>
					<p className="text-muted-foreground text-[14px]">
						{transactionData?.tr_format == "Audio Copy"
							? "Press play to listen to your audio."
							: "Scroll down to start reading."}
					</p>
				</div>

				<div
					className={`animate-slide-up-delay-1 ${
						focusAI ? "grid grid-cols-1 lg:grid-cols-3 gap-14" : ""
					}`}
				>
					<div
						className={`lg:col-span-2 transition-all duration-300 ${
							focusAI ? "opacity-100" : "opacity-0 pointer-events-none absolute"
						}`}
					>
						<Card className="bg-card border-border overflow-hidden min-h-[600px]">
							<CardHeader className="pb-4 border-b border-border">
								<div className="flex items-start justify-between">
									<div className="flex flex-col gap-1">
										<div className="flex items-center gap-2">
											<Hash className="w-4 h-4 text-muted-foreground" />
											<h2 className="font-semibold text-foreground text-[16px]">
												{transactionData?.tr_qr || "Transaction ID"}
											</h2>
										</div>
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4 text-muted-foreground" />
											<span className="text-muted-foreground text-[12px]">
												Due: {transactionData?.tr_dateDueFormatted}
											</span>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<div className="px-3 py-1 rounded-full  font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-[12px]">
											Utilized
										</div>
									</div>
								</div>
							</CardHeader>

							{transactionData?.tr_format == "Soft Copy" && (
								<div className="p-4 flex items-center max-sm:flex-wrap md:justify-between  gap-4 border-b border-border">
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={handlePreviousPage}
												disabled={currentPage === 1}
												className="h-8 w-8 p-0 bg-transparent"
											>
												<ChevronLeft className="w-4 h-4" />
											</Button>

											<div className="flex items-center gap-2">
												<input
													type="number"
													value={currentPage}
													onChange={(e) => {
														const page = Number.parseInt(e.target.value);
														if (page >= 1 && page <= numPages) {
															setCurrentPage(page);
														}
													}}
													className="w-16 h-8 px-2 text-center border border-border rounded  bg-background text-[12px]"
													min="1"
													max={numPages}
												/>
												<span className="text-muted-foreground text-[12px]">
													of {numPages}
												</span>
											</div>

											<Button
												variant="outline"
												size="sm"
												onClick={handleNextPage}
												disabled={currentPage === numPages}
												className="h-8 w-8 p-0 bg-transparent"
											>
												<ChevronRight className="w-3 h-3" />
											</Button>
										</div>

										<div className="flex items-center gap-2 border-l border-border pl-4">
											<Button
												variant="outline"
												size="sm"
												onClick={handleZoomOut}
												disabled={zoom === 50}
												className="h-8 w-8 p-0 bg-transparent"
											>
												<ZoomOut className="w-3 h-3" />
											</Button>

											<span className=" text-muted-foreground min-w-[50px] text-center text-[12px]">
												{zoom}%
											</span>

											<Button
												variant="outline"
												size="sm"
												onClick={handleZoomIn}
												disabled={zoom === 200}
												className="h-8 w-8 p-0 bg-transparent"
											>
												<ZoomIn className="w-3 h-3" />
											</Button>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={handleFullscreen}
											className="h-8 px-3 flex items-center gap-2 bg-transparent"
										>
											{isFullscreen ? (
												<Minimize2 className="w-4 h-4" />
											) : (
												<Maximize2 className="w-4 h-4" />
											)}
											<span className="text-[12px]">
												{isFullscreen ? "Collapse View" : "Fullscreen"}
											</span>
										</Button>
									</div>
								</div>
							)}

							{/* Content */}
							{transactionData?.tr_format == "Audio Copy" && (
								<div className="p-8 flex flex-col items-center justify-center min-h-[520px]">
									{audioSrc && (
										<audio ref={audioRef} preload="metadata">
											<source src={audioSrc} type="audio/mpeg" />
											<source src={audioSrc} type="audio/mp3" />
											<source src={audioSrc} type="audio/wav" />

											<EmptyState
												data={[]}
												loading={loading}
												message="Your browser does not support the audio element."
											/>
										</audio>
									)}
									{audioError || !audioLoaded ? (
										<EmptyState
											data={[]}
											loading={loading}
											message={
												audioError
													? `Error loading audio: ${audioError}`
													: "Loading content, please wait..."
											}
										/>
									) : (
										<>
											<div className="mb-6">
												<div className="rounded-lg overflow-hidden shadow-lg border border-border">
													<img
														src={
															transactionData?.tr_resource?.ma_coverURL ||
															"/placeholder.svg?height=320&width=240&query=book-cover"
														}
														alt="Material"
														className="w-[280px] h-[380px] object-cover"
													/>
												</div>
											</div>

											<div className="text-center mb-8">
												<h1 className="text-[24px] font-bold  leading-tight tracking-tight">
													{transactionData?.tr_resource?.ma_title || "Title"}
												</h1>
												<p className="text-muted-foreground text-[16px]">
													by{" "}
													{transactionData?.tr_resource?.ma_author || "Author"}
												</p>
											</div>

											{audioSrc && (
												<div className="w-full max-w-md">
													<div className="mb-6">
														<div className="flex items-center justify-between mb-3">
															<span className="text-muted-foreground text-[12px] font-medium">
																{formattedCurrent}
															</span>
															<span className="text-muted-foreground  text-[12px] font-medium">
																{formattedDuration}
															</span>
														</div>
														<div className="relative">
															<input
																type="range"
																min={0}
																max={Math.max(0, duration)}
																step={0.1}
																value={currentTime}
																onChange={(e) => seek(Number(e.target.value))}
																disabled={!audioLoaded}
																className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider disabled:cursor-not-allowed disabled:opacity-50"
																style={{
																	background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
																		(currentTime / Math.max(duration, 1)) * 100
																	}%, hsl(var(--muted)) ${
																		(currentTime / Math.max(duration, 1)) * 100
																	}%, hsl(var(--muted)) 100%)`,
																}}
															/>
														</div>
													</div>

													<div className="flex items-center justify-center gap-4 mb-6">
														<Button
															variant="outline"
															size="lg"
															className="h-12 w-12 rounded-full border-border hover:bg-accent bg-transparent"
															onClick={() => skip(-15)}
															disabled={!audioLoaded || !!audioError}
														>
															<SkipBack className="w-5 h-5" />
														</Button>

														<Button
															size="lg"
															className="h-16 w-16 rounded-full bg-primary-custom text-white hover:bg-secondary-custom shadow-lg disabled:opacity-50"
															onClick={togglePlay}
															disabled={!audioLoaded || !!audioError}
														>
															{isPlaying ? (
																<Pause className="w-6 h-6" />
															) : (
																<Play className="w-6 h-6 ml-1" />
															)}
														</Button>

														<Button
															variant="outline"
															size="lg"
															className="h-12 w-12 rounded-full border-border hover:bg-accent bg-transparent"
															onClick={() => skip(15)}
															disabled={!audioLoaded || !!audioError}
														>
															<SkipForward className="w-5 h-5" />
														</Button>
													</div>

													<div className="flex items-center justify-between">
														<div className="flex items-center gap-1">
															{[0.75, 1, 1.25, 1.5].map((r) => (
																<button
																	key={r}
																	onClick={() => changeRate(r)}
																	disabled={!audioLoaded || !!audioError}
																	className={`h-8 px-3 rounded-full  font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed  text-[11px] ${
																		rate === r
																			? "bg-primary-custom text-white shadow-md"
																			: "bg-muted text-muted-foreground border border-border hover:bg-accent"
																	}`}
																	aria-label={`Playback speed ${r}x`}
																>
																	{r}x
																</button>
															))}
														</div>

														<div className="flex items-center gap-3">
															<button
																onClick={toggleMute}
																disabled={!audioLoaded || !!audioError}
																className="h-8 w-8 rounded-full bg-muted hover:bg-accent text-muted-foreground border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
																aria-label={muted ? "Unmute" : "Mute"}
															>
																{muted ? (
																	<VolumeX className="w-4 h-4" />
																) : (
																	<Volume2 className="w-4 h-4" />
																)}
															</button>
															<div className="w-20">
																<input
																	type="range"
																	min={0}
																	max={1}
																	step={0.05}
																	value={muted ? 0 : volume}
																	onChange={(e) =>
																		changeVolume(Number(e.target.value))
																	}
																	disabled={!audioLoaded || !!audioError}
																	className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
																	style={{
																		background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
																			(muted ? 0 : volume) * 100
																		}%, hsl(var(--muted)) ${
																			(muted ? 0 : volume) * 100
																		}%, hsl(var(--muted)) 100%)`,
																	}}
																/>
															</div>
														</div>
													</div>
												</div>
											)}
										</>
									)}
								</div>
							)}

							{transactionData?.tr_format == "Soft Copy" && (
								<>
									<CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
										<div
											className="relative  w-full flex items-center justify-center border border-border rounded-sm"
											style={{
												height: isFullscreen ? "100%" : "75vh",
												overflowY: "auto",
											}}
										>
											{pdfUrl ? (
												<div
													className=" transition-transform duration-200 "
													style={{
														maxWidth: "100%",
														maxHeight: "100%",
														position: "relative",
													}}
												>
													<Document
														file={pdfUrl}
														onLoadSuccess={onDocumentLoadSuccess}
														loading={
															<EmptyState
																data={[]}
																loading={loading}
																message="Loading PDF, please wait..."
															/>
														}
														error={
															<EmptyState
																data={[]}
																loading={loading}
																message="Failed to load PDF."
															/>
														}
														noData={
															<EmptyState
																data={[]}
																loading={loading}
																message="No PDF file specified."
															/>
														}
													>
														{Array.from(new Array(numPages), (el, index) => (
															<Page
																key={`page_${index + 1}`}
																pageNumber={currentPage}
																width={(baseWidth * zoom) / 100}
															/>
														))}
													</Document>
												</div>
											) : (
												<div className="w-full h-full bg-muted rounded flex items-center justify-center">
													<p className="text-muted-foreground text-sm">
														No PDF source available for this item.
													</p>
												</div>
											)}
										</div>
									</CardContent>

									{/* Footer Info */}
									<div className="flex items-center flex-wrap lg:justify-between gap-1 text-[11px] text-muted-foreground pt-4 px-6 pb-4 border-t border-border">
										<div className="flex items-center gap-4">
											<span>Format: PDF</span>
											<span>Size: 2.4 MB</span>
										</div>
										<div>
											<span>
												© {new Date().getFullYear()} Dalubhasaang Politekniko ng
												Lungsod ng Baliwag
											</span>
										</div>
									</div>
								</>
							)}
						</Card>
					</div>

					<AssistantPage
						transactionData={transactionData}
						handleFocusAI={handleFocusAI}
					/>
				</div>
			</main>
		</div>
	);
};

function formatTime(s) {
	if (!isFinite(s) || s < 0) return "0:00";
	const minutes = Math.floor(s / 60);
	const seconds = Math.floor(s % 60);
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default ListenPage;
