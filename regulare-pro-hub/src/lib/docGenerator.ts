import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

/**
 * Generates a DOCX file buffer
 */
export async function generateDOCXBuffer(title: string, data: any) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: title.toUpperCase(),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "PROPRIETÁRIO: ", bold: true }),
            new TextRun(data.client_name),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "ENDEREÇO: ", bold: true }),
            new TextRun(data.property_address),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "OBJETO: ", bold: true }),
            new TextRun(data.process_type),
          ],
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: "MEMORIAL DESCRITIVO",
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `O presente documento refere-se ao processo de regularização técnica ${data.process_code}, para o imóvel localizado em ${data.property_address}, bairro ${data.property_neighborhood}, na cidade de ${data.property_city}.`,
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `O imóvel possui área de terreno de ${data.property_area_land} m² e área construída de ${data.property_area_built} m², estando devidamente registrado sob a matrícula nº ${data.property_registration}.`,
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: data.current_date_long,
          alignment: AlignmentType.RIGHT,
          spacing: { before: 800, after: 400 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "_______________________________________", bold: true }),
            new TextRun({ break: 1, text: data.engineer_name, bold: true }),
            new TextRun({ break: 1, text: `CREA: ${data.engineer_crea}` }),
          ],
        }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Generates a PDF file buffer (Programmatic approach)
 */
export async function generatePDFBuffer(title: string, data: any) {
  const doc = new jsPDF();
  const margin = 20;
  let y = 30;

  doc.setFontSize(16);
  doc.text(title.toUpperCase(), 105, y, { align: 'center' });
  
  y += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("PROPRIETÁRIO:", margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.client_name, margin + 35, y);

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text("ENDEREÇO:", margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.property_address, margin + 35, y);

  y += 20;
  doc.setFontSize(12);
  doc.text("MEMORIAL DESCRITIVO", 105, y, { align: 'center' });

  y += 15;
  doc.setFontSize(10);
  const text = `O presente documento refere-se ao processo de regularização técnica ${data.process_code}, para o imóvel localizado em ${data.property_address}, bairro ${data.property_neighborhood}, na cidade de ${data.property_city}. O imóvel possui área de terreno de ${data.property_area_land} m² e área construída de ${data.property_area_built} m².`;
  const splitText = doc.splitTextToSize(text, 170);
  doc.text(splitText, margin, y);

  y += 60;
  doc.text(data.current_date_long, 190, y, { align: 'right' });

  y += 40;
  doc.text("_______________________________________", 105, y, { align: 'center' });
  doc.text(data.engineer_name, 105, y + 10, { align: 'center' });
  doc.text(`CREA: ${data.engineer_crea}`, 105, y + 15, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}
