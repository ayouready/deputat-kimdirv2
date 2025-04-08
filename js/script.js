document.addEventListener('DOMContentLoaded', function() {
    // Load deputies data
    fetch('data/deputies.json')
        .then(response => response.json())
        .then(data => {
            const deputies = data;
            displayDeputies(deputies);
            setupSearchAndFilter(deputies);
            displayStatistics(deputies);
        });

    // Display deputies function
    function displayDeputies(deputies) {
        const container = document.getElementById('deputiesContainer');
        container.innerHTML = '';
        
        deputies.forEach(deputy => {
            const card = `
                <div class="col-md-4 col-lg-3 mb-4">
                    <div class="card deputy-card" data-id="${deputy.id}" data-party="${deputy.party}">
                        <img src="images/deputies/${deputy.image}" class="card-img-top deputy-img" alt="${deputy.name}">
                        <div class="card-body">
                            <h5 class="card-title">${deputy.name}</h5>
                            <p class="card-text">${deputy.constituency}</p>
                            <span class="badge badge-party badge-${deputy.party}">${getPartyName(deputy.party)}</span>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });

        // Add click event to cards
        document.querySelectorAll('.deputy-card').forEach(card => {
            card.addEventListener('click', function() {
                const deputyId = this.getAttribute('data-id');
                showDeputyDetails(deputyId);
            });
        });
    }

    // Search and filter functionality
    function setupSearchAndFilter(deputies) {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const partyFilter = document.getElementById('partyFilter');
        
        function filterDeputies() {
            const searchTerm = searchInput.value.toLowerCase();
            const partyValue = partyFilter.value;
            
            const filtered = deputies.filter(deputy => {
                const matchesSearch = deputy.name.toLowerCase().includes(searchTerm) || 
                                     deputy.constituency.toLowerCase().includes(searchTerm);
                const matchesParty = partyValue === 'all' || deputy.party === partyValue;
                
                return matchesSearch && matchesParty;
            });
            
            displayDeputies(filtered);
        }
        
        searchBtn.addEventListener('click', filterDeputies);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') filterDeputies();
        });
        partyFilter.addEventListener('change', filterDeputies);
    }

    // Show deputy details in modal
    function showDeputyDetails(deputyId) {
        fetch('data/deputies.json')
            .then(response => response.json())
            .then(deputies => {
                const deputy = deputies.find(d => d.id == deputyId);
                if (deputy) {
                    document.getElementById('deputyModalTitle').textContent = deputy.name;
                    
                    const modalBody = document.getElementById('deputyModalBody');
                    modalBody.innerHTML = `
                        <div class="row">
                            <div class="col-md-4">
                                <img src="images/deputies/${deputy.image}" class="img-fluid mb-3" alt="${deputy.name}">
                                <div class="d-flex justify-content-center social-icons">
                                    ${deputy.social?.facebook ? `<a href="${deputy.social.facebook}" target="_blank"><i class="bi bi-facebook"></i></a>` : ''}
                                    ${deputy.social?.twitter ? `<a href="${deputy.social.twitter}" target="_blank"><i class="bi bi-twitter"></i></a>` : ''}
                                    ${deputy.social?.instagram ? `<a href="${deputy.social.instagram}" target="_blank"><i class="bi bi-instagram"></i></a>` : ''}
                                </div>
                            </div>
                            <div class="col-md-8">
                                <h5>${deputy.constituency} seçki dairəsi</h5>
                                <p><strong>Partiya:</strong> ${getPartyName(deputy.party)}</p>
                                <p><strong>Doğum tarixi:</strong> ${deputy.birthDate}</p>
                                <p><strong>Təhsil:</strong> ${deputy.education}</p>
                                <p><strong>Əsas fəaliyyəti:</strong> ${deputy.profession}</p>
                                <hr>
                                <h5>Fəaliyyəti</h5>
                                <p>${deputy.bio}</p>
                                ${deputy.projects ? `<h5 class="mt-3">Layihələri</h5><p>${deputy.projects}</p>` : ''}
                            </div>
                        </div>
                    `;
                    
                    const modal = new bootstrap.Modal(document.getElementById('deputyModal'));
                    modal.show();
                }
            });
    }

    // Display statistics
    function displayStatistics(deputies) {
        // Party statistics
        const partyStats = {};
        deputies.forEach(deputy => {
            partyStats[deputy.party] = (partyStats[deputy.party] || 0) + 1;
        });
        
        // Create chart
        const ctx = document.getElementById('partyChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(partyStats).map(key => getPartyName(key)),
                datasets: [{
                    data: Object.values(partyStats),
                    backgroundColor: [
                        '#0d6efd',
                        '#198754',
                        '#dc3545',
                        '#6c757d',
                        '#ffc107'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
        
        // Stats list
        const statsList = document.getElementById('statsList');
        statsList.innerHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                Ümumi deputat sayı
                <span class="badge bg-primary rounded-pill">${deputies.length}</span>
            </li>
            ${Object.entries(partyStats).map(([party, count]) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${getPartyName(party)}
                    <span class="badge bg-primary rounded-pill">${count}</span>
                </li>
            `).join('')}
        `;
    }
    
    // Helper function to get full party name
    function getPartyName(partyCode) {
        const parties = {
            'YAP': 'Yeni Azərbaycan Partiyası',
            'Müsavat': 'Müsavat Partiyası',
            'AXCP': 'Azərbaycan Xalq Cəbhəsi Partiyası',
            'Digər': 'Digər'
        };
        return parties[partyCode] || partyCode;
    }
});
