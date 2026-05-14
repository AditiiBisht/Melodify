const API_BASE =
  "http://localhost:5000/api";

async function apiFetch(
  endpoint,
  options = {}
) {

  try {

    const token =
      localStorage.getItem("token");

    const response = await fetch(
      API_BASE + endpoint,
      {
        headers: {
          "Content-Type":
            "application/json",

          ...(token && {
            Authorization:
              `Bearer ${token}`,
          }),

          ...(options.headers || {}),
        },

        ...options,
      }
    );

    const data =
      await response.json();

    return {
      ok: response.ok,
      data,
    };

  } catch (error) {

    console.log(error);

    return {
      ok: false,

      data: {
        message:
          "Server Error",
      },
    };

  }

}