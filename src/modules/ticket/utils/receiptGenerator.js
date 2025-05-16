export const generateReceipt = (purchase) => {
    const { items, total, paymentMethod, passengerId, transactionId, timestamp, cashReceived, agentId } = purchase;

    const receiptData = {
        transactionId,
        timestamp: new Date(timestamp).toLocaleString(),
        passengerId: passengerId || 'Guest',
        items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price
        })),
        total,
        paymentMethod: paymentMethod === 'ewallet' ? 'E-Wallet Payment' : 'Cash Payment',
        cashReceived: paymentMethod === 'cash' ? cashReceived : undefined,
        change: paymentMethod === 'cash' ? cashReceived - total : undefined,
        agentId
    };

    // This would typically connect to a receipt printer API
    // For now, we'll just generate a printable window
    const receiptWindow = window.open('', '_blank');

    if (receiptWindow) {
        receiptWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${transactionId}</title>
          <style>
            body { font-family: monospace; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 15px; }
            .items { width: 100%; border-collapse: collapse; }
            .items th, .items td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { margin-top: 15px; text-align: right; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>HCMC Metro</h2>
            <h3>Ticket Receipt</h3>
            <p>Transaction ID: ${transactionId}</p>
            <p>Date: ${receiptData.timestamp}</p>
          </div>
          
          <div class="details">
            <p>Passenger ID: ${receiptData.passengerId}</p>
            <p>Agent ID: ${receiptData.agentId}</p>
          </div>
          
          <table class="items">
            <tr>
              <th>Ticket</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
            ${receiptData.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()} VND</td>
                <td>${item.subtotal.toLocaleString()} VND</td>
              </tr>
            `).join('')}
          </table>
          
          <div class="total">
            <p>Total: ${receiptData.total.toLocaleString()} VND</p>
            ${receiptData.cashReceived ? `
              <p>Cash Received: ${receiptData.cashReceived.toLocaleString()} VND</p>
              <p>Change: ${receiptData.change.toLocaleString()} VND</p>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Thank you for using HCMC Metro!</p>
          </div>
        </body>
      </html>
    `);
        receiptWindow.document.close();
        receiptWindow.print();
    }

    return receiptData;
};