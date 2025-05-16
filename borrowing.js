async function getAllBorrowings() {
    let endpoint = "http://localhost:8080/api/borrowing/get/all";
    try {
        const request = await fetch(endpoint, { method: "GET",  headers: {
                'Content-Type': 'application/json',
            }, });
        let allBorrowings = await request.json();
        renderBorrowings(allBorrowings);
    } catch (error) {
        console.error("Fehler beim Laden der Ausleihen:", error);
        showBootstrapAlert("Fehler beim Laden der Ausleihen", "danger");
        throw error;
    }
}

async function getAllCustomers() {
    let endpoint = "http://localhost:8080/api/customer/get/all";
    try {
        const request = await fetch(endpoint, { method: "GET",  headers: {
                'Content-Type': 'application/json',
            }, });
        return await request.json();
    } catch (error) {
        console.error("Fehler beim Laden der Kunden:", error);
        showBootstrapAlert("Fehler beim Laden der Kunden", "danger");
        throw error;
    }
}

async function getAllMedia() {
    let endpoint = "http://localhost:8080/api/media/get/all";
    try {
        const request = await fetch(endpoint, { method: "GET",  headers: {
                'Content-Type': 'application/json',
            }, });
        return await request.json();
    } catch (error) {
        console.error("Fehler beim Laden der Medien:", error);
        showBootstrapAlert("Fehler beim Laden der Medien", "danger");
        throw error;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
}

function renderBorrowings(borrowings) {
    const row = document.getElementById('borrowingRow');
    row.innerHTML = "";

    borrowings.forEach(borrowing => {
        const col = document.createElement("div");
        col.className = "col-md-3 my-3";

        const mediaTitle = borrowing.media.title || 'Unbekanntes Medium';
        const customerName = `${borrowing.customer.firstName || ''} ${borrowing.customer.lastName || ''}`.trim() || 'Unbekannter Kunde';
        const dateBorrowed = formatDate(borrowing.dateBorrowed);
        const borrowedUntil = formatDate(borrowing.borrowedUntil);

        const isOverdue = new Date(borrowing.borrowedUntil) < new Date();
        const cardClasses = isOverdue ? 'card border-danger' : 'card';

        col.innerHTML = `
            <div class="${cardClasses} shadow-sm" style="width: 18rem; height: 13rem">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title"><b>${mediaTitle}</b></h5>
                    <h6 class="card-subtitle mb-2 text-body-secondary"><b>${customerName}</b></h6>
                    <div class="d-flex justify-content-between mt-auto">
                     <p class="card-text m-0">
                        Ausgeliehen: ${dateBorrowed}<br>
                        Rückgabe bis: ${borrowedUntil}
                        ${isOverdue ? '<span class="text-danger fw-bold"><br>Überfällig!</span>' : ''}
                    </p>
                        <a href="#" class="card-link edit-link d-flex align-items-end" 
                           data-id="${borrowing.id}"
                           data-bs-toggle="modal" data-bs-target="#editBorrowingModal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533l1.002-4.705z"/>
                                <circle cx="8" cy="4.5" r="1"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        `;
        row.appendChild(col);
    });

    document.querySelectorAll('.edit-link').forEach(link => {
        link.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            try {
                const borrowing = await getBorrowingById(id);

                document.getElementById('editCustomerName').textContent =
                    `${borrowing.customer.firstName || ''} ${borrowing.customer.lastName || ''}`.trim();
                document.getElementById('editMediaTitle').textContent =
                    borrowing.media.title || '';
                document.getElementById('editMediaAuthor').textContent =
                    borrowing.media.author || "";
                document.getElementById('editDateBorrowed').textContent =
                    formatDate(borrowing.dateBorrowed);
                document.getElementById('editBorrowedUntil').textContent =
                    formatDate(borrowing.borrowedUntil);

                document.getElementById('editBorrowingModalLabel').textContent =
                    `Ausleihe: ${borrowing.media.title}`;

                document.getElementById('returnButton').setAttribute('data-id', id);
                document.getElementById('returnButton').setAttribute('data-media-title', borrowing.media.title);

                document.getElementById('extendButton').setAttribute('data-id', id);
                document.getElementById('extendButton').setAttribute('data-media-title', borrowing.media.title);
            } catch (error) {
                console.error("Fehler beim Laden der Ausleihdaten:", error);
                showBootstrapAlert("Fehler beim Laden der Ausleihdaten", "danger");
            }
        });
    });
}

async function getBorrowingById(id) {
    let endpoint = `http://localhost:8080/api/borrowing/get/id/${id}`;
    try {
        const response = await fetch(endpoint, { method: "GET",  headers: {
                'Content-Type': 'application/json',
            }, });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fehler beim Abrufen der Ausleihe:", error);
        showBootstrapAlert("Fehler beim Abrufen der Ausleihe", "danger");
        throw error;
    }
}

async function createBorrowing(data) {
    let endpoint = "http://localhost:8080/api/borrowing/create";
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Ein Fehler ist aufgetreten");
        }

        return await response.json();
    } catch (error) {
        console.error("Fehler beim Erstellen der Ausleihe:", error);
        showBootstrapAlert(error.message || "Fehler beim Erstellen der Ausleihe", "danger");
        throw error;
    }
}

async function extendBorrowing(id) {
    let endpoint = `http://localhost:8080/api/borrowing/update/${id}`;
    try {
        const response = await fetch(endpoint, { method: "PATCH",  headers: {
                'Content-Type': 'application/json',
            },});
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fehler beim Verlängern der Ausleihe:", error);
        showBootstrapAlert("Fehler beim Verlängern der Ausleihe", "danger");
        throw error;
    }
}

async function returnBorrowing(id) {
    let endpoint = `http://localhost:8080/api/borrowing/delete/${id}`;
    try {
        const response = await fetch(endpoint, { method: "DELETE",  headers: {
                'Content-Type': 'application/json',
            }, });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error("Fehler bei der Rückgabe des Mediums:", error);
        showBootstrapAlert("Fehler bei der Rückgabe des Mediums", "danger");
        throw error;
    }
}

async function searchBorrowings(searchTerm) {
    const endpoint = `http://localhost:8080/api/borrowing/search/${encodeURIComponent(searchTerm)}`;
    try {
        const response = await fetch(endpoint, { method: "GET",  headers: {
                'Content-Type': 'application/json',
            }, });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const borrowings = await response.json();
        renderBorrowings(borrowings);

        if (borrowings.length === 0) {
            showBootstrapAlert("Keine Suchergebnisse gefunden", "warning");
        }
    } catch (error) {
        console.error("Fehler bei der Suche:", error);
        showBootstrapAlert("Fehler bei der Suche", "danger");
    }
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

async function initializeForm() {
    try {
        const [customers, media] = await Promise.all([getAllCustomers(), getAllMedia()]);

        const customerSelect = document.getElementById('customerSelect');
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = JSON.stringify(customer);
            option.textContent = `${customer.firstName} ${customer.lastName}`;
            customerSelect.appendChild(option);
        });

        const mediaSelect = document.getElementById('mediaSelect');
        media.forEach(medium => {
            const option = document.createElement('option');
            option.value = JSON.stringify(medium);
            option.textContent = medium.title;
            mediaSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Fehler beim Initialisieren des Formulars:", error);
        showBootstrapAlert("Fehler beim Laden der Daten für das Formular", "danger");
    }
}


document.addEventListener('DOMContentLoaded', function() {
    getAllBorrowings();
    initializeForm();

    document.getElementById('createBorrowingForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const customerSelect = document.getElementById('customerSelect');
        const mediaSelect = document.getElementById('mediaSelect');

        if (customerSelect.value === '' || mediaSelect.value === '') {
            showBootstrapAlert("Bitte wähle einen Kunden und ein Medium aus", "warning");
            return;
        }

        try {
            const customer = JSON.parse(customerSelect.value);
            const media = JSON.parse(mediaSelect.value);

            const requestData = {
                customer: customer,
                media: media
            };

            const response = await createBorrowing(requestData);

            const modal = bootstrap.Modal.getInstance(document.getElementById('createBorrowingModal'));
            modal.hide();

            const toast = document.getElementById("toast");
            const toastBody = document.getElementById('toastBody');
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

            toastBody.innerHTML = `Ausleihe für "${media.title}" wurde erfolgreich erstellt!`;
            toastBootstrap.show();

            this.reset();
            await getAllBorrowings();

        } catch (error) {

        }
    });

    document.getElementById('extendButton').addEventListener('click', async function() {
        const id = this.getAttribute('data-id');
        const mediaTitle = this.getAttribute('data-media-title');

        try {
            await extendBorrowing(id);

            const modal = bootstrap.Modal.getInstance(document.getElementById('editBorrowingModal'));
            modal.hide();

            const toast = document.getElementById("toast");
            const toastBody = document.getElementById('toastBody');
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

            toastBody.innerHTML = `Ausleihe für "${mediaTitle}" wurde erfolgreich verlängert!`;
            toastBootstrap.show();

            await getAllBorrowings();
        } catch (error) {
        }
    });

    document.getElementById('returnButton').addEventListener('click', async function() {
        const id = this.getAttribute('data-id');
        const mediaTitle = this.getAttribute('data-media-title');

        try {
            await returnBorrowing(id);

            const modal = bootstrap.Modal.getInstance(document.getElementById('editBorrowingModal'));
            modal.hide();

            const toast = document.getElementById("toast");
            const toastBody = document.getElementById('toastBody');
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

            toastBody.innerHTML = `Medium "${mediaTitle}" wurde erfolgreich zurückgegeben!`;
            toastBootstrap.show();

            await getAllBorrowings();
        } catch (error) {
        }
    });

    document.getElementById('searchBar').addEventListener('submit', function(e) {
        e.preventDefault();

        const searchInput = document.getElementById('search').value.trim();

        if (searchInput.length > 0) {
            searchBorrowings(searchInput);
        } else {
            getAllBorrowings();
        }
    });
});