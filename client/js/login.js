document.addEventListener(
  "DOMContentLoaded",
  () => {

    const loginForm =
      document.getElementById(
        "loginForm"
      );

    const loginEmail =
      document.getElementById(
        "loginEmail"
      );

    const loginPassword =
      document.getElementById(
        "loginPassword"
      );

    const toast =
      document.getElementById(
        "toast"
      );

    const toastMsg =
      document.getElementById(
        "toastMsg"
      );

    function showToast(message) {

      if (!toast || !toastMsg) {
        alert(message);
        return;
      }

      toastMsg.textContent =
        message;

      toast.classList.add(
        "show"
      );

      setTimeout(() => {

        toast.classList.remove(
          "show"
        );

      }, 3000);

    }

    loginForm.addEventListener(
      "submit",
      async (e) => {

        e.preventDefault();

        if (
          !loginEmail.value ||
          !loginPassword.value
        ) {

          showToast(
            "Please fill all fields"
          );

          return;

        }

        const { ok, data } =
          await apiFetch(
            "/auth/login",
            {
              method: "POST",

              body: JSON.stringify({
                email:
                  loginEmail.value,

                password:
                  loginPassword.value,
              }),
            }
          );

        if (ok) {

          Auth.save(
            data.token,
            data.user
          );

          showToast(
            "Login Successful 😌"
          );

          setTimeout(() => {

            window.location.href =
              "discover.html";

          }, 1200);

        } else {

          showToast(
            data.message ||
            "Login Failed"
          );

        }

      }
    );

  }
);