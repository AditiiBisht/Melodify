
const form = document.getElementById("uploadForm");
const btn = document.getElementById("uploadBtn");
const statusEl = document.getElementById("status");

form.addEventListener("submit", async function (e) {

  e.preventDefault();

  btn.classList.add("loading");
  btn.textContent = "Uploading...";
  statusEl.textContent = "";

  const fd = new FormData();

  fd.append("title",  document.getElementById("title").value);
  fd.append("artist", document.getElementById("artist").value);
  fd.append("album",  document.getElementById("album").value);
  fd.append("genre",  document.getElementById("genre").value);

  fd.append(
    "audio",
    document.getElementById("audio").files[0]
  );

  const cover =
    document.getElementById("cover").files[0];

  if (cover) {
    fd.append("cover", cover);
  }

  try {

    const res = await fetch(
      "http://localhost:5000/api/upload",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer " +
            localStorage.getItem("mel_token"),
        },
        body: fd,
      }
    );

    const data = await res.json();

    if (data.success) {

      statusEl.textContent =
        "✓ Song uploaded successfully";

      form.reset();

    } else {

      statusEl.textContent =
        data.message || "Upload failed";

    }

  } catch (err) {

    console.error(err);

    statusEl.textContent =
      "Server error during upload";

  }

  btn.classList.remove("loading");
  btn.textContent = "Upload Song";

});