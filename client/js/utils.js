const Auth = {

  save(token, user) {

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

  },

  logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
      "login.html";

  },

  isLoggedIn() {

    return !!localStorage.getItem(
      "token"
    );

  },

  user() {

    return JSON.parse(
      localStorage.getItem("user")
    );

  }

};