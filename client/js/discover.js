document.addEventListener(
  "DOMContentLoaded",
  async () => {

    if (!Auth.isLoggedIn()) {

      window.location.href =
        "login.html";

      return;

    }

    try {

      const { ok, data } =
        await apiFetch("/songs");

      if (!ok) {

        console.log(
          "Failed to fetch songs"
        );

        return;

      }

      const songs =
        data.songs || data;

      renderSongs(songs);

    } catch (error) {

      console.log(error);

    }

  }
);

function renderSongs(songs) {

  const chartsGrid =
    document.querySelector(
      ".charts-grid"
    );

  if (!chartsGrid) return;

  chartsGrid.innerHTML = "";

  const panel =
    document.createElement("div");

  panel.className =
    "chart-panel";

  panel.innerHTML = `
    <div class="chart-header">

      <div>
        <div class="chart-title">
          Trending Songs
        </div>

        <div class="chart-sub">
          Live from database
        </div>
      </div>

      <div class="chart-badge cb-hot">
        🔥 Live
      </div>

    </div>

    <div class="track-list">

      ${songs.map((song, index) => `

        <div
          class="track-row"
          data-index="${index}"
        >

          <div class="tr-num">
            ${String(index + 1).padStart(2, "0")}
          </div>

          <div
            class="tr-art"
            style="
              background-image:url('${song.coverUrl}');
              background-size:cover;
              background-position:center;
            "
          ></div>

          <div>

            <div class="tr-info-name">
              ${song.title}
            </div>

            <div class="tr-info-art">
              ${song.artist}
            </div>

          </div>

          <div class="tr-change up">
            ▶
          </div>

          <div class="tr-dur">
            ${song.duration || "3:00"}
          </div>

        </div>

      `).join("")}

    </div>
  `;

  chartsGrid.appendChild(panel);

  document
    .querySelectorAll(".track-row")
    .forEach((row) => {

      row.addEventListener(
        "click",
        () => {

          const index =
            row.dataset.index;

          Player.playAll(
            songs,
            Number(index)
          );

        }
      );

    });

}