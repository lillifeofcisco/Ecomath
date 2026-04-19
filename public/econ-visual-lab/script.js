const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

const controls = {
  a: document.getElementById("a"),
  b: document.getElementById("b"),
  c: document.getElementById("c"),
  d: document.getElementById("d"),
  tax: document.getElementById("tax"),
};

const outputs = {
  aVal: document.getElementById("aVal"),
  bVal: document.getElementById("bVal"),
  cVal: document.getElementById("cVal"),
  dVal: document.getElementById("dVal"),
  taxVal: document.getElementById("taxVal"),
  demandEq: document.getElementById("demandEq"),
  supplyEq: document.getElementById("supplyEq"),
  taxSupplyEq: document.getElementById("taxSupplyEq"),
  pStar: document.getElementById("pStar"),
  qStar: document.getElementById("qStar"),
  pc: document.getElementById("pc"),
  pp: document.getElementById("pp"),
  qt: document.getElementById("qt"),
  consumerBurden: document.getElementById("consumerBurden"),
  producerBurden: document.getElementById("producerBurden"),
};

const W = canvas.width;
const H = canvas.height;
const margin = 60;

function getValues() {
  return {
    a: parseFloat(controls.a.value),
    b: parseFloat(controls.b.value),
    c: parseFloat(controls.c.value),
    d: parseFloat(controls.d.value),
    t: parseFloat(controls.tax.value),
  };
}

function round2(x) {
  return Number(x).toFixed(2);
}

function economics(vals) {
  const { a, b, c, d, t } = vals;

  const pStar = (a - c) / (b + d);
  const qStar = a - b * pStar;

  const pc = (a - c + d * t) / (b + d);
  const pp = pc - t;
  const qt = a - b * pc;

  const consumerBurden = pc - pStar;
  const producerBurden = pStar - pp;

  return {
    pStar,
    qStar,
    pc,
    pp,
    qt,
    consumerBurden,
    producerBurden,
  };
}

function getPlotLimits(vals, econ) {
  const { a, b, c, d, t } = vals;

  const demandPIntercept = a / b;
  const supplyPIntercept = -c / d;
  const taxedSupplyPIntercept = t - c / d;

  const maxP = Math.max(
    demandPIntercept,
    supplyPIntercept,
    taxedSupplyPIntercept,
    econ.pc,
    econ.pStar,
    10
  ) + 10;

  const maxQ = Math.max(a, econ.qStar, econ.qt, 10) + 10;

  return { maxP, maxQ };
}

function xScale(q, maxQ) {
  return margin + (q / maxQ) * (W - 2 * margin);
}

function yScale(p, maxP) {
  return H - margin - (p / maxP) * (H - 2 * margin);
}

function clearCanvas() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
}

function drawAxes(maxQ, maxP) {
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(margin, H - margin);
  ctx.lineTo(W - margin, H - margin);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(margin, H - margin);
  ctx.lineTo(margin, margin);
  ctx.stroke();

  ctx.fillStyle = "#111827";
  ctx.font = "14px Arial";
  ctx.fillText("Quantity", W / 2, H - 20);
  ctx.save();
  ctx.translate(20, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Price", 0, 0);
  ctx.restore();

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#374151";
  ctx.font = "12px Arial";

  const xTicks = 5;
  const yTicks = 5;

  for (let i = 0; i <= xTicks; i++) {
    const q = (i / xTicks) * maxQ;
    const x = xScale(q, maxQ);

    ctx.beginPath();
    ctx.moveTo(x, H - margin);
    ctx.lineTo(x, margin);
    ctx.stroke();

    ctx.fillText(round2(q), x - 12, H - margin + 18);
  }

  for (let i = 0; i <= yTicks; i++) {
    const p = (i / yTicks) * maxP;
    const y = yScale(p, maxP);

    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(W - margin, y);
    ctx.stroke();

    ctx.fillText(round2(p), 15, y + 4);
  }
}

function drawLineFromEquation(getQFromP, maxP, maxQ, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();

  let started = false;

  for (let p = 0; p <= maxP; p += maxP / 240) {
    const q = getQFromP(p);

    if (q >= 0 && q <= maxQ * 1.2) {
      const x = xScale(q, maxQ);
      const y = yScale(p, maxP);

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
  }

  ctx.stroke();
}

function drawLegend() {
  const items = [
    { label: "Demand", color: "#2563eb" },
    { label: "Supply", color: "#16a34a" },
    { label: "Supply + Tax", color: "#dc2626" },
  ];

  const startX = W - margin - 140;
  let startY = 34;

  ctx.font = "14px Arial";

  items.forEach((item) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(startX, startY - 10, 18, 4);
    ctx.fillStyle = "#111827";
    ctx.fillText(item.label, startX + 26, startY);
    startY += 22;
  });
}

function drawPoint(q, p, maxQ, maxP, color, label) {
  const x = xScale(q, maxQ);
  const y = yScale(p, maxP);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.font = "13px Arial";
  ctx.fillText(label, x + 10, y - 10);
}

function drawGuideLines(q, p, maxQ, maxP, color) {
  const x = xScale(q, maxQ);
  const y = yScale(p, maxP);

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, H - margin);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(margin, y);
  ctx.stroke();

  ctx.setLineDash([]);
}

function drawTaxWedge(q, pc, pp, maxQ, maxP) {
  const x = xScale(q, maxQ);
  const yPc = yScale(pc, maxP);
  const yPp = yScale(pp, maxP);

  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(x, yPc);
  ctx.lineTo(x, yPp);
  ctx.stroke();

  ctx.fillStyle = "#6d28d9";
  ctx.font = "13px Arial";
  ctx.fillText("Tax wedge", x + 10, (yPc + yPp) / 2);
}

function updateText(vals, econ) {
  outputs.aVal.textContent = vals.a;
  outputs.bVal.textContent = vals.b;
  outputs.cVal.textContent = vals.c;
  outputs.dVal.textContent = vals.d;
  outputs.taxVal.textContent = vals.t;

  outputs.demandEq.textContent = `Demand: Qd = ${vals.a} - ${vals.b}P`;
  outputs.supplyEq.textContent = `Supply: Qs = ${vals.c} + ${vals.d}P`;
  outputs.taxSupplyEq.textContent = `Taxed Supply: Qs = ${vals.c} + ${vals.d}(P - ${vals.t})`;

  outputs.pStar.textContent = round2(econ.pStar);
  outputs.qStar.textContent = round2(econ.qStar);
  outputs.pc.textContent = round2(econ.pc);
  outputs.pp.textContent = round2(econ.pp);
  outputs.qt.textContent = round2(econ.qt);
  outputs.consumerBurden.textContent = round2(econ.consumerBurden);
  outputs.producerBurden.textContent = round2(econ.producerBurden);
}

function render() {
  const vals = getValues();
  const econ = economics(vals);
  const { maxP, maxQ } = getPlotLimits(vals, econ);

  updateText(vals, econ);
  clearCanvas();
  drawAxes(maxQ, maxP);

  drawLineFromEquation((p) => vals.a - vals.b * p, maxP, maxQ, "#2563eb");
  drawLineFromEquation((p) => vals.c + vals.d * p, maxP, maxQ, "#16a34a");
  drawLineFromEquation((p) => vals.c + vals.d * (p - vals.t), maxP, maxQ, "#dc2626");
  drawLegend();

  if (econ.qStar >= 0 && econ.pStar >= 0) {
    drawGuideLines(econ.qStar, econ.pStar, maxQ, maxP, "#2563eb");
    drawPoint(econ.qStar, econ.pStar, maxQ, maxP, "#111827", "E0");
  }

  if (econ.qt >= 0 && econ.pc >= 0 && econ.pp >= 0) {
    drawGuideLines(econ.qt, econ.pc, maxQ, maxP, "#dc2626");
    drawPoint(econ.qt, econ.pc, maxQ, maxP, "#dc2626", "Pc");
    drawPoint(econ.qt, econ.pp, maxQ, maxP, "#16a34a", "Pp");
    drawTaxWedge(econ.qt, econ.pc, econ.pp, maxQ, maxP);
  }
}

Object.values(controls).forEach((input) => {
  input.addEventListener("input", render);
});

render();
