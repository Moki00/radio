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
            <td class='border p-2 cursor-pointer text-blue-500' onclick='editAlias(this, "${
              radio['Serial #']
            }", "${radio['Radio ID']}")'>${radio['User Alias'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Engraved ID'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Equipment Type'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Department'] || 'N/A'}</td>
            <td class='border p-2'>${radio['Comments'] || 'N/A'}</td>
        `;
    tableBody.appendChild(row);
  });
}

function editAlias(element, serial, radioId) {
  const newAlias = prompt('Enter new alias:', element.innerText);
  if (newAlias && newAlias !== element.innerText) {
    updateRadio(serial, radioId, newAlias, element);
  }
}

async function updateRadio(serial, radioId, newAlias, element) {
  try {
    const response = await fetch('http://localhost:3000/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'Radio ID': radioId, 'Serial #': serial, 'User Alias': newAlias }), // Fix key names
    });
    const result = await response.json();

    if (response.ok) {
      element.innerText = alias;
    }
    document.getElementById('updateMessage').innerText = result.message;
  } catch (error) {
    document.getElementById('updateMessage').innerText = 'Error updating radio.';
  }
}
