// Search radios by Radio ID, Serial #, User Alias, or Engraved ID
async function searchRadios() {
  const query = document.getElementById('searchQuery').value.trim();
  if (!query) return;

  try {
    const response = await fetch('http://localhost:3000/api/radios');
    const radios = await response.json();

    const filteredRadios = radios.filter(
      radio =>
        radio['Department'] === 'Fire & Emergency Services' &&
        radio['Equipment Type'] === 'Mobile - In Car' &&
        (String(radio['Radio ID']) === query ||
          String(radio['Serial #']) === query ||
          String(radio['User Alias']).toLowerCase().includes(query.toLowerCase()) ||
          String(radio['Engraved ID']).toLowerCase().includes(query.toLowerCase()))
    );

    const sortBy = document.getElementById('sortBy').value;
    if (sortBy === 'radioId') {
      filteredRadios.sort((a, b) => a['Radio ID'] - b['Radio ID']);
    } else if (sortBy === 'serial') {
      filteredRadios.sort((a, b) => a['Serial #'] - b['Serial #']);
    } else if (sortBy === 'alias') {
      filteredRadios.sort((a, b) => a['User Alias'].localeCompare(b['User Alias']));
    } else if (sortBy === 'engravedId') {
      filteredRadios.sort((a, b) => a['Engraved ID'].localeCompare(b['Engraved ID']));
    }

    displayResults(filteredRadios);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Display search results
function displayResults(radios) {
  const tableBody = document.getElementById('resultsTable');
  tableBody.innerHTML = '';

  if (radios.length === 0) {
    const noResultsRow = document.createElement('tr');
    noResultsRow.innerHTML = `<td colspan="7" class="border p-2 text-center">No matching radios found.</td>`;
    tableBody.appendChild(noResultsRow);
    return;
  }

  const rowsPerPage = parseInt(document.getElementById('rowsPerPage').value, 10); // get the value from the dropdown

  radios.slice(0, rowsPerPage).forEach((radio, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
    <td class='border p-2 border-gray-300'>${index + 1}</td>
    <td class='border p-2 border-gray-300'>${radio['Serial #'] || 'N/A'}</td>
    <td class='border p-2 border-gray-300'>${radio['Radio ID'] || 'N/A'}</td>
    <td class='border p-2 border-gray-300 cursor-pointer text-blue-500' onclick='openAliasModal("${
      radio['Serial #']
    }", "${radio['Radio ID']}", "${radio['User Alias']}")'>${radio['User Alias'] || 'N/A'}</td>
    <td class='border p-2 border-gray-300'>${radio['Engraved ID'] || 'N/A'}</td>
    <td class='border p-2 border-gray-300'>${radio['Equipment Type'] || 'N/A'}</td>
    <td class='border p-2 border-gray-300'>${radio['Department'] || 'N/A'}</td>
    <td class='border p-2 border-gray-300'>${radio['Comments'] || 'N/A'}</td>
        `;
    tableBody.appendChild(row);
  });
}

// Open modal to update radio alias
function openAliasModal(serial, radioId, currentAlias) {
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modalSerial').innerText = serial;
  document.getElementById('modalRadioId').innerText = radioId;
  document.getElementById('modalAlias').value = currentAlias;
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// Update radio alias
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

// Prevent invalid characters and length in alias input
document.addEventListener('DOMContentLoaded', function () {
  // Rows per page select
  const rowsPerPageSelect = document.getElementById('rowsPerPage');
  rowsPerPageSelect.addEventListener('change', function () {
    searchRadios(); // Re-run the search to update the table
  });

  // Sort by select
  const sortBySelect = document.getElementById('sortBy');
  sortBySelect.addEventListener('change', function () {
    searchRadios(); // Re-run the search to update the table
  });

  document.getElementById('modalAlias').addEventListener('input', function () {
    const alias = this.value;

    // invalid characters Warning
    const wrongCharWarning = document.getElementById('wrongCharWarning');
    const invalidCharsRegex = /[^a-zA-Z0-9\s-]/;

    if (invalidCharsRegex.test(alias)) {
      wrongCharWarning.classList.remove('hidden');
      this.classList.add('border-red-500');
    } else {
      wrongCharWarning.classList.add('hidden');
      if (alias.length <= 16) {
        this.classList.remove('border-red-500');
      }
    }

    // alias length > 16 Warning
    const aliasLengthWarning = document.getElementById('aliasLengthWarning');

    if (alias.length > 16) {
      aliasLengthWarning.classList.remove('hidden');
      this.classList.add('border-red-500');
    } else {
      aliasLengthWarning.classList.add('hidden');
      this.classList.remove('border-red-500');
    }
  });
});
