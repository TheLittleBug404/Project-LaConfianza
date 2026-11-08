import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Layers
} from 'lucide-react';
import type { PawnLoan } from '../../types';
import { usePawn } from '../../context/PawnContext';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: PawnLoan | null;
}

// Conversor de números a literal en bolivianos
function numeroALiteral(monto: number): string {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const diez_a_veinte = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  const entero = Math.floor(monto);
  const decimales = Math.round((monto - entero) * 100);
  const decimalStr = `${decimales.toString().padStart(2, '0')}/100`;

  if (entero === 0) return `CERO ${decimalStr} BOLIVIANOS`;
  if (entero === 100) return `CIEN ${decimalStr} BOLIVIANOS`;
  if (entero === 1000) return `MIL ${decimalStr} BOLIVIANOS`;

  function convertirGrupo(n: number): string {
    let salida = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c === 1 && d === 0 && u === 0) {
      salida += 'CIEN ';
    } else if (c > 0) {
      salida += centenas[c] + ' ';
    }

    if (d === 1) {
      salida += diez_a_veinte[u] + ' ';
    } else if (d === 2 && u > 0) {
      salida += 'VEINTI' + unidades[u] + ' ';
    } else if (d > 0) {
      salida += decenas[d] + (u > 0 ? ' Y ' + unidades[u] : '') + ' ';
    } else if (u > 0) {
      salida += unidades[u] + ' ';
    }

    return salida.trim();
  }

  let letras = '';
  if (entero >= 1000) {
    const miles = Math.floor(entero / 1000);
    const resto = entero % 1000;
    if (miles === 1) {
      letras += 'MIL ';
    } else {
      letras += convertirGrupo(miles) + ' MIL ';
    }
    if (resto > 0) {
      letras += convertirGrupo(resto) + ' ';
    }
  } else {
    letras = convertirGrupo(entero) + ' ';
  }

  return `${letras.trim()} ${decimalStr} BOLIVIANOS`;
}

function formatearFechaBolivia(fechaIso: string): string {
  const d = new Date(fechaIso);
  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];
  return `${d.getDate()} - ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  loan
}) => {
  const { payments } = usePawn();
  const [activeView, setActiveView] = useState<'ANVERSO' | 'REVERSO' | 'AMBOS'>('AMBOS');

  if (!isOpen || !loan) return null;

  const handlePrint = () => {
    window.print();
  };

  const interestRate = loan.monthlyInterestRate ?? 3;
  const adminRate = loan.adminExpensesRate ?? 12;
  const interestAmount = (loan.loanAmount * interestRate) / 100;
  const adminAmount = loan.adminExpensesAmount ?? (loan.loanAmount * adminRate) / 100;
  const totalExpensesAndInterest = interestAmount + adminAmount;
  const totalWithCapital = loan.loanAmount + totalExpensesAndInterest;

  const startDateStr = formatearFechaBolivia(loan.startDate);
  const dueDateStr = formatearFechaBolivia(loan.dueDate);
  const literalCapital = numeroALiteral(loan.loanAmount);

  // Pagos registrados de este préstamo
  const loanPayments = payments.filter(p => p.loanId === loan.id);
  const prorrogas = loanPayments.filter(p => p.type === 'PAGO_INTERES_REFRENDO');
  const anticipos = loanPayments.filter(p => p.type === 'ABONO_CAPITAL');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content contract-modal-window" 
        style={{ 
          maxWidth: '920px', 
          width: '95%',
          maxHeight: '92vh',
          background: '#131f37', 
          color: '#0F172A',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header de la ventana Modal (No se imprime) */}
        <div 
          className="modal-header no-print" 
          style={{ 
            background: '#0b1324', 
            borderBottom: '1px solid #223559',
            padding: '12px 20px',
            color: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={20} color="#F59E0B" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                Contrato Oficial con Garantía Prendaria ({loan.code})
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Formato legal idéntico al talonario físico (Anverso y Reverso)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Toggle de Vistas */}
            <div style={{ display: 'flex', background: '#1e2e4f', borderRadius: '6px', padding: '3px', gap: '3px' }}>
              <button
                className={`btn btn-sm ${activeView === 'AMBOS' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => setActiveView('AMBOS')}
              >
                <Layers size={13} />
                <span>Completo (2 Caras)</span>
              </button>
              <button
                className={`btn btn-sm ${activeView === 'ANVERSO' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => setActiveView('ANVERSO')}
              >
                <span>Anverso</span>
              </button>
              <button
                className={`btn btn-sm ${activeView === 'REVERSO' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => setActiveView('REVERSO')}
              >
                <span>Reverso</span>
              </button>
            </div>

            <button 
              className="btn btn-yellow btn-sm"
              onClick={handlePrint}
              style={{ fontWeight: 800 }}
            >
              <Printer size={15} />
              <span>Imprimir Contrato</span>
            </button>

            <button 
              className="btn btn-secondary btn-icon btn-sm" 
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Contenedor del Documento Imprimible */}
        <div 
          className="printable-contract-container"
          style={{ 
            overflowY: 'auto', 
            padding: '24px', 
            background: '#475569',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          
          {/* ========================================================= */}
          {/* CARA 1: ANVERSO (IMAGEN 1)                                */}
          {/* ========================================================= */}
          {(activeView === 'ANVERSO' || activeView === 'AMBOS') && (
            <div 
              className="contract-page contract-page-anverso print-area"
              style={{
                width: '100%',
                maxWidth: '750px',
                background: '#FFFFFF',
                color: '#000000',
                padding: '28px 32px',
                borderRadius: '4px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                fontFamily: "'Arial', sans-serif",
                fontSize: '11px',
                lineHeight: 1.25,
                boxSizing: 'border-box'
              }}
            >
              {/* Encabezado Superior */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Icono de apretón de manos */}
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    border: '2px solid #1e3a8a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1e3a8a',
                    fontWeight: 900,
                    fontSize: '20px'
                  }}>
                    🤝
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', letterSpacing: '0.15em', fontWeight: 800, color: '#1e3a8a', display: 'block' }}>
                      PRENDARIOS
                    </span>
                    <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#1e3a8a', margin: 0, textTransform: 'uppercase' }}>
                      PRÉSTAMOS DE DINERO
                    </h2>
                    <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#1e3a8a', margin: 0, fontStyle: 'italic' }}>
                      "La Confianza"
                    </h3>
                  </div>
                </div>

                {/* Ubicación y Celulares */}
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#1f2937' }}>
                  <div>Zona 6 de Agosto,</div>
                  <div>calle Saucari</div>
                  <div style={{ fontWeight: 700 }}>Cel.: 70198935 - 68161944</div>
                  
                  {/* No. de Trámite / Recibo */}
                  <div style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '2px solid #b91c1c', padding: '3px 10px', borderRadius: '4px', background: '#fef2f2' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b' }}>RECIBO Nº:</span>
                    <strong style={{ fontSize: '16px', color: '#b91c1c', fontFamily: 'monospace', fontWeight: 900 }}>{loan.receiptCode || loan.code}</strong>
                  </div>
                </div>
              </div>

              {/* Título Principal */}
              <div style={{ textAlign: 'center', margin: '8px 0', borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000', padding: '4px 0' }}>
                <h1 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.04em', margin: 0, color: '#000000' }}>
                  BASES LEGALES PARA EL PRÉSTAMO DE DINERO CON GARANTÍA PRENDARIA
                </h1>
              </div>

              {/* Tabla de Resumen Financiero y Fechas */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '10.5px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ border: '1px solid #000000', padding: '4px 8px', width: '33%', textAlign: 'center', fontWeight: 700 }}>Fecha</th>
                    <th style={{ border: '1px solid #000000', padding: '4px 8px', width: '33%', textAlign: 'center', fontWeight: 700 }}>Plazo (Días)</th>
                    <th style={{ border: '1px solid #000000', padding: '4px 8px', width: '34%', textAlign: 'center', fontWeight: 700 }}>Vencimiento de Plazo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #000000', padding: '4px 8px', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase' }}>
                      {startDateStr}
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '4px 8px', textAlign: 'center', fontWeight: 800 }}>
                      {loan.termDays || (loan.termMonths * 30) || 30} DÍAS
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '4px 8px', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', color: '#b91c1c' }}>
                      {dueDateStr}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px 8px', fontWeight: 700 }}>
                      Monto
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '3px 8px', textAlign: 'right', fontWeight: 800, fontSize: '11px' }}>
                      Bs. {loan.loanAmount.toFixed(2)} -
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px 8px', fontWeight: 700 }}>
                      Interés (tasa de interés del {interestRate}% Mensual)
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '3px 8px', textAlign: 'right', fontWeight: 800, color: '#1e3a8a' }}>
                      Bs. {interestAmount.toFixed(2)} -
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid #000000', padding: '3px 8px', fontWeight: 700 }}>
                      Gastos Administrativos, Conservación, Guarda Custodia y Riesgo ({adminRate}%)
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '3px 8px', textAlign: 'right', fontWeight: 800, color: '#b45309' }}>
                      Bs. {adminAmount.toFixed(2)} -
                    </td>
                  </tr>
                  <tr style={{ background: '#f9fafb' }}>
                    <td colSpan={2} style={{ border: '1.5px solid #000000', padding: '4px 8px', fontWeight: 900 }}>
                      Total a pagar por concepto de Interés y gastos Administrativos (Bs.) más Capital
                    </td>
                    <td style={{ border: '1.5px solid #000000', padding: '4px 8px', textAlign: 'right', fontWeight: 900, fontSize: '12px' }}>
                      Bs. {totalWithCapital.toFixed(2)} -
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Artículos de Respaldo Legal */}
              <div style={{ fontSize: '7.8px', color: '#374151', textAlign: 'justify', marginBottom: '8px', lineHeight: 1.2 }}>
                <p style={{ margin: '0 0 2px 0' }}>
                  <strong>Art. 100 del Código Civil:</strong> "La posesión de buena fe de los muebles corporales, vale por título de propiedad, salvo prueba en contrario". Que, el Artículo 409 (INTERES CONVENCIONAL) del código civil boliviano, establece que "El interés convencional no pueden exceder del tres por ciento mensual. Si se estipula en calidad Superior se reduce automáticamente la dicha tasa".
                </p>
                <p style={{ margin: '0 0 2px 0' }}>
                  <strong>Art. 884 del Código de Comercio Boliviano</strong>, aprobado mediante Decreto Ley N° 14379, establece que "El deudor está obligado al reembolso de los gastos necesarios en que incurra el acreedor en la conservación de la cosa prendada, así como de los perjuicios que a este le hubiera ocasionado su tenencia".
                </p>
                <p style={{ margin: '0 0 2px 0' }}>
                  <strong>Art. 1411 del Código Civil Nral. I y II respectivamente dice:</strong> "El acreedor está obligado a cuidar la prenda como si fuera un bien propio y responde por su pérdida o deterioro" - "Quien ha constituido la prenda está obligado al reembolso de los gastos que el acreedor haya realizado para la conservación de ella".
                </p>
                <p style={{ margin: '0 0 2px 0' }}>
                  <strong>Art. 885 del Código de Comercio:</strong> "El acreedor tiene derecho a retener la cosa dada en prenda, en garantía del cumplimiento de la obligación señalada en el artículo anterior".
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Art. 1404 del Código Civil</strong>, aplicable al presente caso establece: "El contrato de prenda confiere al acreedor el derecho a retener la cosa. No se puede exigir la restitución de ella ni su entrega al tercero adquirente si antes no han sido íntegramente pagado el capital y los intereses y reembolsados los gastos relativos a la deuda y la conservación de la cosa".
                </p>
              </div>

              {/* Cláusulas del Contrato */}
              <div style={{ fontSize: '9px', textAlign: 'justify', lineHeight: 1.25, borderTop: '1px solid #000000', paddingTop: '6px' }}>
                <p style={{ margin: '0 0 3px 0' }}>
                  Conste por el presente documento privado de préstamo de dinero con garantía prendaria sujeto a los términos y condiciones siguientes:
                </p>

                <p style={{ margin: '0 0 3px 0' }}>
                  <strong>PRIMERO.-</strong> Titular y/o Representante legal con Matrícula de Comercio <strong>SEPREC - 00523079</strong>, NIT <strong>4372111014</strong> con domicilio en El Alto, mayor de edad, hábil por derecho, por los fueros del legítimo interés, de forma libre y voluntaria, sin que medie vicio alguno en mi consentimiento, doy en calidad de préstamos la suma de Bs. <span style={{ textDecoration: 'underline', fontWeight: 800 }}>{loan.loanAmount.toFixed(2)}</span> (<strong>{literalCapital}</strong>), a favor de: <span style={{ textDecoration: 'underline', fontWeight: 800, textTransform: 'uppercase' }}>{loan.customerName}</span> con C.I. No. <span style={{ textDecoration: 'underline', fontWeight: 800 }}>{loan.customerDni}</span> Con Domicilio: <span style={{ textDecoration: 'underline' }}>{loan.customerAddress || 'Z/LOS ANDES C/27 NOVIEMBRE #1435'}</span> Celular: <span style={{ textDecoration: 'underline' }}>{loan.customerPhone || '76283666'}</span>.
                </p>

                <p style={{ margin: '0 0 3px 0' }}>
                  <strong>SEGUNDO.-</strong> Que, el cumplimiento de la presente obligación será la fecha pactada.
                </p>

                <p style={{ margin: '0 0 3px 0' }}>
                  <strong>TERCERO.-</strong> Que, el interés libremente pactado es del {interestRate}% mensual más los gastos administrativos, pagaderos al cumplimiento de cada mes.
                </p>

                <p style={{ margin: '0 0 3px 0' }}>
                  <strong>CUARTO.-</strong> Que, el deudor para garantizar el cumplimiento de la presente obligación, ofrece en calidad de prenda con el bien del cual declara ser único legítimo propietario, cuyas características son las siguientes:
                </p>
              </div>

              {/* Tabla de Descripción de Prenda */}
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '4px 0 8px', fontSize: '9.5px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ border: '1px solid #000000', padding: '3px 6px', width: '5%', textAlign: 'center' }}>N°</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 6px', width: '45%', textAlign: 'center' }}>Descripción de la prenda</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 6px', width: '18%', textAlign: 'center' }}>Estado</th>
                    <th style={{ border: '1px solid #000000', padding: '3px 6px', width: '32%', textAlign: 'center' }}>Algunos códigos de referencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ height: '28px' }}>
                    <td style={{ border: '1px solid #000000', padding: '4px 6px', textAlign: 'center', fontWeight: 700 }}>1</td>
                    <td style={{ border: '1px solid #000000', padding: '4px 6px', fontWeight: 800, textTransform: 'uppercase' }}>
                      {loan.item.name}
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '4px 6px', textAlign: 'center' }}>
                      {loan.item.condition}
                    </td>
                    <td style={{ border: '1px solid #000000', padding: '4px 6px', fontFamily: 'monospace', fontSize: '9px' }}>
                      {loan.item.code && <div style={{ fontWeight: 700 }}>CÓD: {loan.item.code}</div>}
                      <div>{loan.item.serialNumber || 'S/N - REGISTRADO EN BÓVEDA'}</div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Cláusulas Finales */}
              <div style={{ fontSize: '8px', color: '#1f2937', textAlign: 'justify', lineHeight: 1.2, marginBottom: '10px' }}>
                <p style={{ margin: '0 0 2px 0' }}>
                  <strong>QUINTO.-</strong> Que, en caso de que el deudor no cumpla con la devolución del monto adeudado dentro del plazo de 60 días calendario a partir de la suscripción del presente documento, el objeto constituido por el deudor como prenda con desplazamiento, se reputa como transferido a título de compra venta a favor del acreedor, quien podrá disponer la prenda, otorgándose en plazo de 30 días mas para que opere el rescate por el Acreedor y Cliente.
                </p>
                <p style={{ margin: '0 0 2px 0' }}>
                  <strong>SEXTO.-</strong> Que, el deudor, en cumplimiento al Art. el artículo 884 del Código de Comercio Boliviano y el numeral II del Art. 1411 del Código Civil Boliviano, a tiempo de cumplir con el pago del monto adecuado, además de los intereses, deberá reembolsar los gastos que el acreedor haya realizado la conversión y cuidado de la prenda.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>SEPTIMO.-</strong> El CLIENTE y el ACREEDOR, ambas partes mayores de edad, hábiles por derecho, declaramos ABSOLUTA CONFORMIDAD con el tenor de todos los términos precedentemente referidos.
                </p>
              </div>

              {/* Sección de Firmas y Huella Digital */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', paddingTop: '10px' }}>
                {/* Firma Representante */}
                <div style={{ width: '38%', textAlign: 'center', fontSize: '9px' }}>
                  <div style={{ height: '35px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'cursive', fontSize: '18px', color: '#1e3a8a' }}>Doris</span>
                  </div>
                  <div style={{ borderTop: '1px solid #000000', paddingTop: '3px' }}>
                    <strong>REPRESENTANTE LEGAL</strong><br />
                    PRESTAMOS "LA CONFIANZA"<br />
                    <span style={{ fontSize: '8.5px' }}>DORIS / C.I. 4372111</span>
                  </div>
                </div>

                {/* Firma Cliente */}
                <div style={{ width: '38%', textAlign: 'center', fontSize: '9px' }}>
                  <div style={{ height: '35px' }}></div>
                  <div style={{ borderTop: '1px solid #000000', paddingTop: '3px' }}>
                    <strong>EL CLIENTE</strong><br />
                    <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{loan.customerName}</span><br />
                    <span style={{ fontSize: '8.5px' }}>C.I.: {loan.customerDni}</span>
                  </div>
                </div>

                {/* Recuadro de Huella */}
                <div style={{ width: '18%', textAlign: 'center' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '65px', 
                    border: '1.5px solid #000000', 
                    borderRadius: '4px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: '#9ca3af'
                  }}>
                    HUELLA
                  </div>
                  <span style={{ fontSize: '7.5px', fontWeight: 700, display: 'block', marginTop: '2px' }}>HUELLA</span>
                </div>
              </div>

              {/* Pie de Página Legal */}
              <div style={{ textAlign: 'center', fontSize: '7.5px', color: '#6b7280', marginTop: '12px', borderTop: '1px dotted #9ca3af', paddingTop: '3px' }}>
                FECHA UP SUPRA - El presente documento es de uso exclusivo de la A.P.C.E. "Francisco Piquer" cualquier reproducción será objeto de demanda penal
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CARA 2: REVERSO (IMAGEN 2)                                */}
          {/* ========================================================= */}
          {(activeView === 'REVERSO' || activeView === 'AMBOS') && (
            <div 
              className="contract-page contract-page-reverso print-area"
              style={{
                width: '100%',
                maxWidth: '750px',
                background: '#FFFFFF',
                color: '#000000',
                padding: '28px 32px',
                borderRadius: '4px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                fontFamily: "'Arial', sans-serif",
                fontSize: '10px',
                lineHeight: 1.25,
                boxSizing: 'border-box'
              }}
            >
              {/* Encabezado del Reverso */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #1e3a8a', paddingBottom: '4px', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: 900, color: '#1e3a8a', margin: 0 }}>
                  PLAZO DE DERECHO DE RESCATE (MENSUAL)
                </h2>
                <div style={{ fontSize: '9px', color: '#374151' }}>
                  Vencimiento del plazo de rescate: <span style={{ textDecoration: 'underline', fontWeight: 700 }}>{dueDateStr}</span>
                </div>
              </div>

              {/* Título Tabla 1 */}
              <div style={{ textAlign: 'center', margin: '6px 0 4px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#1e3a8a', margin: 0, letterSpacing: '0.05em' }}>
                  PRÓRROGAS
                </h3>
              </div>

              {/* Tabla 1: PRÓRROGAS (1 a 10) */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '9px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', textAlign: 'center' }}>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '16%' }}>Fecha</th>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '16%' }}>Monto Interés mensual</th>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '24%' }}>Gastos administrativos Conservación y cuidado Mensual</th>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '14%' }}>Total a pagar</th>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '16%' }}>FECHA DE VENCIMIENTO</th>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '14%' }}>FIRMA</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    '1ra Prórroga', '2da Prórroga', '3ra Prórroga', '4ta Prórroga', '5ta Prórroga',
                    '6ta Prórroga', '7ma Prórroga', '8va Prórroga', '9na Prórroga', '10ma Prórroga'
                  ].map((label, idx) => {
                    const pago = prorrogas[idx];
                    return (
                      <tr key={idx} style={{ height: '22px' }}>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textAlign: 'left', fontWeight: pago ? 700 : 400 }}>
                          {pago ? new Date(pago.date).toLocaleDateString('es-PE') : label}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textAlign: 'center' }}>
                          {pago ? pago.interestPortion.toFixed(2) : ''}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textAlign: 'center' }}>
                          {pago ? (pago.amount - pago.interestPortion).toFixed(2) : ''}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textAlign: 'center', fontWeight: 700 }}>
                          {pago ? pago.amount.toFixed(2) : ''}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textAlign: 'center', color: '#b91c1c' }}>
                          {pago?.newDueDate ? new Date(pago.newDueDate).toLocaleDateString('es-PE') : '/     /'}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textAlign: 'center', fontFamily: 'cursive', fontSize: '11px' }}>
                          {pago ? loan.customerName.split(' ')[0] : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Título Tabla 2 */}
              <div style={{ textAlign: 'center', margin: '6px 0 4px', borderTop: '1px dashed #1e3a8a', paddingTop: '6px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#1e3a8a', margin: 0, letterSpacing: '0.05em' }}>
                  A CUENTA O ANTICIPOS
                </h3>
              </div>

              {/* Tabla 2: A CUENTA O ANTICIPOS (1 a 10) */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', textAlign: 'center' }}>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '6%' }}>N°</th>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '16%' }}>MONTO</th>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '46%' }}>LITERAL</th>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '18%' }}>FECHA</th>
                    <th style={{ border: '1px solid #1e3a8a', padding: '3px 4px', width: '14%' }}>FIRMA</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, idx) => {
                    const anticipo = anticipos[idx];
                    return (
                      <tr key={num} style={{ height: '22px' }}>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textAlign: 'center', fontWeight: 700 }}>
                          {num}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textAlign: 'right', fontWeight: 800 }}>
                          {anticipo ? `Bs. ${anticipo.capitalPortion.toFixed(2)}` : 'Bs.'}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textTransform: 'uppercase', fontSize: '8.5px' }}>
                          {anticipo ? numeroALiteral(anticipo.capitalPortion) : ''}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textAlign: 'center' }}>
                          {anticipo ? new Date(anticipo.date).toLocaleDateString('es-PE') : '/     /'}
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '2px 4px', textAlign: 'center', fontFamily: 'cursive', fontSize: '11px' }}>
                          {anticipo ? loan.customerName.split(' ')[0] : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

