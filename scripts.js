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

  const aliasRegex = /^FD (?=.{2,13}$)[a-zA-Z0-9]+([ -][a-zA-Z0-9]+)?$/;

  if (!aliasRegex.test(alias)) {
    alert(
      'Invalid! Alias must start with "FD " followed by 2 to 13 letters, numbers, and optionally one space or dash.'
    );
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'Radio ID': radioId, 'Serial #': serial, 'User Alias': alias }),
    });

    const results = await response.json();
    console.log(results);

    const respondMessage = document.getElementById('responseMessage');
    respondMessage.innerText = results.message; // Display response message
    respondMessage.classList.remove('hidden'); // Show

    if (response.ok) {
      respondMessage.classList.remove('text-red-700', 'bg-red-200'); // Remove red
      respondMessage.classList.add('text-green-700', 'bg-green-200'); // Add Green
      searchRadios(); // Refresh results
      closeModal();
    } else {
      respondMessage.classList.remove('text-green-700', 'bg-green-200'); // Remove green
      respondMessage.classList.add('text-red-700', 'bg-red-200'); // Add Red
    }
  } catch (error) {
    const respondMessage = document.getElementById('responseMessage');
    respondMessage.innerText = 'An error occurred while updating the radio.';
    respondMessage.classList.remove('hidden'); // Show
    respondMessage.classList.remove('text-green-700', 'bg-green-200'); // Remove green
    respondMessage.classList.add('text-red-700', 'bg-red-200'); // Add Red
  }
}
