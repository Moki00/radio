async function searchRadios() {
  const query = document.getElementById('searchQuery').value.trim();
  if (!query) return;

  try {
    const response = await fetch('http://localhost:3000/api/radios');
    const radios = await response.json();

    const filteredRadios = radios.filter(
      radio =>
        String(radio['Radio ID']) === query ||
        String(radio['Serial #']) === query ||
        String(radio['User Alias']).toLowerCase().includes(query.toLowerCase()) ||
        String(radio['Engraved ID']).toLowerCase().includes(query.toLowerCase())
    );

    displayResults(filteredRadios);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayResults(radios) {
  const tableBody = document.getElementById('resultsTable');
  tableBody.innerHTML = '';

  radios.slice(0, 5).forEach(radio => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td class='border p-2'>${radio['Serial #'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Radio ID'] || 'N/A'}</td>
            <td class='border p-2 cursor-pointer text-blue-500' onclick='openAliasModal("${
              radio['Serial #']
            }", "${radio['Radio ID']}", "${radio['User Alias']}")'>${
      radio['User Alias'] || 'N/A'
    }</td>
            <td class='border p-2'>${radio['Engraved ID'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Equipment Type'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Department'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Comments'] || 'N/A'}</td>
        `;
    tableBody.appendChild(row);
  });
}

function openAliasModal(serial, radioId, currentAlias) {
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modalSerial').innerText = serial;
  document.getElementById('modalRadioId').innerText = radioId;
  document.getElementById('modalAlias').value = currentAlias;
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

async function updateRadio() {
  const serial = document.getElementById('modalSerial').innerText;
  const radioId = document.getElementById('modalRadioId').innerText;
  const alias = document.getElementById('modalAlias').value.trim();

  if (!alias) {
    alert('Alias cannot be empty');
    return;
  }

  const response = await fetch('http://localhost:3000/api/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 'Radio ID': radioId, 'Serial #': serial, 'User Alias': alias }),
  });

  if (response.ok) {
    searchRadios(); // Refresh results
    closeModal();
  }
}
