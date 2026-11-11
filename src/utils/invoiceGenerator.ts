import { jsPDF } from 'jspdf';
import { Order } from '../types/index.ts';

export function generateInvoicePdf(order: Order) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(16, 185, 129); // SmartCart Emerald Green
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SmartCart', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('TAX INVOICE / RETAIL RECEIPT', pageWidth - 14, 18, { align: 'right' });

  // Company Details
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text('Sold By: SmartCart Supermart Hyperlocal Logistics Ltd.', 14, 38);
  doc.text('GSTIN: 29AAECS9182C1ZP | FSSAI Lic: 11223344009988', 14, 43);
  doc.text('Fulfillment Center: Bellandur Darkstore Hub 04, Bengaluru 560103', 14, 48);

  // Order Details Box
  doc.setFillColor(243, 244, 246);
  doc.rect(14, 54, pageWidth - 28, 26, 'F');
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order ID: ${order.id}`, 18, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString('en-IN')}`, 18, 68);
  doc.text(`Transaction ID: ${order.transactionId}`, 18, 74);

  doc.setFont('helvetica', 'bold');
  doc.text(`Payment: ${order.paymentMethod}`, pageWidth - 18, 62, { align: 'right' });
  doc.setTextColor(16, 185, 129);
  doc.text(`Status: ${order.paymentStatus}`, pageWidth - 18, 68, { align: 'right' });
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Delivery: ${order.deliverySlot}`, pageWidth - 18, 74, { align: 'right' });

  // Customer & Shipping Info
  doc.setFont('helvetica', 'bold');
  doc.text('Customer & Delivery Details:', 14, 88);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${order.userName} (${order.userPhone})`, 14, 94);
  doc.text(`Email: ${order.userEmail}`, 14, 99);
  doc.text(`Address: ${order.deliveryAddress}`, 14, 104);

  // Items Table Header
  let y = 114;
  doc.setFillColor(229, 231, 235);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('No.', 16, y + 5.5);
  doc.text('Item Description', 28, y + 5.5);
  doc.text('Brand', 95, y + 5.5);
  doc.text('Qty', 130, y + 5.5);
  doc.text('Price (INR)', 150, y + 5.5);
  doc.text('Total (INR)', pageWidth - 16, y + 5.5, { align: 'right' });

  // Items Rows
  y += 12;
  doc.setFont('helvetica', 'normal');
  order.items.forEach((item, index) => {
    doc.text(`${index + 1}`, 16, y);
    doc.text(`${item.name.substring(0, 36)}`, 28, y);
    doc.text(`${item.brand || 'Grocery'}`, 95, y);
    doc.text(`${item.quantity} x ${item.unit || 'unit'}`, 130, y);
    doc.text(`Rs. ${item.price}`, 150, y);
    doc.text(`Rs. ${item.price * item.quantity}`, pageWidth - 16, y, { align: 'right' });
    y += 7;
  });

  // Price Calculation Summary
  y += 6;
  doc.setDrawColor(209, 213, 219);
  doc.line(14, y, pageWidth - 14, y);
  y += 7;

  doc.text(`Items Subtotal:`, 130, y);
  doc.text(`Rs. ${order.subtotal}`, pageWidth - 16, y, { align: 'right' });
  y += 6;

  if (order.discount > 0) {
    doc.setTextColor(16, 185, 129);
    doc.text(`Coupon Savings (${order.couponCode || 'PROMO'}):`, 130, y);
    doc.text(`- Rs. ${order.discount}`, pageWidth - 16, y, { align: 'right' });
    doc.setTextColor(31, 41, 55);
    y += 6;
  }

  doc.text(`Delivery Fee:`, 130, y);
  doc.text(order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee}`, pageWidth - 16, y, {
    align: 'right',
  });
  y += 8;

  // Final Total
  doc.setFillColor(16, 185, 129);
  doc.rect(125, y - 5, pageWidth - 139, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total Amount Paid:`, 130, y + 1.5);
  doc.text(`Rs. ${order.totalAmount}`, pageWidth - 18, y + 1.5, { align: 'right' });

  // Footer notes
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for shopping with SmartCart!', 14, 260);
  doc.text('For queries or returns, visit My Orders > Customer Support on the SmartCart app.', 14, 265);
  doc.text('This is a computer-generated tax invoice verified under Razorpay gateway integration.', 14, 270);

  // Save PDF
  doc.save(`SmartCart_Invoice_${order.id}.pdf`);
}
