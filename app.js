"use strict";

const round = value => Math.round((value + Number.EPSILON) * 1000) / 1000;
const format = value => Number.isInteger(value) ? String(value) : String(round(value));
const escapeHtml = value => String(value).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));

const OPERATIONS = {
  complementA: {
    name: "Komplemen A", symbol: "Aᶜ", short: "1 − A", unary: true,
    formula: "μAᶜ(x) = 1 − μA(x)",
    apply: a => 1 - a,
    step: a => `1 − ${format(a)} = ${format(1 - a)}`
  },
  complementB: {
    name: "Komplemen B", symbol: "Bᶜ", short: "1 − B", unary: false,
    formula: "μBᶜ(x) = 1 − μB(x)",
    apply: (a, b) => 1 - b,
    step: (a, b) => `1 − ${format(b)} = ${format(1 - b)}`
  },
  intersection: {
    name: "Irisan", symbol: "A ∩ B", short: "minimum",
    formula: "μA∩B(x) = min(μA(x), μB(x))",
    apply: (a, b) => Math.min(a, b),
    step: (a, b) => `min(${format(a)}, ${format(b)}) = ${format(Math.min(a, b))}`
  },
  union: {
    name: "Union", symbol: "A ∪ B", short: "maksimum",
    formula: "μA∪B(x) = max(μA(x), μB(x))",
    apply: (a, b) => Math.max(a, b),
    step: (a, b) => `max(${format(a)}, ${format(b)}) = ${format(Math.max(a, b))}`
  },
  differenceAB: {
    name: "Selisih A − B", symbol: "A − B", short: "A ∩ Bᶜ",
    formula: "μA−B(x) = min(μA(x), 1 − μB(x))",
    apply: (a, b) => Math.min(a, 1 - b),
    step: (a, b) => `min(${format(a)}, 1 − ${format(b)}) = min(${format(a)}, ${format(1 - b)}) = ${format(Math.min(a, 1 - b))}`
  },
  differenceBA: {
    name: "Selisih B − A", symbol: "B − A", short: "B ∩ Aᶜ",
    formula: "μB−A(x) = min(μB(x), 1 − μA(x))",
    apply: (a, b) => Math.min(b, 1 - a),
    step: (a, b) => `min(${format(b)}, 1 − ${format(a)}) = min(${format(b)}, ${format(1 - a)}) = ${format(Math.min(b, 1 - a))}`
  },
  symmetric: {
    name: "Beda simetris", symbol: "A △ B", short: "(A−B) ∪ (B−A)",
    formula: "μA△B(x) = max(min(A,1−B), min(B,1−A))",
    apply: (a, b) => Math.max(Math.min(a, 1 - b), Math.min(b, 1 - a)),
    step: (a, b) => `max(min(${format(a)},${format(1-b)}), min(${format(b)},${format(1-a)})) = ${format(Math.max(Math.min(a, 1 - b), Math.min(b, 1 - a)))}`
  },
  algebraicProduct: {
    name: "Produk aljabar", symbol: "A · B", short: "A × B",
    formula: "μA·B(x) = μA(x) × μB(x)",
    apply: (a, b) => a * b,
    step: (a, b) => `${format(a)} × ${format(b)} = ${format(a * b)}`
  },
  algebraicSum: {
    name: "Jumlah probabilistik", symbol: "A ⊕ B", short: "A+B−AB",
    formula: "μA⊕B(x) = μA + μB − μAμB",
    apply: (a, b) => a + b - a * b,
    step: (a, b) => `${format(a)} + ${format(b)} − (${format(a)}×${format(b)}) = ${format(a + b - a*b)}`
  },
  boundedSum: {
    name: "Jumlah terbatas", symbol: "A ⊞ B", short: "min(1,A+B)",
    formula: "μ(x) = min(1, μA(x) + μB(x))",
    apply: (a, b) => Math.min(1, a + b),
    step: (a, b) => `min(1, ${format(a)} + ${format(b)}) = ${format(Math.min(1, a+b))}`
  },
  boundedDifference: {
    name: "Selisih terbatas", symbol: "A ⊖ B", short: "max(0,A−B)",
    formula: "μ(x) = max(0, μA(x) − μB(x))",
    apply: (a, b) => Math.max(0, a - b),
    step: (a, b) => `max(0, ${format(a)} − ${format(b)}) = ${format(Math.max(0, a-b))}`
  },
  deMorganUnion: {
    name: "De Morgan (union)", symbol: "(A ∪ B)ᶜ", short: "Aᶜ ∩ Bᶜ",
    formula: "1 − max(A,B) = min(1−A,1−B)",
    apply: (a,b) => 1 - Math.max(a,b),
    step: (a,b) => `1 − max(${format(a)}, ${format(b)}) = ${format(1-Math.max(a,b))}; min(${format(1-a)}, ${format(1-b)}) = ${format(Math.min(1-a,1-b))}`
  },
  deMorganIntersection: {
    name: "De Morgan (irisan)", symbol: "(A ∩ B)ᶜ", short: "Aᶜ ∪ Bᶜ",
    formula: "1 − min(A,B) = max(1−A,1−B)",
    apply: (a,b) => 1 - Math.min(a,b),
    step: (a,b) => `1 − min(${format(a)}, ${format(b)}) = ${format(1-Math.min(a,b))}; max(${format(1-a)}, ${format(1-b)}) = ${format(Math.max(1-a,1-b))}`
  }
};

const CORE_OPERATION_KEYS = ["complementA", "complementB", "intersection", "union", "differenceAB", "differenceBA"];
const ADVANCED_OPERATION_KEYS = ["symmetric", "algebraicProduct", "algebraicSum", "boundedSum", "boundedDifference", "deMorganUnion", "deMorganIntersection"];
const weekTwoExample = [
  ["1", 0, 0], ["2", .1, .5], ["3", .4, .4], ["4", .5, .3],
  ["5", .6, .5], ["6", .9, .8], ["7", 1, 1], ["8", 1, 0]
];

const rowsBody = document.querySelector("#data-rows");
const rowTemplate = document.querySelector("#row-template");
const operationsEl = document.querySelector("#operation-options");
const validationEl = document.querySelector("#validation-message");
const resultsEl = document.querySelector("#results");
const emptyState = document.querySelector("#empty-state");
let latestExport = [];

function addRow(label = "", a = "", b = "") {
  const fragment = rowTemplate.content.cloneNode(true);
  fragment.querySelector(".element-input").value = label;
  fragment.querySelector(".a-input").value = a;
  fragment.querySelector(".b-input").value = b;
  rowsBody.appendChild(fragment);
}

function setRows(rows) {
  rowsBody.replaceChildren();
  rows.forEach(row => addRow(...row));
}

function renderOperationOptions() {
  const group = (title, keys) => `<div class="sr-only">${title}</div>` + keys.map(key => {
    const op = OPERATIONS[key];
    const checked = ["intersection", "union"].includes(key) ? "checked" : "";
    return `<div class="op-option"><input type="checkbox" id="op-${key}" value="${key}" ${checked}><label for="op-${key}"><span class="op-symbol">${op.symbol}</span><span class="op-copy"><strong>${op.name}</strong><small>${op.short}</small></span></label></div>`;
  }).join("");
  operationsEl.innerHTML = group("Operasi inti", CORE_OPERATION_KEYS) + `<details class="advanced-options"><summary>Operator lanjutan <span>＋</span></summary><div class="advanced-grid">${group("Operasi lanjutan", ADVANCED_OPERATION_KEYS)}</div></details>`;
}

function getInputData(requireB = true) {
  const rows = [...rowsBody.querySelectorAll("tr")];
  const data = [];
  const errors = [];
  const labels = new Set();
  rows.forEach((row, index) => {
    row.querySelectorAll("input").forEach(input => input.classList.remove("invalid"));
    const labelInput = row.querySelector(".element-input");
    const aInput = row.querySelector(".a-input");
    const bInput = row.querySelector(".b-input");
    const label = labelInput.value.trim();
    const a = Number(aInput.value);
    const b = Number(bInput.value);
    if (!label) { errors.push(`Nama elemen pada baris ${index + 1} belum diisi.`); labelInput.classList.add("invalid"); }
    if (labels.has(label)) { errors.push(`Elemen “${label}” muncul lebih dari sekali.`); labelInput.classList.add("invalid"); }
    labels.add(label);
    if (aInput.value === "" || !Number.isFinite(a) || a < 0 || a > 1) { errors.push(`μA untuk ${label || `baris ${index+1}`} harus antara 0 dan 1.`); aInput.classList.add("invalid"); }
    if (requireB && (bInput.value === "" || !Number.isFinite(b) || b < 0 || b > 1)) { errors.push(`μB untuk ${label || `baris ${index+1}`} harus antara 0 dan 1.`); bInput.classList.add("invalid"); }
    data.push({ label, a, b: requireB ? b : (Number.isFinite(b) ? b : 0) });
  });
  if (!rows.length) errors.push("Tambahkan sedikitnya satu elemen.");
  return { data, errors };
}

function setNotation(name, data, accessor) {
  return `${name} = { ${data.map((item, index) => `(${escapeHtml(item.label)}, ${format(accessor(item, index))})`).join("; ")} }`;
}

function makeChart(data, values) {
  const width = 520, height = 190, left = 30, top = 14, bottom = 31, right = 10;
  const plotW = width - left - right, plotH = height - top - bottom;
  const x = i => data.length === 1 ? left + plotW / 2 : left + i * plotW / (data.length - 1);
  const y = value => top + (1 - value) * plotH;
  const points = accessor => data.map((d, i) => `${x(i)},${y(accessor(d, i))}`).join(" ");
  const dots = (accessor, className) => data.map((d, i) => `<circle class="chart-dot ${className}" cx="${x(i)}" cy="${y(accessor(d,i))}" r="4" fill="currentColor"/>`).join("");
  const xLabels = data.map((d, i) => `<text class="chart-label" x="${x(i)}" y="${height - 8}" text-anchor="middle">${escapeHtml(d.label.length > 8 ? d.label.slice(0,7)+"…" : d.label)}</text>`).join("");
  const grid = [0, .5, 1].map(v => `<line class="chart-grid" x1="${left}" y1="${y(v)}" x2="${width-right}" y2="${y(v)}"/><text class="chart-label" x="${left-7}" y="${y(v)+3}" text-anchor="end">${v}</text>`).join("");
  return `<div class="result-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafik derajat keanggotaan A, B, dan hasil">${grid}<polyline class="chart-line chart-a" points="${points(d=>d.a)}"/><polyline class="chart-line chart-b" points="${points(d=>d.b)}"/><polyline class="chart-line chart-result" points="${points((d,i)=>values[i])}"/>${dots(d=>d.a,"chart-a")}${dots(d=>d.b,"chart-b")}${dots((d,i)=>values[i],"chart-result")}${xLabels}</svg><div class="chart-legend"><span><i class="a"></i>A</span><span><i class="b"></i>B</span><span><i class="r"></i>Hasil</span></div></div>`;
}

function calculate() {
  const selected = [...operationsEl.querySelectorAll("input:checked")].map(input => input.value);
  const { data, errors } = getInputData(selected.some(key => key !== "complementA"));
  if (!selected.length) errors.push("Pilih sedikitnya satu operasi.");
  if (errors.length) {
    validationEl.textContent = errors[0] + (errors.length > 1 ? ` (+${errors.length - 1} masalah lain)` : "");
    validationEl.hidden = false;
    return;
  }
  validationEl.hidden = true;
  latestExport = [];
  const cards = selected.map((key, cardIndex) => {
    const op = OPERATIONS[key];
    const values = data.map(item => round(op.apply(item.a, item.b)));
    data.forEach((item, index) => latestExport.push({ operation: op.name, element: item.label, muA: item.a, muB: item.b, result: values[index] }));
    const steps = data.map((item, index) => `<tr><td>${escapeHtml(item.label)}</td><td>${format(item.a)}</td><td>${format(item.b)}</td><td>${op.step(item.a, item.b)}</td></tr>`).join("");
    return `<article class="result-card"><div class="result-card-head"><div class="result-title"><span class="op-symbol">${op.symbol}</span><div><h4>${op.name}</h4><small>${data.length} elemen dihitung</small></div></div></div><p class="result-set">${setNotation(op.symbol, data, (_, i) => values[i])}</p><div class="result-formula">${op.formula}</div>${makeChart(data, values)}<details class="steps-disclosure" ${cardIndex === 0 ? "open" : ""}><summary>Lihat perhitungan langkah demi langkah</summary><div class="data-table-wrap"><table class="step-table"><thead><tr><th>x</th><th>μA</th><th>μB</th><th>Substitusi & hasil</th></tr></thead><tbody>${steps}</tbody></table></div></details></article>`;
  }).join("");
  resultsEl.innerHTML = `<div class="results-header"><h3>Hasil perhitungan</h3><button class="mini-button" id="export-results" type="button">Unduh CSV</button></div>${cards}`;
  emptyState.hidden = true;
  resultsEl.hidden = false;
  document.querySelector("#export-results").addEventListener("click", exportCsv);
  if (window.innerWidth < 900) resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exportCsv() {
  const header = "operasi,elemen,mu_A,mu_B,hasil";
  const lines = latestExport.map(row => [row.operation, row.element, row.muA, row.muB, row.result].map(value => `"${String(value).replaceAll('"','""')}"`).join(","));
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "hasil-operasi-fuzzy.csv" });
  link.click();
  URL.revokeObjectURL(link.href);
}

rowsBody.addEventListener("click", event => {
  const button = event.target.closest(".remove-row");
  if (button) button.closest("tr").remove();
});
document.querySelector("#add-row").addEventListener("click", () => addRow(`x${rowsBody.children.length + 1}`, "", ""));
document.querySelector("#clear-rows").addEventListener("click", () => setRows([["x1", "", ""]]));
document.querySelector("#load-example").addEventListener("click", () => setRows(weekTwoExample));
document.querySelector("#calculate").addEventListener("click", calculate);
document.querySelector("#open-import").addEventListener("click", () => { document.querySelector("#import-box").hidden = false; document.querySelector("#bulk-data").focus(); });
document.querySelector("#cancel-import").addEventListener("click", () => { document.querySelector("#import-box").hidden = true; });
document.querySelector("#apply-import").addEventListener("click", () => {
  const lines = document.querySelector("#bulk-data").value.trim().split(/\r?\n/).filter(Boolean);
  const parsed = lines.map(line => line.split(/[;,\t]/).map(part => part.trim()));
  if (!parsed.length || parsed.some(parts => parts.length !== 3 || !parts[0])) {
    validationEl.textContent = "Format tempel data belum tepat. Gunakan: elemen, μA, μB (satu baris per elemen).";
    validationEl.hidden = false;
    return;
  }
  setRows(parsed);
  document.querySelector("#import-box").hidden = true;
  validationEl.hidden = true;
});

const conceptSlider = document.querySelector("#concept-slider");
conceptSlider.addEventListener("input", () => {
  const value = Number(conceptSlider.value).toFixed(2);
  document.querySelector("#hero-mu").textContent = value;
  document.querySelector("#concept-value").textContent = value;
  document.querySelector("#concept-percent").textContent = `${Math.round(value * 100)}%`;
});

// Exercise generator
let questionCounter = 0;
let currentQuestion = null;
let scoredCurrent = false;
let scoreHistory = [];
try { scoreHistory = JSON.parse(localStorage.getItem("fuzzylabScores") || "[]"); } catch { scoreHistory = []; }

const exerciseOperations = {
  complementA: OPERATIONS.complementA,
  intersection: OPERATIONS.intersection,
  union: OPERATIONS.union,
  differenceAB: OPERATIONS.differenceAB,
  differenceBA: OPERATIONS.differenceBA,
  deMorganUnion: OPERATIONS.deMorganUnion,
  deMorganIntersection: OPERATIONS.deMorganIntersection
};

function pick(array) { return array[Math.floor(Math.random() * array.length)]; }
function randomMembership() { return Math.floor(Math.random() * 11) / 10; }
function updateStats() {
  document.querySelector("#attempt-count").textContent = scoreHistory.length;
  const average = scoreHistory.length ? Math.round(scoreHistory.reduce((a,b)=>a+b,0) / scoreHistory.length) : null;
  document.querySelector("#average-score").textContent = average === null ? "—" : `${average}%`;
}

function generateQuestion() {
  const difficulty = document.querySelector("#difficulty").value;
  const count = Number(document.querySelector("#element-count").value);
  const pools = {
    dasar: ["complementA", "intersection", "union"],
    menengah: ["intersection", "union", "differenceAB", "differenceBA"],
    tantangan: ["deMorganUnion", "deMorganIntersection"]
  };
  const key = pick(pools[difficulty]);
  const op = exerciseOperations[key];
  const data = Array.from({ length: count }, (_, i) => ({ label: `x${i+1}`, a: randomMembership(), b: randomMembership() }));
  const answers = data.map(item => round(op.apply(item.a, item.b)));
  currentQuestion = { difficulty, key, op, data, answers };
  questionCounter++;
  scoredCurrent = false;
  document.querySelector("#question-level").textContent = difficulty.toUpperCase();
  document.querySelector("#question-number").textContent = `SOAL #${String(questionCounter).padStart(3,"0")}`;
  document.querySelector("#question-prompt").innerHTML = `Tentukan derajat keanggotaan hasil operasi <strong>${op.symbol}</strong>.`;
  document.querySelector("#given-sets").innerHTML = `<div class="set-line">${setNotation("A", data, item=>item.a)}</div><div class="set-line b">${setNotation("B", data, item=>item.b)}</div>`;
  document.querySelector("#answer-grid").innerHTML = data.map((item, index) => `<div class="answer-cell"><label for="answer-${index}">μ(${escapeHtml(item.label)})</label><input id="answer-${index}" type="number" min="0" max="1" step="0.01" inputmode="decimal" aria-label="Jawaban untuk ${escapeHtml(item.label)}"></div>`).join("");
  document.querySelector("#hint-box").hidden = true;
  document.querySelector("#feedback-box").hidden = true;
  document.querySelector("#solution-box").hidden = true;
  document.querySelector("#feedback-box").classList.remove("success");
}

function checkAnswer() {
  if (!currentQuestion) return;
  const cells = [...document.querySelectorAll(".answer-cell")];
  let correct = 0;
  const wrongDetails = [];
  cells.forEach((cell, index) => {
    const input = cell.querySelector("input");
    const value = Number(input.value);
    const isCorrect = input.value !== "" && Math.abs(value - currentQuestion.answers[index]) < .001;
    cell.classList.toggle("correct", isCorrect);
    cell.classList.toggle("incorrect", !isCorrect);
    input.setAttribute("aria-invalid", String(!isCorrect));
    if (isCorrect) correct++;
    else wrongDetails.push(`<li><strong>${escapeHtml(currentQuestion.data[index].label)}</strong>: jawabanmu ${input.value === "" ? "belum diisi" : format(value)}; seharusnya ${format(currentQuestion.answers[index])}. ${currentQuestion.op.step(currentQuestion.data[index].a, currentQuestion.data[index].b)}</li>`);
  });
  const percent = Math.round(correct / cells.length * 100);
  const feedback = document.querySelector("#feedback-box");
  feedback.hidden = false;
  feedback.classList.toggle("success", correct === cells.length);
  feedback.innerHTML = correct === cells.length ? `<strong>Sempurna — ${correct}/${cells.length} benar.</strong> Semua elemen dihitung dengan tepat.` : `<strong>${correct}/${cells.length} elemen benar (${percent}%).</strong> Bagian yang perlu diperbaiki:<ul class="solution-list">${wrongDetails.join("")}</ul>`;
  if (!scoredCurrent) {
    scoreHistory.push(percent);
    scoreHistory = scoreHistory.slice(-50);
    try { localStorage.setItem("fuzzylabScores", JSON.stringify(scoreHistory)); } catch {}
    scoredCurrent = true;
    updateStats();
  }
}

document.querySelector("#new-question").addEventListener("click", generateQuestion);
document.querySelector("#difficulty").addEventListener("change", generateQuestion);
document.querySelector("#element-count").addEventListener("input", event => { document.querySelector("#element-count-output").textContent = event.target.value; });
document.querySelector("#element-count").addEventListener("change", generateQuestion);
document.querySelector("#check-answer").addEventListener("click", checkAnswer);
document.querySelector("#fill-mixed").addEventListener("click", () => {
  if (!currentQuestion) return;
  document.querySelectorAll(".answer-cell input").forEach((input, index) => {
    input.value = index % 2 === 0 ? currentQuestion.answers[index] : round((currentQuestion.answers[index] + .1) % 1.1);
  });
  checkAnswer();
});
document.querySelector("#show-hint").addEventListener("click", () => {
  if (!currentQuestion) return;
  const box = document.querySelector("#hint-box");
  box.innerHTML = `<strong>Petunjuk rumus:</strong> ${currentQuestion.op.formula}. Kerjakan rumus yang sama untuk setiap elemen x.`;
  box.hidden = !box.hidden;
});
document.querySelector("#show-solution").addEventListener("click", () => {
  if (!currentQuestion) return;
  const box = document.querySelector("#solution-box");
  const items = currentQuestion.data.map((item,index) => `<li><strong>${escapeHtml(item.label)}</strong>: ${currentQuestion.op.step(item.a,item.b)}</li>`).join("");
  box.innerHTML = `<strong>Solusi lengkap</strong><ul class="solution-list">${items}</ul><div class="set-line">${setNotation(currentQuestion.op.symbol, currentQuestion.data, (_,i)=>currentQuestion.answers[i])}</div>`;
  box.hidden = !box.hidden;
});

renderOperationOptions();
setRows(weekTwoExample);
generateQuestion();
updateStats();
