document.getElementById('entry-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const categoria = document.getElementById('categoria').value;
  const tipo = document.getElementById('tipo').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const data = document.getElementById('data').value;

  // Aqui você pode enviar os dados para o Sheets via Google Apps Script
  alert("Registro adicionado com sucesso!");
  loadRecords();
});

async function loadRecords() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CURRENT_MONTH)}`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    const jsonStr = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
    const data = JSON.parse(jsonStr);

    const rows = data.table.rows;
    const container = document.getElementById('registros');
    container.innerHTML = '';

    rows.forEach(row => {
      const vals = row.c.map(c => c?.v || '');
      const div = document.createElement('div');
      div.className = 'registro';
      div.textContent = `${vals[0]} - ${vals[1]} - R$${Math.abs(vals[2]).toFixed(2)} - ${vals[3]}`;
      container.appendChild(div);
    });

    updateSummary(rows);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
}

function updateSummary(rows) {
  let totalIn = 0;
  let totalOut = 0;

  rows.forEach(row => {
    const [tipo, , valor] = row.c.map(c => c?.v || '');
    if (tipo === 'Entrada') totalIn += parseFloat(valor) || 0;
    else if (tipo === 'Saída') totalOut += parseFloat(valor) || 0;
  });

  const saldo = totalIn + totalOut;
  const meta = 2500; // Substitua por valor do Sheets se quiser
  const perc = Math.min(100, (Math.abs(totalOut) / meta) * 100);

  document.getElementById('total-entradas').textContent = totalIn.toFixed(2);
  document.getElementById('total-saidas').textContent = totalOut.toFixed(2);
  document.getElementById('saldo').textContent = saldo.toFixed(2);
  document.getElementById('progress-bar').value = perc;
}

// Carregar dados ao iniciar
loadRecords();