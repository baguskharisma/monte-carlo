'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import type { TravelDocument } from '@/types/travel-document.types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface TravelDocumentPDFProps {
  document: TravelDocument
  onGenerate?: (blob: Blob) => void
}

export function TravelDocumentPDF({ document, onGenerate }: TravelDocumentPDFProps) {
  const generatePDF = () => {
    const doc = new jsPDF()

    const schedule = document.schedule
    const route = schedule?.route
    const vehicle = schedule?.vehicle

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('SURAT JALAN', 105, 20, { align: 'center' })

    // Document Number and Date
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nomor: ${document.documentNumber}`, 20, 35)
    doc.text(
      `Tanggal: ${document.issuedAt ? new Date(document.issuedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}`,
      20,
      42
    )

    // Schedule Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMASI JADWAL', 20, 55)

    autoTable(doc, {
      startY: 60,
      head: [['Detail', 'Informasi']],
      body: [
        ['Rute', route ? `${route.origin} → ${route.destination}` : 'N/A'],
        [
          'Waktu Keberangkatan',
          schedule?.departureTime
            ? new Date(schedule.departureTime).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'N/A',
        ],
        [
          'Waktu Tiba',
          schedule?.arrivalTime
            ? new Date(schedule.arrivalTime).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Belum ditentukan',
        ],
        ['Jarak', route ? `${route.distance} km` : 'N/A'],
        ['Estimasi Durasi', route ? `${route.estimatedDuration} menit` : 'N/A'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
    })

    // Driver Information
    const lastY = (doc as any).lastAutoTable.finalY || 60
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMASI DRIVER', 20, lastY + 15)

    autoTable(doc, {
      startY: lastY + 20,
      head: [['Detail', 'Informasi']],
      body: [
        ['Nama', document.driverName || 'N/A'],
        ['No. Telepon', document.driverPhone || 'N/A'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
    })

    // Vehicle Information
    const lastY2 = (doc as any).lastAutoTable.finalY || 60
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMASI KENDARAAN', 20, lastY2 + 15)

    autoTable(doc, {
      startY: lastY2 + 20,
      head: [['Detail', 'Informasi']],
      body: [
        ['Nomor Polisi', vehicle?.vehicleNumber || 'N/A'],
        ['Jenis', vehicle?.type || 'N/A'],
        ['Merk/Model', vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'],
        ['Kapasitas', vehicle ? `${vehicle.capacity} penumpang` : 'N/A'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
    })

    // Passenger Manifest Table
    let currentY = (doc as any).lastAutoTable.finalY || 60
    const passengerCount = document.passengers ? document.passengers.length : document.totalPassengers

    if (document.passengers && document.passengers.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('DAFTAR PENUMPANG', 20, currentY + 15)

      const passengerData = document.passengers.map((p, idx) => [
        (idx + 1).toString(),
        p.name,
        p.identityNumber || '-',
        p.phone || '-',
        p.seatNumber || '-',
      ])

      autoTable(doc, {
        startY: currentY + 20,
        head: [['No.', 'Nama', 'No. Identitas', 'Telepon', 'Kursi']],
        body: passengerData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 15 },
          2: { cellWidth: 40, font: 'courier' },
          4: { cellWidth: 20, halign: 'center' },
        },
      })

      currentY = (doc as any).lastAutoTable.finalY || currentY
    } else {
      // Fallback if no passenger details
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMASI PENUMPANG', 20, currentY + 15)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Jumlah Penumpang: ${passengerCount} orang`, 20, currentY + 22)

      currentY = currentY + 30
    }

    // Cost Breakdown Table
    const fuelCost = document.fuelCost || document.schedule?.fuelCost || 0
    const driverWage = document.driverWage || document.schedule?.driverWage || 0
    const snackCost = document.snackCost || document.schedule?.snackCost || 0
    const totalCost = fuelCost + driverWage + snackCost

    if (totalCost > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('RINCIAN BIAYA', 20, currentY + 15)

      const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(amount)
      }

      const costData = []
      if (fuelCost > 0) costData.push(['Biaya Bahan Bakar', formatRupiah(fuelCost)])
      if (driverWage > 0) costData.push(['Upah Driver', formatRupiah(driverWage)])
      if (snackCost > 0) costData.push(['Biaya Snack', formatRupiah(snackCost)])
      costData.push(['TOTAL BIAYA OPERASIONAL', formatRupiah(totalCost)])

      autoTable(doc, {
        startY: currentY + 20,
        head: [['Kategori', 'Jumlah']],
        body: costData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        columnStyles: {
          1: { halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: (data) => {
          if (data.row.index === costData.length - 1) {
            data.cell.styles.fillColor = [240, 240, 240]
            data.cell.styles.fontStyle = 'bold'
          }
        },
      })

      currentY = (doc as any).lastAutoTable.finalY || currentY
    }

    // Notes (if any)
    if (document.notes) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('CATATAN:', 20, currentY + 15)
      doc.setFont('helvetica', 'normal')
      const splitNotes = doc.splitTextToSize(document.notes, 170)
      doc.text(splitNotes, 20, currentY + 21)
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text(
      `Diterbitkan oleh: ${document.issuedBy?.name || 'Admin'}`,
      20,
      pageHeight - 20
    )
    doc.text(
      `Tanggal Terbit: ${document.issuedAt ? new Date(document.issuedAt).toLocaleString('id-ID') : '-'}`,
      20,
      pageHeight - 15
    )

    // Generate blob if callback provided
    if (onGenerate) {
      const blob = doc.output('blob')
      onGenerate(blob)
    }

    // Download PDF
    doc.save(`travel-document-${document.documentNumber}.pdf`)
  }

  return (
    <Button onClick={generatePDF}>
      <Printer className="mr-2 h-4 w-4" />
      Download PDF
    </Button>
  )
}
