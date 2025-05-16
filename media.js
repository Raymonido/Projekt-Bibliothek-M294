async function getAllMedia() {
    let endpoint = "http://localhost:8080/api/media/get/all"
    const request = await fetch(endpoint, {method: "GET"});
    let allMedia = await request.json();
    console.log(allMedia);
    renderMedia(allMedia)
}


getAllMedia()

function renderMedia(media) {
    const row = document.getElementById('mediaRow');
    row.innerHTML = "";

    media.forEach(media => {

        const col = document.createElement("div");
        col.className = "col-md-3 my-3";

        col.innerHTML = `
            <div class="card" style="width: 18rem; height: 11rem">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${media.title}</h5>
                    <h6 class="card-subtitle mb-2 text-body-secondary">${media.author}</h6>
                    <div class="d-flex justify-content-between">
                    <p class="card-text"><i>${media.genre}</i></p>
                    <p class="card-text">${media.code}</p>
                    </div>
                    <div class="d-flex justify-content-between flex-row-reverse mt-auto">
                     <a href="#" class="card-link edit-link" data-id="${media.id}" 
                           data-title="${media.title}" 
                           data-author="${media.author}" 
                           data-genre="${media.genre}"
                           data-isbn="${media.isbn}"
                           data-fsk="${media.fsk}"
                           data-code="${media.code}"
                           data-bs-toggle="modal" data-bs-target="#editMediaModal"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
</svg></a>
       <p class="card-text" ${media.isbn == null | media.isbn === "" ? 'style="display: none;"' : ''}>ISBN: ${media.isbn}</p>
                    </div>
                    <div class="media-card-fsk" ${media.fsk == null || media.fsk === "" ? 'style="display: none;"' : ''}>
                        <p class="h4 m-0" >
                        ${media.fsk ?? ""}
                        </p>
                    </div>
                </div>
            </div>
        `;
        row.appendChild(col);
    });
    document.querySelectorAll('.edit-link').forEach(link => {
        link.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const title = this.getAttribute('data-title');
            const author = this.getAttribute('data-author');
            const genre = this.getAttribute('data-genre');
            const isbn = this.getAttribute('data-isbn');
            const fsk = this.getAttribute('data-fsk');
            const code = this.getAttribute('data-code');

            document.getElementById('updateTitle').value = title;
            document.getElementById('updateAuthor').value = author;
            document.getElementById('updateGenre').value = genre;
            document.getElementById('updateIsbn').value = isbn;
            document.getElementById('updateFsk').value = fsk;
            document.getElementById('updateCode').value = code;

            document.getElementById('editCustomerMediaLabel').innerHTML = title + " Bearbeiten";

            document.getElementById('editMediaForm').setAttribute('data-id', id);
            document.getElementById('editMediaForm').setAttribute('data-title', title);
            document.getElementById('deleteButton').setAttribute('data-id', id);
            document.getElementById('deleteButton').setAttribute('data-title', title)
        });
    });

}

async function createMedia(data) {
    let endpoint = "http://localhost:8080/api/media/create";
    const request = await fetch(endpoint, {method: "POST",  headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)});
    return await request.json();
}

async function updateMedia(data, id) {
    let endpoint = `http://localhost:8080/api/media/update/${id}`;
    const request = await fetch(endpoint, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await request.json();
}

async function deleteMedia(id) {
    const endpoint = `http://localhost:8080/api/media/delete/${id}`;
    await fetch(endpoint, { method: "DELETE" });
}

async function search(data) {
    const headers = { 'Content-Type': 'application/json' };

    const titleResponse = await fetch(`http://localhost:8080/api/media/get/title/${encodeURIComponent(data)}`, { headers });
    const byTitle = await titleResponse.json();
    console.log(byTitle)

    if (byTitle.length > 0) {
        return renderMedia(byTitle);
    }

    const authorResponse = await fetch(`http://localhost:8080/api/media/get/author/${encodeURIComponent(data)}`, { headers });
    const byAuthor = await authorResponse.json();

    if (byAuthor.length > 0) {
        return renderMedia(byAuthor);
    }


    showBootstrapAlert("Keine Suchergebnisse gefunden");
}

function showBootstrapAlert(message, type = 'warning') {
    const container = document.getElementById('alertContainer');
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    setTimeout(() => {
        const alert = container.querySelector('.alert');
        if (alert) {
            bootstrap.Alert.getOrCreateInstance(alert).close();
        }
    }, 3000);
}

document.getElementById('createForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = {};

    let missingFields = [];

    for (const [key, value] of formData.entries()) {
        const trimmed = value.trim();

        if (key === "title" || key === "author") {
            if (!trimmed) {
                missingFields.push(key);
            }
            data[key] = trimmed;
        } else {
            data[key] = trimmed || "";
        }
    }

    if (missingFields.length > 0) {
        showBootstrapAlert("Bitte fülle folgende Pflichtfelder aus: " + missingFields.join(", "), "danger");
        return;
    }

    await createMedia(data);

    const modal = bootstrap.Modal.getInstance(document.getElementById('createMediaModal'));
    modal.hide();

    const toast = document.getElementById("toast");
    const toastBody = document.getElementById('toastBody');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

    toastBody.innerHTML = "Medium (" + data.title + ") wurde erfolgreich erstellt!";
    toastBootstrap.show();

    await getAllMedia();

    form.reset();
});


document.getElementById('editMediaForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const id = form.getAttribute('data-id');
    const title = form.getAttribute('data-title');
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        if (value.trim() !== '') {
            data[key] = value.trim();
        }
    }

   await updateMedia(data, id);

    const modal = bootstrap.Modal.getInstance(document.getElementById('editMediaModal'));
    modal.hide();

    const toast = document.getElementById("toast")
    const toastBody = document.getElementById('toastBody')
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

    toastBody.innerHTML = "Medium (" + title + ") wurde erfolgreich geändert!"

    await getAllMedia();

    toastBootstrap.show();
});

document.getElementById('deleteButton').addEventListener('click', async function () {
    let id = document.getElementById('deleteButton').getAttribute('data-id');
    let title = document.getElementById('deleteButton').getAttribute('data-title')

    await deleteMedia(id);

    const modal = bootstrap.Modal.getInstance(document.getElementById('editMediaModal'));
    modal.hide();

    const toast = document.getElementById("toast")
    const toastBody = document.getElementById('toastBody')
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

    toastBody.innerHTML = "Medium (" + title + ") wurde erfolgreich gelöscht!"

    await getAllMedia();

    toastBootstrap.show();

});

document.getElementById('searchBar').addEventListener('submit', function (e) {
    e.preventDefault();

    let input = document.getElementById('search').value.trim();

    if (input.length > 0) {
        search(input);
    } else getAllMedia();


})

