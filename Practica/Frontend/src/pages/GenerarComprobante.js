import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GenerarComprobante = (cuenta, tipo, fecha, monto, empleado) => {
    const doc = new jsPDF({frormat: 'a4', orientation: 'portrait'});
    doc.text('Comprobante de pago', 20, 10)
    autoTable(doc, {
        head: [['Cuenta', 'Tipo', 'Fecha', 'Monto', 'Empleado Autorizado']],
        body: [[cuenta, tipo, fecha, monto, empleado]]
    })
    doc.save(cuenta+tipo+'.pdf')

}

export default GenerarComprobante;