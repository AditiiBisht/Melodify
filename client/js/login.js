<script src="../js/login.js"></script>
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.success) {

      // Save token
      localStorage.setItem("token", data.token);

      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert("Login Successful 😌");

      // Redirect
      window.location.href = "home.html";

    } else {

      alert(data.message);

    }

  } catch (error) {

    console.log(error);

    alert("Something went wrong");

  }

});