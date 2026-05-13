const signupForm = document.getElementById("signupForm");

const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");

const toast = document.getElementById("toast");

function showToast(message) {

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);

}

signupForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  if (
    !username.value ||
    !email.value ||
    !password.value
  ) {

    showToast("All fields are required");

    return;

  }

  try {

    const response = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: username.value,
          email: email.value,
          password: password.value,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.success) {

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      showToast("Signup successful 😌");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);

    } else {

      showToast(data.message);

    }

  } catch (error) {

    console.log(error);

    showToast("Server Error");

  }

});
