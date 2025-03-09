document.addEventListener("DOMContentLoaded", function () {
    const loadFeedButton = document.getElementById("load-feed");
    const newsContainer = document.getElementById("news-container");
    const showAllButton = document.getElementById("show-all");
    const showFavoritesButton = document.getElementById("show-favorites");
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");
    const pageInfo = document.getElementById("page-info");
    const paginationNav = document.getElementById("pagination-nav");

    let allEntries = [];
    let filteredEntries = [];
    let currentPage = 1;
    const entriesPerPage = 10;

    loadFeedButton.addEventListener("click", function () {
        const feedUrl = document.getElementById("feed-url").value;
        if (feedUrl) {
            fetch(feedUrl)
                .then(response => response.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                .then(data => {
                    let entries = data.getElementsByTagName("entry");
                    if (entries.length === 0) {
                        entries = data.getElementsByTagName("item");
                    }
                    allEntries = Array.from(entries);
                    filteredEntries = [...allEntries]; // Por defecto, mostrar todas
                    currentPage = 1;
                    displayEntries();
                })
                .catch(error => console.error("Error al cargar el feed:", error));
        } else {
            alert("Por favor, ingrese una URL válida.");
        }
    });

    function displayEntries() {
        newsContainer.innerHTML = "";
        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;
        const paginatedEntries = filteredEntries.slice(start, end);

        paginatedEntries.forEach(entry => {
            const title = entry.getElementsByTagName("title")[0]?.textContent || "Sin título";
            const link = entry.getElementsByTagName("link")[0]?.textContent || entry.getElementsByTagName("link")[0]?.getAttribute("href") || "#";
            const summary = entry.getElementsByTagName("description")[0]?.textContent || entry.getElementsByTagName("summary")[0]?.textContent || "Sin descripción";
            const date = entry.getElementsByTagName("pubDate")[0]?.textContent || entry.getElementsByTagName("updated")[0]?.textContent || "Fecha desconocida";
            const isFavorite = localStorage.getItem(link) === "true";

            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4 mb-4";
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">${summary}</p>
                        <button class="btn btn-link favorite-btn">
                            <i class="fa${isFavorite ? 's' : 'r'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="card-footer">
                        <small class="text-muted">${date}</small>
                        <a href="${link}" class="btn btn-primary float-end" target="_blank">Leer más</a>
                    </div>
                </div>
            `;
            newsContainer.appendChild(card);

            card.querySelector('.favorite-btn').addEventListener('click', function () {
                const icon = this.querySelector('i');
                const isFav = icon.classList.contains('fas');
                if (isFav) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    localStorage.removeItem(link);
                } else {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    localStorage.setItem(link, "true");
                }
            });
        });

        updatePagination();
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
        pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
        prevPageButton.parentElement.classList.toggle('disabled', currentPage === 1);
        nextPageButton.parentElement.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);
        paginationNav.style.display = filteredEntries.length > entriesPerPage ? 'block' : 'none';
    }

    prevPageButton.addEventListener("click", function (e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displayEntries();
        }
    });

    nextPageButton.addEventListener("click", function (e) {
        e.preventDefault();
        const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayEntries();
        }
    });

    showAllButton.addEventListener("click", function () {
        filteredEntries = [...allEntries];
        currentPage = 1;
        displayEntries();
    });

    showFavoritesButton.addEventListener("click", function () {
        filteredEntries = allEntries.filter(entry => {
            const link = entry.getElementsByTagName("link")[0]?.textContent || entry.getElementsByTagName("link")[0]?.getAttribute("href") || "#";
            return localStorage.getItem(link) === "true";
        });
        currentPage = 1;
        displayEntries();
    });

    searchButton.addEventListener("click", function () {
        const query = searchInput.value.toLowerCase();
        filteredEntries = allEntries.filter(entry => {
            const title = entry.getElementsByTagName("title")[0]?.textContent.toLowerCase() || "";
            const summary = entry.getElementsByTagName("description")[0]?.textContent.toLowerCase() || entry.getElementsByTagName("summary")[0]?.textContent.toLowerCase() || "";
            return title.includes(query) || summary.includes(query);
        });
        currentPage = 1;
        displayEntries();
    });
});