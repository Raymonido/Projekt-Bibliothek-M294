async function getAllCustomers() {
    let endpoint = "http://localhost:8080/api/customer/get/all";
    try {
        const request = await fetch(endpoint, {method: "GET"});
        let allCustomers = await request.json();
        console.log(allCustomers);
        renderCustomers(allCustomers);
    } catch (error) {
        console.error("Fehler beim Laden der Kunden:", error);
        showBootstrapAlert("Fehler beim Laden der Kunden", "danger");
    }
}

getAllCustomers();

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
}

function renderCustomers(customers) {
    const row = document.getElementById('customerRow');
    row.innerHTML = "";

    customers.forEach(customer => {
        const col = document.createElement("div");
        col.className = "col-md-3 my-3";

        col.innerHTML = `
            <div class="card customer-card shadow-sm">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title"><b>${customer.lastName}</b></h5>
                    <h6 class="card-subtitle mb-2 text-body-secondary">${customer.firstName}</h6>
                    <p class="card-text mb-1">Strasse: ${customer.address.address}</p>
                    <p class="card-text mb-1">Stadt/Ort: ${customer.address.city}</p>
                    <p class="card-text mb-1">PLZ: ${customer.address.zip}</p>
                    <p class="card-text mb-1">Geburtsdatum: ${formatDate(customer.birthdate)}</p>
                    <div class="d-flex justify-content-end mt-auto">
                        <a href="#" class="card-link edit-link" 
                           data-id="${customer.id}" 
                           data-firstname="${customer.firstName}" 
                           data-lastname="${customer.lastName}"
                           data-email="${customer.email}"
                           data-address="${customer.address.address}"
                           data-city="${customer.address.city}"
                           data-zip="${customer.address.zip}"
                           data-bs-toggle="modal" data-bs-target="#editCustomerModal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                            </svg>
                        </a>
                    </div>
                </div>
                <div class="email-bar">
                    ${customer.email}
                </div>
            </div>
        `;
        row.appendChild(col);
    });

    document.querySelectorAll('.edit-link').forEach(link => {
        link.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const firstName = this.getAttribute('data-firstname');
            const lastName = this.getAttribute('data-lastname');
            const email = this.getAttribute('data-email');
            const address = this.getAttribute('data-address');
            const city = this.getAttribute('data-city');
            const zip = this.getAttribute('data-zip');

            document.getElementById('updateEmail').value = email;
            document.getElementById('updateAddress').value = address;
            document.getElementById('updateCity').value = city;
            document.getElementById('updateZip').value = zip;

            document.getElementById('editCustomerModalLabel').innerHTML = firstName + " " + lastName + " bearbeiten";

            document.getElementById('editCustomerForm').setAttribute('data-id', id);
            document.getElementById('editCustomerForm').setAttribute('data-name', firstName + " " + lastName);
            document.getElementById('deleteButton').setAttribute('data-id', id);
            document.getElementById('deleteButton').setAttribute('data-name', firstName + " " + lastName);
        });
    });
}

async function createCustomer(data) {
    const customerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        birthdate: data.birthdate,
        email: data.email,
        address: {
            address: data.address,
            city: data.city,
            zip: data.zip
        }
    };

    let endpoint = "http://localhost:8080/api/customer/create";
    try {
        const request = await fetch(endpoint, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData)
        });
        return await request.json();
    } catch (error) {
        console.error("Fehler beim Erstellen des Kunden:", error);
        showBootstrapAlert("Fehler beim Erstellen des Kunden", "danger");
        throw error;
    }
}

async function updateCustomer(data, id) {
    const updateData = {};

    if (data.email) {
        updateData.email = data.email;
    }

    if (data.address || data.city || data.zip) {
        updateData.address = {};
        if (data.address) updateData.address.address = data.address;
        if (data.city) updateData.address.city = data.city;
        if (data.zip) updateData.address.zip = data.zip;
    }

    const endpoint = `http://localhost:8080/api/customer/update/${id}`;
    try {
        const request = await fetch(endpoint, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        return await request.json();
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Kunden:", error);
        showBootstrapAlert("Fehler beim Aktualisieren des Kunden", "danger");
        throw error;
    }
}

async function deleteCustomer(id) {
    const endpoint = `http://localhost:8080/api/customer/delete/${id}`;
    try {
        await fetch(endpoint, { method: "DELETE" });
    } catch (error) {
        console.error("Fehler beim Löschen des Kunden:", error);
        showBootstrapAlert("Fehler beim Löschen des Kunden", "danger");
        throw error;
    }
}

async function searchByLastName(lastName) {
    const endpoint = `http://localhost:8080/api/customer/get/lastname/${encodeURIComponent(lastName)}`;
    try {
        const response = await fetch(endpoint, {
            headers: { 'Content-Type': 'application/json' }
        });
        const customers = await response.json();

        if (customers.length > 0) {
            renderCustomers(customers);
        } else {
            showBootstrapAlert("Keine Kunden mit diesem Nachnamen gefunden");
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

document.getElementById('createForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = {};

    let missingFields = [];

    for (const [key, value] of formData.entries()) {
        const trimmed = value.trim();

        if (!trimmed) {
            missingFields.push(key);
        }
        data[key] = trimmed;
    }

    if (missingFields.length > 0) {
        showBootstrapAlert("Bitte fülle alle Pflichtfelder aus", "danger");
        return;
    }

    try {
        await createCustomer(data);

        const modal = bootstrap.Modal.getInstance(document.getElementById('createCustomerModal'));
        modal.hide();

        const toast = document.getElementById("toast");
        const toastBody = document.getElementById('toastBody');
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

        toastBody.innerHTML = `Kunde (${data.firstName} ${data.lastName}) wurde erfolgreich erstellt!`;
        toastBootstrap.show();

        await getAllCustomers();

        form.reset();
    } catch (error) {
        console.error("Fehler bei der Kundenerstellung:", error);
    }
});


document.getElementById('editCustomerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const id = form.getAttribute('data-id');
    const name = form.getAttribute('data-name');
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
        if (value.trim() !== '') {
            data[key] = value.trim();
        }
    }

    try {
        await updateCustomer(data, id);

        const modal = bootstrap.Modal.getInstance(document.getElementById('editCustomerModal'));
        modal.hide();

        const toast = document.getElementById("toast");
        const toastBody = document.getElementById('toastBody');
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

        toastBody.innerHTML = `Kunde (${name}) wurde erfolgreich aktualisiert!`;
        toastBootstrap.show();

        await getAllCustomers();
    } catch (error) {
        console.error("Fehler bei der Kundenaktualisierung:", error);
    }
});


document.getElementById('deleteButton').addEventListener('click', async function () {
    const id = this.getAttribute('data-id');
    const name = this.getAttribute('data-name');

    try {
        await deleteCustomer(id);

        const modal = bootstrap.Modal.getInstance(document.getElementById('editCustomerModal'));
        modal.hide();

        const toast = document.getElementById("toast");
        const toastBody = document.getElementById('toastBody');
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

        toastBody.innerHTML = `Kunde (${name}) wurde erfolgreich gelöscht!`;
        toastBootstrap.show();

        await getAllCustomers();
    } catch (error) {
        console.error("Fehler beim Löschen des Kunden:", error);
    }
});


document.getElementById('searchBar').addEventListener('submit', function (e) {
    e.preventDefault();

    const searchTerm = document.getElementById('search').value.trim();

    if (searchTerm.length > 0) {
        searchByLastName(searchTerm);
    } else {
        getAllCustomers();
    }
});