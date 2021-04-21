$(document).ready(function () {
	if (!localStorage.getItem("access_token")) {
		$("#list-nav").hide();
		$("#sign-in-nav").show();
		$("#sign-out-nav").hide();
		$("#sign-up-nav").show();

		$("#todo-list-container").hide();
		$("#todo-edit-container").hide();
		$("#todo-add-container").hide();
		$("#sign-up-container").hide();
		$("#sign-in-container").show();
	} else {
		$("#list-nav").show();
		$("#sign-in-nav").hide();
		$("#sign-out-nav").show();
		$("#sign-up-nav").hide();

		$("#todo-list-container").show();
		$("#todo-edit-container").hide();
		$("#todo-add-container").hide();
		$("#sign-up-container").hide();
		$("#sign-in-container").hide();
	}

	$("#sign-out-nav").on("click", signOut);
});

const signOut = (e) => {
	e.preventDefault();
	localStorage.removeItem("access_token");
};
