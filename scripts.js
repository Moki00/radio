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
        String(radio['User Alias']).toLowerCase().includes(query.toLowerCase())
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
            <td class='border p-2'>${radio['User Alias'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Equipment Type'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Department'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Comments'] || 'N/A'}</td>
        `;
    tableBody.appendChild(row);
  });
}

async function updateRadio() {
  const id = document.getElementById('updateId').value.trim();
  const alias = document.getElementById('updateAlias').value.trim();

  if (!id || !alias) {
    document.getElementById('updateMessage').innerText = 'Please enter Radio ID and the new alias.';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, alias }),
    });
    const result = await response.json();
    document.getElementById('updateMessage').innerText = result.message;
  } catch (error) {
    document.getElementById('updateMessage').innerText = 'Error updating radio.';
  }
}
