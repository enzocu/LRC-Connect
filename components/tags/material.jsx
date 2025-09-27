import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "../../controller/custom/getStatusColor";

export const renderMaterials = (
	materialData,
	isBranch = false,
	isHorizontal = false,
	router
) => {
	if (!materialData || materialData?.length === 0) return null;

	const Wrapper = ({ children }) =>
		isHorizontal ? (
			<div className="relative flex gap-6 overflow-x-auto pb-2">{children}</div>
		) : (
			<>{children}</>
		);

	return (
		<Wrapper>
			{materialData?.map((material, index) => (
				<Card
					key={index}
					className={`bg-card border-none shadow-sm transition-colors duration-300 hover:shadow-md rounded-lg h-fit ${
						isHorizontal ? "flex-shrink-0 h-fit max-w-[500px]" : ""
					}`}
				>
					<CardContent className="flex gap-4 p-4">
						<img
							src={material.ma_coverURL || "/placeholder.svg"}
							alt={material.ma_title}
							className="h-28 w-20 object-cover rounded-lg bg-gray-100 flex-shrink-0"
						/>
						<div className="flex-1 min-w-0 space-y-2">
							<div>
								<h4 className="font-medium text-foreground text-[14px]">
									{material.ma_title}
								</h4>

								<p className="text-primary-custom text-[12px]">
									{material.ma_copyright}
									<span className="text-muted-foreground">
										{" • "}
										{material.ma_libraryCall}
									</span>
								</p>
							</div>

							<div>
								<p className="text-[12px]">Author</p>
								<p className="text-muted-foreground text-[12px]">
									{material.ma_author}
								</p>
							</div>

							{isBranch && (
								<div>
									<p className="text-[12px]">Library Branch</p>
									<p className="text-muted-foreground text-[12px]">
										{material.ma_library}
									</p>
								</div>
							)}

							<div>
								<p className="text-[12px]">Description</p>
								<p className="text-muted-foreground text-[12px] line-clamp-3">
									{material.ma_description}
								</p>
							</div>

							<Button
								variant="link"
								size="sm"
								className="text-primary-custom hover:text-secondary-custom text-[12px] p-0"
								onClick={() =>
									router.push(`/resources/material/details?id=${material.id}`)
								}
							>
								View details
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</Wrapper>
	);
};

export const renderMaterialsTable = (
	materialData,
	isBranch = false,
	router
) => {
	if (!materialData || materialData?.length === 0) return null;

	return (
		<Card className="bg-card border-border transition-colors duration-300 animate-slide-up">
			<CardContent className="p-0 overflow-x-auto">
				<table className="w-full">
					<thead className="bg-muted/30">
						<tr className="border-b border-border">
							{[
								"Material Cover",
								"Call Number",
								"Title",
								"Copyright",
								"Status",
								"Available Format",
								"Material Type",
								"Category",
								"Shelf",
								...(isBranch ? ["Library Branch"] : []),
								"Description",
								"Copies",

								"Subject",
								"Action",
							].map((header) => (
								<th
									key={header}
									className="text-left py-4 px-6 font-semibold text-foreground text-[12px]"
								>
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="align-top">
						{materialData?.map((material, index) => (
							<tr
								key={index}
								className={`border-b border-border hover:bg-accent/30 transition-colors ${
									index % 2 === 0 ? "bg-background" : "bg-muted/10"
								}`}
							>
								<td className="py-4 px-6 min-w-[150px]">
									<img
										src={material.ma_coverURL || "/placeholder.svg"}
										alt="material"
										className="h-28 w-20 object-cover rounded-lg bg-gray-100 flex-shrink-0"
									/>
								</td>
								<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
									{material.ma_libraryCall}
								</td>
								<td className=" flex flex-col py-4 px-6 min-w-[300px]">
									<span className="text-foreground font-medium text-[12px]">
										{material.ma_title}
									</span>
									<span className="text-muted-foreground text-[12px]">
										{material.ma_author}
									</span>
								</td>
								<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
									{material.ma_copyright}
								</td>
								<td className="py-4 px-6 min-w-[150px]">
									<Badge
										className={`${getStatusColor(
											material.ma_status
										)} text-[12px]`}
									>
										{material.ma_status}
									</Badge>
								</td>

								<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
									{material.ma_format}
								</td>

								<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
									{material.ma_type}
								</td>

								<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
									{material.ma_category}
								</td>

								<td
									className="py-4 px-6 text-foreground min-w-[150px] text-[12px]"
									style={{ fontSize: "11px" }}
								>
									{material.ma_shelf}
								</td>

								{isBranch && (
									<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
										{material.ma_library}
									</td>
								)}

								<td className="py-4 px-6 text-foreground min-w-[350px] text-[12px]">
									<div className="line-clamp-3">{material.ma_description}</div>
								</td>

								<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
									{material.ma_copies}
								</td>

								<td className="py-4 px-6 text-foreground min-w-[150px] text-[12px]">
									{material.ma_subjects}
								</td>

								<td className="py-4 px-6">
									<Button
										variant="link"
										size="sm"
										className="text-primary-custom hover:text-secondary-custom text-[12px] p-0"
										onClick={() =>
											router.push(
												`/resources/material/details?id=${material.id}`
											)
										}
									>
										View details
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</CardContent>
		</Card>
	);
};
