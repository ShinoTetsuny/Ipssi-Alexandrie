import { jsPDF } from "jspdf";

export async function generateInvoiceAndUpload(clientName, clientSurname, clientAddress, clientId) {
    const doc = new jsPDF();
    console.log("Generating invoice for:", clientName, clientSurname, clientAddress, clientId);
    // Business Information
    const businessName = "Alexandrie";
    const businessAddress = "Immeuble Le Sésame, 8 Rue Germain Soufflot, 78180 Montigny-le-Bretonneux";
    const businessSIRET = "123 456 789 00000";

    // Invoice Information
    const date = new Date().toLocaleDateString();
    const designation = "Service de stockage de fichiers";
    const unitPrice = 0.8;
    const quantity = 20;
    const taxRate = 20;
    const priceWithoutTaxes = (unitPrice * quantity).toFixed(2);
    const taxAmount = (priceWithoutTaxes * (taxRate / 100)).toFixed(2);
    const totalWithTaxes = (parseFloat(priceWithoutTaxes) + parseFloat(taxAmount)).toFixed(2);

    // Add Business Details
    doc.setFontSize(12);
    doc.text(businessName, 20, 20);
    doc.text(businessAddress, 20, 30);
    doc.text("SIRET: " + businessSIRET, 20, 40);

    // Add Invoice Details
    doc.setFontSize(16);
    doc.text("Invoice", 20, 60);

    doc.setFontSize(12);
    doc.text("Date: " + date, 20, 70);
    doc.text("Client: " + clientName + " " + clientSurname, 20, 80);
    doc.text("Address: " + clientAddress, 20, 90);

    // Add Subject
    doc.text("Designation: " + designation, 20, 110);
    doc.text("Unit Price (Excl. Tax): " + unitPrice + " €", 20, 120);
    doc.text("Quantity: " + quantity, 20, 130);
    doc.text("Total (Excl. Tax): " + priceWithoutTaxes + " €", 20, 140);
    
    // Add Tax and Total
    doc.text("Tax Rate: " + taxRate + "%", 20, 160);
    doc.text("Tax Amount: " + taxAmount + " €", 20, 170);
    doc.text("Total (Incl. Tax): " + totalWithTaxes + " €", 20, 180);

    // Generate PDF Blob
    const pdfBlob = doc.output("blob");

    const formattedDate = getFormattedDate();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", pdfBlob, `invoice_${clientSurname}_${formattedDate}.pdf`);
    formData.append("client", clientId); // Attach the client ID to the upload
    console.log(formData);

    try {
        const response = await fetch("http://localhost:3000/files/facturation", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload the PDF");
        }

        const result = await response.json();
        console.log("File uploaded successfully:", result);
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}