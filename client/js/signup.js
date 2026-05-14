document.addEventListener(
  "DOMContentLoaded",
  () => {

    const signupForm =
      document.getElementById("signupForm");

    const username =
      document.getElementById("username");

    const email =
      document.getElementById("email");

    const password =
      document.getElementById("password");

    signupForm.addEventListener(
      "submit",
      async (e) => {

        e.preventDefault();

        const { ok, data } =
          await apiFetch(
            "/auth/register",
            {
              method: "POST",

              body: JSON.stringify({
                username:
                  username.value,

                email:
                  email.value,

                password:
                  password.value,
              }),
            }
          );

        if (ok) {

          Auth.save(
            data.token,
            data.user
          );

          alert(
            "Signup Successful 😌"
          );

          window.location.href =
            "login.html";

        } else {

          alert(
            data.message ||
            "Signup Failed"
          );

        }

      }
    );

  }
);