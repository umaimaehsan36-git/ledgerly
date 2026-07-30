import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportStatement(transactions, userName) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229);
  doc.text('Ledgerly', 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Statement for ${userName}`, 14, 28);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 34);

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Total Income: Rs. ${income.toLocaleString()}`, 14, 44);
  doc.text(`Total Expenses: Rs. ${expense.toLocaleString()}`, 14, 50);
  doc.text(`Net Balance: Rs. ${(income - expense).toLocaleString()}`, 14, 56);

  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.category,
    t.type,
    t.note || '-',
    t.flagged ? `Flagged (${t.riskScore})` : '-',
    `Rs. ${t.amount.toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 64,
    head: [['Date', 'Category', 'Type', 'Note', 'Risk', 'Amount']],
    body: rows,
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 },
  });

  doc.save(`ledgerly-statement-${new Date().toISOString().slice(0, 10)}.pdf`);
}