$(document).ready(function () {
	isLoggedIn();
	$("#alert-success").hide();
	$("#alert-danger").hide();
	$("#rememberMeSignInForm").on("click", rememberToggle);
	$("#sign-out-nav").on("click", signOut);
	$("#signUpBtnRef").on("click", signUpForm);
	$("#sign-up-form").on("submit", signUp);
	$("#sign-in-form").on("submit", signIn);
	$("#todoAddBtn").on("click", addForm);
	$("#addBtnAddForm").on("click", addTodo);
	$("#editButtonEditForm").on("click", editTodo);
	$("#todoCheckWeather").on("click", checkWeather);
});

const isLoggedIn = () => {
	if (
		!localStorage.getItem("access_token") &&
		!sessionStorage.getItem("access_token")
	) {
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
		getTodo();
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
};

const notif = (type, message) => {
	$("#alert").empty();
	$("#alert").append(`
		<div
		class="alert alert-${type} alert-dismissible fade show"
		role="alert"
		>
		<button
			type="button"
			class="btn-close"
			data-bs-dismiss="alert"
			aria-label="Close"
		></button>
		${message}
		</div>`);
};

const signOut = (e) => {
	e.preventDefault();
	localStorage.removeItem("access_token");
	sessionStorage.removeItem("access_token");
	isLoggedIn();
	onSignOut();
};

const rememberToggle = () => {
	const rememberField = $("#rememberMeSignInForm");
	if (rememberField.val() === "false") {
		rememberField.val("true");
	} else {
		rememberField.val("false");
	}
};

const signUp = (e) => {
	e.preventDefault();
	const emailField = $("#emailFieldSignUpForm");
	const passwordField = $("#passwordFieldSignUpForm");
	$.ajax({
		method: "POST",
		url: "http://localhost:3000/register",
		data: {
			email: emailField.val(),
			password: passwordField.val(),
		},
	})
		.done((data) => {
			notif("success", `User berhasil di buat`);
			emailField.val("");
			passwordField.val("");
		})
		.fail((err) => {
			const { errors } = err.responseJSON;
			notif("fail", errors.join(", "));
		})
		.always(() => {
			isLoggedIn();
		});
};

const signIn = (e) => {
	e.preventDefault();
	const emailField = $("#emailFieldSignInForm");
	const passwordField = $("#passwordFieldSignInForm");
	const rememberField = $("#rememberMeSignInForm");

	$.ajax({
		method: "POST",
		url: "http://localhost:3000/login",
		data: {
			email: emailField.val(),
			password: passwordField.val(),
		},
	})
		.done((data) => {
			const { access_token } = data;
			emailField.val("");
			passwordField.val("");
			if (rememberField.val() === "true")
				localStorage.setItem("access_token", access_token);
			else if (rememberField.val() === "false")
				sessionStorage.setItem("access_token", access_token);
			notif("success", "Welcome :)");
		})
		.fail((err) => {
			const { errors } = err.responseJSON;
			notif("danger", errors.join(", "));
		})
		.always(() => {
			isLoggedIn();
		});
};

function onSignIn(googleUser) {
	const id_token = googleUser.getAuthResponse().id_token;
	const rememberField = $("#rememberMeSignInForm");
	$.ajax({
		method: "POST",
		url: "http://localhost:3000/googleLogin",
		data: {
			token: id_token,
		},
	})
		.done((data) => {
			const { access_token } = data;
			if (rememberField.val() === "true")
				localStorage.setItem("access_token", access_token);
			else if (rememberField.val() === "false")
				sessionStorage.setItem("access_token", access_token);
			notif("success", "Welcome :)");
		})
		.fail((err) => {
			const { errors } = err.responseJSON;
			notif("danger", errors.join(", "));
		})
		.always(() => {
			isLoggedIn();
		});
}

function onSignOut() {
	const auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		console.log("User signed out.");
	});
}

const signUpForm = (e) => {
	e.preventDefault();
	$("#list-nav").hide();
	$("#sign-in-nav").show();
	$("#sign-out-nav").hide();
	$("#sign-up-nav").hide();

	$("#todo-list-container").hide();
	$("#todo-edit-container").hide();
	$("#todo-add-container").hide();
	$("#sign-up-container").show();
	$("#sign-in-container").hide();
};

const addForm = (e) => {
	e.preventDefault();
	$("#todo-list-container").show();
	$("#todo-edit-container").hide();
	$("#todo-add-container").show();
	$("#sign-up-container").hide();
	$("#sign-in-container").hide();
};

const addTodo = (e) => {
	e.preventDefault();
	const titleField = $("#titleFieldTodoAddForm");
	const statusField = $("#statusFieldTodoAddForm");
	const dueDateField = $("#dueDateFieldTodoAddForm");
	const descriptionField = $("#descriptionFieldTodoAddForm");

	$.ajax({
		method: "POST",
		url: "http://localhost:3000/todos",
		headers: {
			access_token:
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token"),
		},
		data: {
			title: titleField.val(),
			description: descriptionField.val(),
			status: statusField.find(":selected").text(),
			due_date: dueDateField.val(),
		},
	})
		.done(({ data }) => {
			titleField.val("");
			statusField.val("");
			dueDateField.val("");
			descriptionField.val("");
			notif("success", `Task ${data.title} Successfully Added`);
			getTodo();
		})
		.fail((err) => {
			const { errors } = err.responseJSON;
			notif("danger", errors.join(", "));
		})
		.always(() => {});
};

const getTodo = () => {
	$.ajax({
		method: "GET",
		url: "http://localhost:3000/todos",
		headers: {
			access_token:
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token"),
		},
	})
		.done(({ data }) => {
			const todoListOL = $("#todo-list-ol");
			todoListOL.empty();
			data = data.sort((a, b) => {
				return new Date(b.updatedAt) - new Date(a.updatedAt);
			});
			data.forEach((todo) => {
				let actionComplete, strike, date;

				if (todo.status === "Done") {
					actionComplete = `<a class="nav-link delete-todo" href="#"data-id="${todo.id}"><i class="fas fa-times"></i></a>`;
					strike = `style="text-decoration: line-through"`;
					date = "";
				} else if (todo.status === "Start") {
					actionComplete = `<a class="nav-link complete-todo" href="#"data-id="${todo.id}"><i class="fas fa-check"></i></a>`;
					strike = "";
					date = new Date(todo.due_date).toISOString().split("T")[0];
				}
				todoListOL.append(`
					<li
						class="list-group-item d-flex justify-content-between align-items-start"
					>
						<div class="ms-2 me-auto">
							<div class="fw-bold">
								<p ${strike}>${todo.title}
									<span class="badge bg-primary rounded-pill">${date}</span>
								</p>
							</div>
							<p>${todo.description}</p>
						</div>
						${todo.status}
						<a class="nav-link edit-todo" href="#" data-id="${todo.id}"><i class="fas fa-edit"></i></a>
						${actionComplete}
					</li>
				`);
			});
		})
		.fail((err) => {
			const { errors } = err.responseJSON;
			notif("danger", errors.join(", "));
		})
		.always(() => {
			$(".edit-todo").on("click", editTodoForm);
			$(".delete-todo").on("click", deleteTodo);
			$(".complete-todo").on("click", completeTodo);
		});
};

const editTodoForm = (e) => {
	e.preventDefault();

	let id;

	if (e.target.classList.contains("edit-todo"))
		id = e.target.getAttribute("data-id");
	else if (e.target.classList.contains("fa-edit"))
		id = e.target.parentElement.getAttribute("data-id");

	$.ajax({
		method: "GET",
		url: `http://localhost:3000/todos/${id}`,
		headers: {
			access_token:
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token"),
		},
	})
		.done(({ data }) => {
			const { title, status, description, due_date } = data;

			const titleField = $("#titleFieldTodoEditForm");
			const descriptionField = $("#descriptionFieldTodoEditForm");
			const statusField = $("#statusFieldTodoEditForm option");
			const dueDateField = $("#dueDateFieldTodoEditForm");

			titleField.val(title);
			descriptionField.val(description);
			statusField
				.filter(function () {
					return $(this).text().trim() === status;
				})
				.prop("selected", true);
			dueDateField.val(new Date(due_date).toISOString().split("T")[0]);
			$("#todo-edit-container").show();
			$("#todo-add-container").hide();
			$("#editButtonEditForm").attr("data-id", id);
		})
		.fail((err) => {
			const { errors } = err.responseJSON;
			notif("danger", errors.join(", "));
		})
		.always(() => {
			$(".edit-todo").on("click", editTodoForm);
		});
};

const editTodo = (e) => {
	e.preventDefault();
	const titleField = $("#titleFieldTodoEditForm");
	const statusField = $("#statusFieldTodoEditForm");
	const dueDateField = $("#dueDateFieldTodoEditForm");
	const descriptionField = $("#descriptionFieldTodoEditForm");
	const id = $("#editButtonEditForm").attr("data-id");

	$.ajax({
		method: "PUT",
		url: `http://localhost:3000/todos/${id}`,
		headers: {
			access_token:
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token"),
		},
		data: {
			title: titleField.val(),
			description: descriptionField.val(),
			status: statusField.find(":selected").text(),
			due_date: dueDateField.val(),
		},
	})
		.done(({ data }) => {
			titleField.val("");
			statusField.val("");
			dueDateField.val("");
			descriptionField.val("");
			notif("success", `Task ${data.title} Successfully Editted`);
			$("#todo-edit-container").hide();
			getTodo();
		})
		.fail((err) => {
			const { errors } = err.responseJSON;
			notif("danger", errors.join(", "));
		})
		.always(() => {});
};

const deleteTodo = (e) => {
	e.preventDefault();

	let id;

	if (e.target.classList.contains("delete-todo"))
		id = e.target.getAttribute("data-id");
	else if (e.target.classList.contains("fa-times"))
		id = e.target.parentElement.getAttribute("data-id");

	$.ajax({
		method: "DELETE",
		url: `http://localhost:3000/todos/${id}`,
		headers: {
			access_token:
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token"),
		},
	})
		.done(({ message }) => {
			notif("success", message);
			getTodo();
		})
		.fail((err) => {
			const { errors } = err.responseJSON;
			notif("danger", errors.join(", "));
		})
		.always(() => {});
};

const completeTodo = (e) => {
	e.preventDefault();

	let id;

	if (e.target.classList.contains("complete-todo"))
		id = e.target.getAttribute("data-id");
	else if (e.target.classList.contains("fa-check"))
		id = e.target.parentElement.getAttribute("data-id");

	$.ajax({
		method: "PATCH",
		url: `http://localhost:3000/todos/${id}`,
		headers: {
			access_token:
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token"),
		},
		data: {
			status: "Done",
		},
	})
		.done((_) => {
			notif("success", `Task Completed`);
			getTodo();
		})
		.fail((err) => {
			const { errors } = err.responseJSON;
			notif("danger", errors.join(", "));
		});
};

const checkWeather = (e) => {
	e.preventDefault();
	console.log(e);
	$.ajax({
		method: "GET",
		url: "http://localhost:3000/weather",
		headers: {
			access_token:
				localStorage.getItem("access_token") ||
				sessionStorage.getItem("access_token"),
		},
	})
		.done((data) => {
			// console.log(data);
			notif("success", `Todays weather in Jakarta is ${data.message}`);
		})
		.fail((err) => {
			const { errors } = err.responseJSON;
			notif("danger", errors.join(", "));
		});
};
