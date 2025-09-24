export const getStatusColor = (status) => {
	switch (status) {
		case "Active":
			return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
		case "Inactive":
			return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
	}
};
