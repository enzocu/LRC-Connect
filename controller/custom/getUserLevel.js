export function getUserLevel(userType) {
	switch (userType) {
		case "Super Admin":
			return "USR-1";
		case "Chief Librarian":
			return "USR-2";
		case "Head Librarian":
			return "USR-3";
		case "Administrative Assistant":
			return "USR-4";
		case "Student Assistant":
			return "USR-5";
		case "Student":
		case "Faculty":
		case "Administrator":
			return "USR-6";
		default:
			return null;
	}
}
